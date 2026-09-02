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

    private String buildAnalysisPrompt(List<CodeFile> sourceFiles) {

        StringBuilder prompt = new StringBuilder();

        prompt.append("""
                You are an experienced software engineer performing a careful
                code review.

                Analyze ONLY the source code provided below.

                Find genuine issues in these categories:

                1. BUG
                   - Logic errors
                   - Null pointer risks
                   - Incorrect conditions
                   - Exception handling problems
                   - Resource handling problems

                2. SECURITY
                   - Hardcoded secrets
                   - Authentication problems
                   - Authorization problems
                   - Unsafe input handling
                   - Sensitive data exposure
                   - Injection vulnerabilities

                3. PERFORMANCE
                   - Unnecessary loops
                   - Repeated database/API calls
                   - Inefficient data processing
                   - Clearly avoidable expensive operations

                4. CODE_QUALITY
                   - Duplicate code
                   - Very large methods
                   - Poor maintainability
                   - Poor naming
                   - Unnecessary complexity

                For every genuine issue return:

                - file: exact file path
                - line: approximate line number, or 0 if uncertain
                - severity: LOW, MEDIUM, HIGH, or CRITICAL
                - category: BUG, SECURITY, PERFORMANCE, or CODE_QUALITY
                - confidence: LOW, MEDIUM, or HIGH
                - problem: explain what is wrong in simple language
                - suggestion: explain how a developer could improve it

                Important rules:

                - Analyze only the provided code.
                - Do not invent vulnerabilities.
                - Do not report something merely because it could theoretically
                  be improved.
                - Do not modify the source code.
                - Do not include compliments or general comments.
                - Report only meaningful issues.
                - If there are no genuine issues, return an empty issues array.
                - Use line 0 when you cannot confidently determine the line.
                - Set confidence to HIGH only when the provided code clearly supports the finding.
                - Use MEDIUM when the finding is likely but some context is missing.
                - Use LOW when the finding is only a possible concern.
                - Return ONLY valid JSON.
                - Do not use Markdown.
                - Do not put the JSON inside ```.

                The score should be between 0 and 100.
                100 means no significant issues were found.
                Lower scores should reflect the number and severity of issues.

                Return exactly this JSON structure:

                {
                  "repository": "repository-name",
                  "score": 85,
                  "issues": [
                    {
                      "file": "src/example/UserService.java",
                      "line": 42,
                      "severity": "HIGH",
                      "category": "SECURITY",
                      "confidence": "HIGH",
                      "problem": "Explain the actual problem here.",
                      "suggestion": "Explain what the developer should consider changing."
                    }
                  ]
                }

                Source code:
                """);

        for (CodeFile file : sourceFiles) {

            prompt.append("\n\n--- FILE: ")
                    .append(file.getPath())
                    .append(" ---\n");

            prompt.append(file.getContent());
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
