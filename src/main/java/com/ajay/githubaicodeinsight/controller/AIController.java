package com.ajay.githubaicodeinsight.controller;

import com.ajay.githubaicodeinsight.dto.AnalysisJob;
import com.ajay.githubaicodeinsight.dto.AnalysisRequest;
import com.ajay.githubaicodeinsight.service.AIAnalysisService;
import com.ajay.githubaicodeinsight.service.AnalysisJobService;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClient;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
public class AIController {

    private final AIAnalysisService aiAnalysisService;
    private final AnalysisJobService analysisJobService;
    private final OAuth2AuthorizedClientService authorizedClientService;

    public AIController(
            AIAnalysisService aiAnalysisService,
            AnalysisJobService analysisJobService,
            OAuth2AuthorizedClientService authorizedClientService) {

        this.aiAnalysisService = aiAnalysisService;
        this.analysisJobService = analysisJobService;
        this.authorizedClientService = authorizedClientService;
    }

    @PostMapping("/api/ai/analyze")
    public AnalysisJob startAnalysis(
            @RequestBody AnalysisRequest request) {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        OAuth2AuthorizedClient authorizedClient =
                authorizedClientService.loadAuthorizedClient(
                        "github",
                        authentication.getName()
                );

        String accessToken =
                authorizedClient
                        .getAccessToken()
                        .getTokenValue();

        AnalysisJob job =
                analysisJobService.createJob(
                        authentication.getName(),
                        request.getOwner(),
                        request.getRepo()
                );

        aiAnalysisService.analyzeRepositoryAsync(
                job,
                accessToken
        );

        return job;
    }

    @GetMapping("/api/ai/analysis/{id}")
    public AnalysisJob getAnalysis(
            @PathVariable UUID id) {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        return analysisJobService.getJob(
                id,
                authentication.getName()
        );
    }
}
