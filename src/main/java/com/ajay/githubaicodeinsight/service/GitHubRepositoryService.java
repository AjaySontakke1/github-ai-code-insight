package com.ajay.githubaicodeinsight.service;

import com.ajay.githubaicodeinsight.dto.RepositoryDto;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.List;

@Service
public class GitHubRepositoryService {

    private final RestClient restClient;

    public GitHubRepositoryService(RestClient.Builder restClientBuilder) {
        this.restClient = restClientBuilder.build();
    }

    public List<RepositoryDto> getRepositories(String accessToken) {
        return restClient.get()
                .uri("https://api.github.com/user/repos")
                .header("Authorization", "Bearer " + accessToken)
                .retrieve()
                .body(new ParameterizedTypeReference<List<RepositoryDto>>() {});
    }
}
