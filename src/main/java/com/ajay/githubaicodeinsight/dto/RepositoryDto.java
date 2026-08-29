package com.ajay.githubaicodeinsight.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;

public class RepositoryDto {

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

    @JsonProperty("url")
    @JsonAlias("html_url")
    private String url;

    public RepositoryDto() {
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

    public String getUrl() {
        return url;
    }
}
