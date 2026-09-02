package com.ajay.githubaicodeinsight.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http)
            throws Exception {

        http
            .csrf(csrf -> csrf.ignoringRequestMatchers("/api/**", "/mcp/**"))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/", "/api/health", "/api/ai/analyze").permitAll()
                .requestMatchers("/mcp/**").authenticated()
                .anyRequest().authenticated()
            )
            .oauth2Login(oauth2 -> {}); // Note: http.oauth2Login() is deprecated in newer Spring Security, using recommended lambda DSL style

        return http.build();
    }
}
