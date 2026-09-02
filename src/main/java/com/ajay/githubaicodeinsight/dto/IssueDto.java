package com.ajay.githubaicodeinsight.dto;

public class IssueDto {

    private String file;
    private int line;
    private String severity;
    private String category;
    private String confidence;
    private String problem;
    private String suggestion;

    public IssueDto() {
    }

    public IssueDto(
            String file,
            int line,
            String severity,
            String category,
            String confidence,
            String problem,
            String suggestion) {

        this.file = file;
        this.line = line;
        this.severity = severity;
        this.category = category;
        this.confidence = confidence;
        this.problem = problem;
        this.suggestion = suggestion;
    }

    public String getFile() {
        return file;
    }

    public int getLine() {
        return line;
    }

    public String getSeverity() {
        return severity;
    }

    public String getCategory() {
        return category;
    }

    public String getConfidence() {
        return confidence;
    }

    public String getProblem() {
        return problem;
    }

    public String getSuggestion() {
        return suggestion;
    }
}
