package com.ajay.githubaicodeinsight.dto;

public class AnalysisRequest {

    private String owner;
    private String repo;

    public AnalysisRequest() {
    }

    public AnalysisRequest(String owner, String repo) {
        this.owner = owner;
        this.repo = repo;
    }

    public String getOwner() {
        return owner;
    }

    public void setOwner(String owner) {
        this.owner = owner;
    }

    public String getRepo() {
        return repo;
    }

    public void setRepo(String repo) {
        this.repo = repo;
    }
}
