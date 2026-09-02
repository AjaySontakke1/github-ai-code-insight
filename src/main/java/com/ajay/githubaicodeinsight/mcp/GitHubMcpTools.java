package com.ajay.githubaicodeinsight.mcp;

import com.ajay.githubaicodeinsight.dto.RepositoryDto;
import com.ajay.githubaicodeinsight.dto.RepositoryTreeResponse;
import com.ajay.githubaicodeinsight.service.GitHubRepositoryService;
import org.springframework.ai.mcp.annotation.McpTool;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClient;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientService;
import org.springframework.stereotype.Component;

@Component
public class GitHubMcpTools {

    private final GitHubRepositoryService gitHubRepositoryService;
    private final OAuth2AuthorizedClientService authorizedClientService;

    public GitHubMcpTools(
            GitHubRepositoryService gitHubRepositoryService,
            OAuth2AuthorizedClientService authorizedClientService) {

        this.gitHubRepositoryService = gitHubRepositoryService;
        this.authorizedClientService = authorizedClientService;
    }

    @McpTool(name = "getRepository", description = "Get information about a GitHub repository")
    public RepositoryDto getRepository(
            String owner,
            String repo) {

        String accessToken = getAccessToken();

        return gitHubRepositoryService.getRepository(
                accessToken,
                owner,
                repo
        );
    }

    @McpTool(name = "getFileTree", description = "Get the file and folder structure of a GitHub repository")
    public RepositoryTreeResponse getFileTree(
            String owner,
            String repo) {

        String accessToken = getAccessToken();

        RepositoryDto repository =
                gitHubRepositoryService.getRepository(
                        accessToken,
                        owner,
                        repo
                );

        return gitHubRepositoryService.getRepositoryTree(
                accessToken,
                owner,
                repo,
                repository.getDefaultBranch()
        );
    }

    @McpTool(name = "readFile", description = "Read the contents of a file from a GitHub repository")
    public String readFile(
            String owner,
            String repo,
            String path) {

        String accessToken = getAccessToken();

        return gitHubRepositoryService.getFileContent(
                accessToken,
                owner,
                repo,
                path
        );
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
