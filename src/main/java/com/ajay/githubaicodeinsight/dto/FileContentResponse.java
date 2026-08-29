package com.ajay.githubaicodeinsight.dto;

public class FileContentResponse {

    private String name;
    private String path;
    private String content;
    private String encoding;

    public FileContentResponse() {
    }

    public String getName() {
        return name;
    }

    public String getPath() {
        return path;
    }

    public String getContent() {
        return content;
    }

    public String getEncoding() {
        return encoding;
    }
}
