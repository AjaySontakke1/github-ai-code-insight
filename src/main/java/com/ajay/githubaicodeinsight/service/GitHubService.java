package com.ajay.githubaicodeinsight.service;

import com.ajay.githubaicodeinsight.dto.RepositoryResponse;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

@Service
public class GitHubService {

    private final RestClient restClient;

    public GitHubService(RestClient.Builder restClientBuilder) {
        this.restClient = restClientBuilder.build();
    }

    public RepositoryResponse getRepository(String owner, String repo) {
        return restClient.get()
                .uri("https://api.github.com/repos/{owner}/{repo}", owner, repo)
                .retrieve()
                .body(RepositoryResponse.class);
    }
}
