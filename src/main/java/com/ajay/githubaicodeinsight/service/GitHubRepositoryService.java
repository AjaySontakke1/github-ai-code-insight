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

    public List<RepositoryDto> getRepositories(
            String accessToken,
            int page,
            int size,
            String search) {

        String uri = "https://api.github.com/user/repos"
                + "?page=" + page
                + "&per_page=" + size
                + "&sort=updated";

        List<RepositoryDto> repositories = restClient.get()
                .uri(uri)
                .header("Authorization", "Bearer " + accessToken)
                .retrieve()
                .body(new ParameterizedTypeReference<List<RepositoryDto>>() {});

        if (search == null || search.isBlank()) {
            return repositories;
        }

        return repositories.stream()
                .filter(repo ->
                        repo.getName()
                                .toLowerCase()
                                .contains(search.toLowerCase())
                )
                .toList();
    }
}
