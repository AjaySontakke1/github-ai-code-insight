package com.ajay.githubaicodeinsight.dto;

import java.util.List;

public class RepositoryTreeResponse {

    private List<RepositoryFileDto> tree;

    public RepositoryTreeResponse() {
    }

    public List<RepositoryFileDto> getTree() {
        return tree;
    }
}
