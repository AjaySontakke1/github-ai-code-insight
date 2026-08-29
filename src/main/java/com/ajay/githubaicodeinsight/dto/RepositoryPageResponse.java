package com.ajay.githubaicodeinsight.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

public class RepositoryPageResponse {

    private List<RepositoryDto> repositories;
    private int page;
    private int size;

    @JsonProperty("hasNext")
    private boolean hasNext;

    public RepositoryPageResponse() {
    }

    public RepositoryPageResponse(
            List<RepositoryDto> repositories,
            int page,
            int size,
            boolean hasNext) {
        this.repositories = repositories;
        this.page = page;
        this.size = size;
        this.hasNext = hasNext;
    }

    public List<RepositoryDto> getRepositories() {
        return repositories;
    }

    public int getPage() {
        return page;
    }

    public int getSize() {
        return size;
    }

    public boolean isHasNext() {
        return hasNext;
    }
}
