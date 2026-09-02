package com.ajay.githubaicodeinsight.controller;

import com.ajay.githubaicodeinsight.dto.RepositoryDto;
import com.ajay.githubaicodeinsight.dto.RepositoryTreeResponse;
import com.ajay.githubaicodeinsight.service.GitHubRepositoryService;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClient;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientService;
import org.springframework.security.oauth2.client.annotation.RegisteredOAuth2AuthorizedClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
public class RepositoryController {

    private final GitHubRepositoryService gitHubRepositoryService;
    private final OAuth2AuthorizedClientService authorizedClientService;

    public RepositoryController(
            GitHubRepositoryService gitHubRepositoryService,
            OAuth2AuthorizedClientService authorizedClientService) {
        this.gitHubRepositoryService = gitHubRepositoryService;
        this.authorizedClientService = authorizedClientService;
    }

    @GetMapping("/api/github/repositories")
    public List<Map<String, Object>> getRepositories() {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        OAuth2AuthorizedClient authorizedClient =
                authorizedClientService.loadAuthorizedClient(
                        "github",
                        authentication.getName()
                );

        String accessToken =
                authorizedClient.getAccessToken().getTokenValue();

        return gitHubRepositoryService.getUserRepositories(accessToken);
    }

    @GetMapping("/api/github/repository/{owner}/{repo}/files")
    public RepositoryTreeResponse getRepositoryFiles(
            @PathVariable String owner,
            @PathVariable String repo,
            @RegisteredOAuth2AuthorizedClient("github") OAuth2AuthorizedClient authorizedClient) {

        String accessToken = authorizedClient
                .getAccessToken()
                .getTokenValue();

        RepositoryDto repository = gitHubRepositoryService.getRepository(
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

    @GetMapping("/api/github/repository/{owner}/{repo}/file")
    public String getFileContent(
            @PathVariable String owner,
            @PathVariable String repo,
            @RequestParam String path,
            @RegisteredOAuth2AuthorizedClient("github") OAuth2AuthorizedClient authorizedClient) {

        String accessToken = authorizedClient
                .getAccessToken()
                .getTokenValue();

        return gitHubRepositoryService.getFileContent(
                accessToken,
                owner,
                repo,
                path
        );
    }
}
