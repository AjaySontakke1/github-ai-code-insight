package com.ajay.githubaicodeinsight.dto;

import java.util.UUID;

public class AnalysisJob {

    private UUID id;
    private String username;
    private String owner;
    private String repo;
    private AnalysisStatus status;
    private AnalysisResponse result;
    private String error;

    public AnalysisJob() {
    }

    public AnalysisJob(
            UUID id,
            String username,
            String owner,
            String repo) {

        this.id = id;
        this.username = username;
        this.owner = owner;
        this.repo = repo;
        this.status = AnalysisStatus.STARTED;
    }

    public UUID getId() {
        return id;
    }

    public String getUsername() {
        return username;
    }

    public String getOwner() {
        return owner;
    }

    public String getRepo() {
        return repo;
    }

    public AnalysisStatus getStatus() {
        return status;
    }

    public AnalysisResponse getResult() {
        return result;
    }

    public String getError() {
        return error;
    }

    public void setStatus(AnalysisStatus status) {
        this.status = status;
    }

    public void setResult(AnalysisResponse result) {
        this.result = result;
    }

    public void setError(String error) {
        this.error = error;
    }
}
