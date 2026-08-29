package com.ajay.githubaicodeinsight.controller;

import com.ajay.githubaicodeinsight.dto.RepositoryDto;
import com.ajay.githubaicodeinsight.dto.RepositoryPageResponse;
import com.ajay.githubaicodeinsight.dto.RepositoryTreeResponse;
import com.ajay.githubaicodeinsight.service.GitHubRepositoryService;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClient;
import org.springframework.security.oauth2.client.annotation.RegisteredOAuth2AuthorizedClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class RepositoryController {

    private final GitHubRepositoryService gitHubRepositoryService;

    public RepositoryController(GitHubRepositoryService gitHubRepositoryService) {
        this.gitHubRepositoryService = gitHubRepositoryService;
    }

    @GetMapping("/api/github/repositories")
    public RepositoryPageResponse getRepositories(
            @RegisteredOAuth2AuthorizedClient("github") OAuth2AuthorizedClient authorizedClient,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {

        String accessToken = authorizedClient
                .getAccessToken()
                .getTokenValue();

        return gitHubRepositoryService.getRepositories(accessToken, page, size);
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
