package com.ajay.githubaicodeinsight.controller;

import com.ajay.githubaicodeinsight.dto.RepositoryResponse;
import com.ajay.githubaicodeinsight.service.GitHubService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class GitHubController {

    private final GitHubService gitHubService;

    public GitHubController(GitHubService gitHubService) {
        this.gitHubService = gitHubService;
    }

    @GetMapping("/api/github/repository/{owner}/{repo}")
    public RepositoryResponse getRepository(
            @PathVariable String owner,
            @PathVariable String repo
    ) {
        return gitHubService.getRepository(owner, repo);
    }
}
