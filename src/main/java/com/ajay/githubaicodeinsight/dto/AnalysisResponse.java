package com.ajay.githubaicodeinsight.dto;

import java.util.List;

public class AnalysisResponse {

    private String repository;
    private String owner;
    private String branch;
    private int filesAnalyzed;
    private int score;
    private List<IssueDto> issues;
    private int bugs;
    private int security;
    private int performance;
    private int codeQuality;

    public AnalysisResponse() {
    }

    public AnalysisResponse(
            String repository,
            int score,
            List<IssueDto> issues,
            int bugs,
            int security,
            int performance,
            int codeQuality) {

        this.repository = repository;
        this.score = score;
        this.issues = issues;
        this.bugs = bugs;
        this.security = security;
        this.performance = performance;
        this.codeQuality = codeQuality;
    }

    public AnalysisResponse(
            String repository,
            String owner,
            String branch,
            int filesAnalyzed,
            int score,
            List<IssueDto> issues,
            int bugs,
            int security,
            int performance,
            int codeQuality) {

        this.repository = repository;
        this.owner = owner;
        this.branch = branch;
        this.filesAnalyzed = filesAnalyzed;
        this.score = score;
        this.issues = issues;
        this.bugs = bugs;
        this.security = security;
        this.performance = performance;
        this.codeQuality = codeQuality;
    }

    public String getRepository() {
        return repository;
    }

    public String getOwner() {
        return owner;
    }

    public String getBranch() {
        return branch;
    }

    public int getFilesAnalyzed() {
        return filesAnalyzed;
    }

    public int getScore() {
        return score;
    }

    public List<IssueDto> getIssues() {
        return issues;
    }

    public int getBugs() {
        return bugs;
    }

    public int getSecurity() {
        return security;
    }

    public int getPerformance() {
        return performance;
    }

    public int getCodeQuality() {
        return codeQuality;
    }
}
