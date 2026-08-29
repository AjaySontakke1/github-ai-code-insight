package com.ajay.githubaicodeinsight.controller;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class UserController {

    @GetMapping("/api/github/me")
    public Object getCurrentUser(Authentication authentication) {
        return authentication.getPrincipal();
    }
}
