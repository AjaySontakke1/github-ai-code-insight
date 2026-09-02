package com.ajay.githubaicodeinsight.controller;

import com.ajay.githubaicodeinsight.service.GitHubRepositoryService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClient;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientService;
import org.springframework.security.web.authentication.logout.SecurityContextLogoutHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class UserController {

    private final GitHubRepositoryService gitHubRepositoryService;
    private final OAuth2AuthorizedClientService authorizedClientService;

    public UserController(
            GitHubRepositoryService gitHubRepositoryService,
            OAuth2AuthorizedClientService authorizedClientService) {
        this.gitHubRepositoryService = gitHubRepositoryService;
        this.authorizedClientService = authorizedClientService;
    }

    @GetMapping("/api/github/me")
    public Map<String, Object> getCurrentUser() {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        OAuth2AuthorizedClient authorizedClient =
                authorizedClientService.loadAuthorizedClient(
                        "github",
                        authentication.getName()
                );

        String accessToken =
                authorizedClient.getAccessToken().getTokenValue();

        return gitHubRepositoryService.getCurrentUser(accessToken);
    }

    @PostMapping("/api/auth/logout")
    public ResponseEntity<Void> logout(
            HttpServletRequest request,
            HttpServletResponse response) {

        SecurityContextLogoutHandler logoutHandler =
                new SecurityContextLogoutHandler();

        logoutHandler.logout(
                request,
                response,
                SecurityContextHolder.getContext().getAuthentication()
        );

        return ResponseEntity.ok().build();
    }
}
