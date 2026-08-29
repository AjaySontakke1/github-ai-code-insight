package com.ajay.githubaicodeinsight.controller;

import com.ajay.githubaicodeinsight.service.GitHubRepositoryService;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClient;
import org.springframework.security.oauth2.client.annotation.RegisteredOAuth2AuthorizedClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class RepositoryController {

    private final GitHubRepositoryService gitHubRepositoryService;

    public RepositoryController(GitHubRepositoryService gitHubRepositoryService) {
        this.gitHubRepositoryService = gitHubRepositoryService;
    }

    @GetMapping("/api/github/repositories")
    public String getRepositories(
            @RegisteredOAuth2AuthorizedClient("github") OAuth2AuthorizedClient authorizedClient) {

        String accessToken = authorizedClient
                .getAccessToken()
                .getTokenValue();

        return gitHubRepositoryService.getRepositories(accessToken);
    }
}
