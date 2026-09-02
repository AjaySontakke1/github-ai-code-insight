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

            String message = e.getMessage();

            if (message == null || message.isBlank()) {
                message = "Analysis failed unexpectedly.";
            }

            job.setError(message);
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
                        40000
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
                owner,
                repository.getDefaultBranch(),
                sourceFiles.size(),
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
            int maxCharacters) {

        List<List<CodeFile>> batches = new ArrayList<>();

        List<CodeFile> currentBatch = new ArrayList<>();

        int currentCharacters = 0;

        for (CodeFile file : files) {

            int fileCharacters =
                    file.getContent() == null
                            ? 0
                            : file.getContent().length();

            /*
             * If adding this file would make the batch too large,
             * finish the current batch first.
             */
            if (!currentBatch.isEmpty()
                    && currentCharacters + fileCharacters > maxCharacters) {

                batches.add(currentBatch);

                currentBatch = new ArrayList<>();

                currentCharacters = 0;
            }

            currentBatch.add(file);

            currentCharacters += fileCharacters;
        }

        if (!currentBatch.isEmpty()) {
            batches.add(currentBatch);
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
                You are an expert Java and Spring Boot code reviewer.

                Review the source files provided below.

                Your goal is to find real, actionable problems.

                CHECK THESE AREAS:

                1. BUG
                - Null pointer risks
                - Incorrect conditions
                - Incorrect exception handling
                - Logic errors
                - Incorrect API usage

                2. SECURITY
                - Hardcoded secrets
                - Authentication problems
                - Authorization problems
                - Unsafe user input
                - Sensitive data exposure
                - Insecure configuration

                3. PERFORMANCE
                - Unnecessary database/API calls
                - Inefficient loops
                - Repeated expensive operations
                - Unnecessary object creation
                - Poor collection usage

                4. CODE_QUALITY
                - Very duplicated code
                - Poor naming
                - Large or overly complex methods
                - Bad separation of responsibilities
                - Poor exception handling
                - Maintainability problems

                IMPORTANT RULES:

                - Analyze ONLY the files provided.
                - Do not invent code that is not present.
                - Do not report theoretical problems without evidence.
                - Do not report normal coding choices as problems.
                - Prefer fewer accurate issues over many false positives.
                - Every issue must point to a specific file.
                - Every issue must include an approximate line number.
                - Severity must be one of:
                  CRITICAL, HIGH, MEDIUM, LOW.
                - Confidence must be one of:
                  HIGH, MEDIUM, LOW.
                - Explain the problem in simple language.
                - Give a practical fix.
                - Do not generate duplicate issues for the same problem.

                RETURN ONLY JSON.

                Do NOT use Markdown.
                Do NOT use ```json.
                Do NOT add explanations outside the JSON.

                Use exactly this structure:

                {
                  "repository": "",
                  "score": 0,
                  "issues": [
                    {
                      "file": "",
                      "line": 0,
                      "severity": "",
                      "category": "",
                      "confidence": "",
                      "problem": "",
                      "suggestion": ""
                    }
                  ],
                  "bugs": 0,
                  "security": 0,
                  "performance": 0,
                  "codeQuality": 0
                }

                The application calculates the final score.
                Do not calculate the score yourself.

                SOURCE FILES:

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
