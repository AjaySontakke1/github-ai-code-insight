package com.ajay.githubaicodeinsight.service;

import com.ajay.githubaicodeinsight.dto.AnalysisJob;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class AnalysisJobService {

    private final Map<UUID, AnalysisJob> jobs =
            new ConcurrentHashMap<>();

    public AnalysisJob createJob(
            String username,
            String owner,
            String repo) {

        UUID id = UUID.randomUUID();

        AnalysisJob job =
                new AnalysisJob(
                        id,
                        username,
                        owner,
                        repo
                );

        jobs.put(id, job);

        return job;
    }

    public AnalysisJob getJob(
            UUID id,
            String username) {

        AnalysisJob job = jobs.get(id);

        if (job == null) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Analysis job not found"
            );
        }

        if (job.getUsername() == null || !job.getUsername().equals(username)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You cannot access this analysis"
            );
        }

        return job;
    }

    public List<AnalysisJob> getUserJobs(String username) {

        return jobs.values()
                .stream()
                .filter(job -> job.getUsername() != null && job.getUsername().equals(username))
                .sorted(
                        Comparator.comparing(
                                AnalysisJob::getId
                        ).reversed()
                )
                .toList();
    }
}
