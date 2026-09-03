import React from "react";
import "./RepositoryAnalysis.css";

function Login() {
    const handleLogin = () => {
        window.location.href =
            "https://github-ai-code-insight.onrender.com/oauth2/authorization/github";
    };

    return (
        <div className="landing-hero">
            <div className="hero-pill">
                <span>✨</span> NEXT-GEN CODE INTELLIGENCE
            </div>

            <h1 className="hero-title">
                Automated Code Review &amp; Security Audits Powered by AI
            </h1>

            <p className="hero-subtitle">
                Connect your GitHub account to scan your repositories for security vulnerabilities, logic bugs, performance bottlenecks, and code quality issues in seconds.
            </p>

            <button 
                onClick={handleLogin}
                className="github-login-btn"
            >
                <svg viewBox="0 0 24 24">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                </svg>
                <span>Login with GitHub</span>
            </button>

            <div className="feature-grid-preview">
                <div className="feature-pill-card">
                    <div className="feature-icon">🛡️</div>
                    <div className="feature-title">Security Audits</div>
                    <div className="feature-desc">Detect hardcoded credentials, authorization loopholes, and unsafe inputs.</div>
                </div>

                <div className="feature-pill-card">
                    <div className="feature-icon">🐛</div>
                    <div className="feature-title">Bug Prevention</div>
                    <div className="feature-desc">Identify null-pointer hazards, invalid conditions, and broken exception handling.</div>
                </div>

                <div className="feature-pill-card">
                    <div className="feature-icon">⚡</div>
                    <div className="feature-title">Performance Profiler</div>
                    <div className="feature-desc">Spot inefficient loops, redundant database calls, and memory traps.</div>
                </div>

                <div className="feature-pill-card">
                    <div className="feature-icon">📊</div>
                    <div className="feature-title">Deterministic Score</div>
                    <div className="feature-desc">Get a comprehensive 0–100 codebase health score with instant actionable fixes.</div>
                </div>
            </div>
        </div>
    );
}

export default Login;
