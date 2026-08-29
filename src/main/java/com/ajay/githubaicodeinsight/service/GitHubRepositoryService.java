package com.ajay.githubaicodeinsight.service;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

@Service
public class GitHubRepositoryService {

    private final RestClient restClient;

    public GitHubRepositoryService(RestClient.Builder restClientBuilder) {
        this.restClient = restClientBuilder.build();
    }

    public String getRepositories(String accessToken) {
        return restClient.get()
                .uri("https://api.github.com/user/repos")
                .header("Authorization", "Bearer " + accessToken)
                .retrieve()
                .body(String.class);
    }
}
