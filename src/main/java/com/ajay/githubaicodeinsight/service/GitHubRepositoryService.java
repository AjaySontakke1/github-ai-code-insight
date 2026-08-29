package com.ajay.githubaicodeinsight.service;

import com.ajay.githubaicodeinsight.dto.RepositoryDto;
import com.ajay.githubaicodeinsight.dto.RepositoryPageResponse;
import com.ajay.githubaicodeinsight.dto.RepositoryTreeResponse;
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

    public RepositoryPageResponse getRepositories(
            String accessToken,
            int page,
            int size) {

        String uri = "https://api.github.com/user/repos"
                + "?page=" + page
                + "&per_page=" + size
                + "&sort=updated";

        List<RepositoryDto> repositories = restClient.get()
                .uri(uri)
                .header("Authorization", "Bearer " + accessToken)
                .retrieve()
                .body(new ParameterizedTypeReference<List<RepositoryDto>>() {});

        boolean hasNext = repositories.size() == size;

        return new RepositoryPageResponse(
                repositories,
                page,
                size,
                hasNext
        );
    }

    public RepositoryTreeResponse getRepositoryTree(
            String accessToken,
            String owner,
            String repo,
            String branch) {

        String uri = "https://api.github.com/repos/"
                + owner + "/"
                + repo + "/git/trees/"
                + branch
                + "?recursive=1";

        return restClient.get()
                .uri(uri)
                .header("Authorization", "Bearer " + accessToken)
                .retrieve()
                .body(RepositoryTreeResponse.class);
    }

    public RepositoryDto getRepository(
            String accessToken,
            String owner,
            String repo) {

        String uri = "https://api.github.com/repos/"
                + owner + "/" + repo;

        return restClient.get()
                .uri(uri)
                .header("Authorization", "Bearer " + accessToken)
                .retrieve()
                .body(RepositoryDto.class);
    }
}
