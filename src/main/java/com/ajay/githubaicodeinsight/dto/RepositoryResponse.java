package com.ajay.githubaicodeinsight.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;

public class RepositoryResponse {

    private Long id;
    private String name;

    @JsonProperty("fullName")
    @JsonAlias("full_name")
    private String fullName;

    private String description;
    private String language;

    @JsonProperty("stars")
    @JsonAlias("stargazers_count")
    private int stars;

    @JsonProperty("forks")
    @JsonAlias("forks_count")
    private int forks;

    @JsonProperty("private")
    private boolean isPrivate;

    public RepositoryResponse() {
    }

    public RepositoryResponse(
            Long id,
            String name,
            String fullName,
            String description,
            String language,
            int stars,
            int forks,
            boolean isPrivate
    ) {
        this.id = id;
        this.name = name;
        this.fullName = fullName;
        this.description = description;
        this.language = language;
        this.stars = stars;
        this.forks = forks;
        this.isPrivate = isPrivate;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getFullName() {
        return fullName;
    }

    public String getDescription() {
        return description;
    }

    public String getLanguage() {
        return language;
    }

    public int getStars() {
        return stars;
    }

    public int getForks() {
        return forks;
    }

    public boolean isPrivate() {
        return isPrivate;
    }
}
