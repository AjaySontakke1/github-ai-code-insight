package com.ajay.githubaicodeinsight.service;

import com.ajay.githubaicodeinsight.dto.AnalysisJob;
import com.ajay.githubaicodeinsight.dto.AnalysisResponse;
import com.ajay.githubaicodeinsight.dto.AnalysisStatus;
import com.ajay.githubaicodeinsight.dto.CodeFile;
import com.ajay.githubaicodeinsight.dto.IssueDto;
import com.ajay.githubaicodeinsight.dto.RepositoryDto;
import com.ajay.githubaicodeinsight.dto.RepositoryTreeResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.scheduling.annotation.Async;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClient;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientService;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AIAnalysisService {

    private final ChatClient chatClient;
    private final GitHubRepositoryService gitHubRepositoryService;
    private final OAuth2AuthorizedClientService authorizedClientService;
    private final ObjectMapper objectMapper;

    public AIAnalysisService(
            ChatClient.Builder chatClientBuilder,
            GitHubRepositoryService gitHubRepositoryService,
            OAuth2AuthorizedClientService authorizedClientService,
            ObjectMapper objectMapper) {

        this.chatClient = chatClientBuilder.build();
        this.gitHubRepositoryService = gitHubRepositoryService;
        this.authorizedClientService = authorizedClientService;
        this.objectMapper = objectMapper;
    }

    public String testAI() {

        return chatClient
                .prompt()
                .user("Explain what a NullPointerException is in simple language.")
                .call()
                .content();
    }

    @Async
    public void analyzeRepositoryAsync(
            AnalysisJob job,
            String accessToken) {

        try {

            job.setStatus(AnalysisStatus.ANALYZING);

            AnalysisResponse result =
                    analyzeRepository(
                            accessToken,
                            job.getOwner(),
                            job.getRepo()
                    );

            job.setResult(result);
            job.setStatus(AnalysisStatus.COMPLETED);

        } catch (Exception e) {

            job.setStatus(AnalysisStatus.FAILED);
            job.setError(e.getMessage());
        }
    }

    public AnalysisResponse analyzeRepository(
            String accessToken,
            String owner,
            String repo) {

        RepositoryDto repository =
                gitHubRepositoryService.getRepository(
                        accessToken,
                        owner,
                        repo
                );

        RepositoryTreeResponse tree =
                gitHubRepositoryService.getRepositoryTree(
                        accessToken,
                        owner,
                        repo,
                        repository.getDefaultBranch()
                );

        List<CodeFile> sourceFiles =
                getSourceFiles(
                        accessToken,
                        owner,
                        repo,
                        tree
                );

        List<List<CodeFile>> batches =
                createBatches(
                        sourceFiles,
                        10
                );

        List<IssueDto> allIssues =
                new ArrayList<>();

        for (List<CodeFile> batch : batches) {

            AnalysisResponse batchResult =
                    analyzeBatch(
                            batch,
                            repository.getName()
                    );

            if (batchResult != null && batchResult.getIssues() != null) {
                allIssues.addAll(
                        batchResult.getIssues()
                );
            }
        }

        List<IssueDto> uniqueIssues =
                removeDuplicates(allIssues);

        int score =
                calculateScore(uniqueIssues);

        int bugs =
                countCategory(uniqueIssues, "BUG");

        int security =
                countCategory(uniqueIssues, "SECURITY");

        int performance =
                countCategory(uniqueIssues, "PERFORMANCE");

        int codeQuality =
                countCategory(uniqueIssues, "CODE_QUALITY");

        return new AnalysisResponse(
                repository.getName(),
                score,
                uniqueIssues,
                bugs,
                security,
                performance,
                codeQuality
        );
    }

    private AnalysisResponse analyzeBatch(
            List<CodeFile> batch,
            String repositoryName) {

        String prompt =
                buildAnalysisPrompt(batch);

        String aiResponse =
                askAI(prompt);

        String cleanResponse =
                cleanJsonResponse(aiResponse);

        try {

            return objectMapper.readValue(
                    cleanResponse,
                    AnalysisResponse.class
            );

        } catch (Exception e) {

            throw new RuntimeException(
                    "Failed to parse AI batch response",
                    e
            );
        }
    }

    private List<IssueDto> removeDuplicates(
            List<IssueDto> issues) {

        return issues.stream()
                .collect(Collectors.toMap(
                        issue -> issue.getFile()
                                + "|" + issue.getLine()
                                + "|" + issue.getCategory()
                                + "|" + issue.getProblem(),

                        issue -> issue,

                        (first, second) -> first
                ))
                .values()
                .stream()
                .toList();
    }

    private int calculateScore(List<IssueDto> issues) {

        int score = 100;

        for (IssueDto issue : issues) {

            if (issue.getSeverity() == null) {
                continue;
            }

            switch (issue.getSeverity().toUpperCase()) {

                case "CRITICAL" -> score -= 25;

                case "HIGH" -> score -= 15;

                case "MEDIUM" -> score -= 8;

                case "LOW" -> score -= 3;

                default -> {
                    // Ignore unknown severity
                }
            }
        }

        return Math.max(score, 0);
    }

    private int countCategory(
            List<IssueDto> issues,
            String category) {

        return (int) issues.stream()
                .filter(issue ->
                        issue.getCategory() != null &&
                        category.equalsIgnoreCase(issue.getCategory()))
                .count();
    }

    private List<List<CodeFile>> createBatches(
            List<CodeFile> files,
            int batchSize) {

        List<List<CodeFile>> batches = new ArrayList<>();

        for (int i = 0; i < files.size(); i += batchSize) {

            int end =
                    Math.min(
                            i + batchSize,
                            files.size()
                    );

            batches.add(
                    files.subList(i, end)
            );
        }

        return batches;
    }

    private String cleanJsonResponse(String response) {

        response = response.trim();

        if (response.startsWith("```json")) {
            response = response.substring(7);
        } else if (response.startsWith("```")) {
            response = response.substring(3);
        }

        if (response.endsWith("```")) {
            response = response.substring(
                    0,
                    response.length() - 3
            );
        }

        return response.trim();
    }

    private String buildAnalysisPrompt(List<CodeFile> files) {

        StringBuilder prompt = new StringBuilder();

        prompt.append("""
                You are an expert software code reviewer.

                Analyze the following source code carefully.

                Your job is to identify REAL and IMPORTANT problems only.

                Analyze these categories:

                1. BUG
                2. SECURITY
                3. PERFORMANCE
                4. CODE_QUALITY

                Rules:

                - Analyze ONLY the code provided below.
                - Do not invent files, classes, methods, or problems.
                - Do not report something merely because it could theoretically be improved.
                - Report a problem only when there is reasonable evidence in the code.
                - Give the exact file path.
                - Give the approximate line number where the problem occurs.
                - Give severity as CRITICAL, HIGH, MEDIUM, or LOW.
                - Give confidence as HIGH, MEDIUM, or LOW.
                - Keep the problem explanation simple and specific.
                - Give a practical suggestion to fix the problem.
                - If there are no issues, return an empty issues array.
                - Return ONLY valid JSON.
                - Do NOT use Markdown.
                - Do NOT wrap the JSON inside ```json.

                JSON format:

                {
                  "repository": "repository name",
                  "score": 0,
                  "issues": [
                    {
                      "file": "src/example.java",
                      "line": 10,
                      "severity": "HIGH",
                      "category": "SECURITY",
                      "confidence": "HIGH",
                      "problem": "Short explanation of the problem",
                      "suggestion": "Practical suggestion to fix it"
                    }
                  ],
                  "bugs": 0,
                  "security": 0,
                  "performance": 0,
                  "codeQuality": 0
                }

                Important:
                The score will be calculated by the application.
                Do not try to calculate the final score yourself.

                Code to analyze:

                """);

        for (CodeFile file : files) {

            prompt.append("\n--- FILE: ")
                    .append(file.getPath())
                    .append(" ---\n");

            prompt.append(file.getContent());

            prompt.append("\n--- END FILE ---\n");
        }

        return prompt.toString();
    }

    private String askAI(String prompt) {

        return chatClient
                .prompt()
                .user(prompt)
                .call()
                .content();
    }

    private int getFilePriority(String path) {

        String lowerPath = path.toLowerCase();

        if (lowerPath.contains("security")
                || lowerPath.contains("auth")) {
            return 1;
        }

        if (lowerPath.contains("controller")) {
            return 2;
        }

        if (lowerPath.contains("service")) {
            return 3;
        }

        if (lowerPath.contains("repository")) {
            return 4;
        }

        if (lowerPath.contains("config")) {
            return 5;
        }

        if (lowerPath.endsWith(".java")) {
            return 6;
        }

        return 10;
    }

    private List<CodeFile> getSourceFiles(
            String accessToken,
            String owner,
            String repo,
            RepositoryTreeResponse tree) {

        return tree.getTree()
                .stream()
                .filter(file -> "blob".equals(file.getType()))
                .filter(file -> isAnalyzableFile(file.getPath()))
                .sorted(Comparator.comparingInt(
                        file -> getFilePriority(file.getPath())
                ))
                .map(file -> {

                    String content =
                            gitHubRepositoryService.getFileContent(
                                    accessToken,
                                    owner,
                                    repo,
                                    file.getPath()
                            );

                    return new CodeFile(
                            file.getPath(),
                            content
                    );
                })
                .toList();
    }

    private boolean isAnalyzableFile(String path) {

        return path.endsWith(".java")
                || path.endsWith(".xml")
                || path.endsWith(".properties")
                || path.endsWith(".yml")
                || path.endsWith(".yaml");
    }

    private String getAccessToken() {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        OAuth2AuthorizedClient authorizedClient =
                authorizedClientService.loadAuthorizedClient(
                        "github",
                        authentication.getName()
                );

        return authorizedClient
                .getAccessToken()
                .getTokenValue();
    }
}
