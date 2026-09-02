import { useEffect, useState } from "react";
import {
    API_BASE_URL,
    startAnalysis,
    getAnalysis,
    getRepositories,
    getCurrentUser,
    logout
} from "../services/analysisService";
import "./RepositoryAnalysis.css";

function RepositoryAnalysis() {

    const [authStatus, setAuthStatus] = useState("checking"); // 'checking' | 'authenticated' | 'unauthenticated'
    const [owner, setOwner] = useState("");
    const [repo, setRepo] = useState("");
    const [repositories, setRepositories] = useState([]);
    const [loadingRepositories, setLoadingRepositories] = useState(false);

    const [loading, setLoading] = useState(false);
    const [job, setJob] = useState(null);
    const [error, setError] = useState("");
    const [issueFilter, setIssueFilter] = useState("ALL");

    useEffect(() => {
        checkAuthAndLoadData();
    }, []);

    const handleLogin = () => {
        window.location.href =
            "https://github-ai-code-insight.onrender.com/oauth2/authorization/github";
    };

    const checkAuthAndLoadData = async () => {
        try {
            setAuthStatus("checking");
            setError("");

            const user = await getCurrentUser();
            if (user && user.login) {
                setOwner(user.login);
                setAuthStatus("authenticated");
                loadRepositories();
            } else {
                setAuthStatus("unauthenticated");
            }
        } catch (err) {
            // Not authenticated yet
            setAuthStatus("unauthenticated");
        }
    };

    const loadRepositories = async () => {
        try {
            setLoadingRepositories(true);
            const data = await getRepositories();
            setRepositories(data || []);
        } catch (err) {
            console.error("Failed to load repositories:", err);
            setError(err.message || "Failed to fetch GitHub repositories");
        } finally {
            setLoadingRepositories(false);
        }
    };

    const handleAnalyze = async () => {
        if (!owner || !repo) {
            setError("Please select a repository to analyze");
            return;
        }

        try {
            setLoading(true);
            setError("");
            setJob(null);

            const result = await startAnalysis(owner, repo);
            setJob(result);

        } catch (err) {
            setError(err.message || "Failed to start analysis");
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            await logout();
            setAuthStatus("unauthenticated");
            setOwner("");
            setRepo("");
            setJob(null);
        } catch (err) {
            // If backend session cleared or errored, reset UI
            setAuthStatus("unauthenticated");
        }
    };

    useEffect(() => {
        if (!job?.id) {
            return;
        }

        if (job.status === "COMPLETED" || job.status === "FAILED") {
            return;
        }

        const interval = setInterval(async () => {
            try {
                const updatedJob = await getAnalysis(job.id);
                setJob(updatedJob);
            } catch (err) {
                setError(err.message || "Failed to get analysis status");
            }
        }, 2000);

        return () => clearInterval(interval);
    }, [job]);

    const result = job?.result;

    const countSeverity = (severity) => {
        if (!result?.issues) return 0;
        return result.issues.filter(
            (issue) => issue.severity?.toUpperCase() === severity
        ).length;
    };

    const filteredIssues = result?.issues?.filter((issue) => {
        if (issueFilter === "ALL") return true;
        return issue.category?.toUpperCase() === issueFilter;
    }) || [];

    const getSeverityBadgeClass = (severity) => {
        switch (severity?.toUpperCase()) {
            case "CRITICAL": return "badge-critical";
            case "HIGH": return "badge-high";
            case "MEDIUM": return "badge-medium";
            case "LOW": return "badge-low";
            default: return "badge-category";
        }
    };

    const getScoreClass = (score) => {
        if (score >= 80) return "score-excellent";
        if (score >= 50) return "score-good";
        return "score-poor";
    };

    // 1. CHECKING AUTH STATE
    if (authStatus === "checking") {
        return (
            <div className="landing-hero">
                <div className="pulse-spinner"></div>
                <h2 style={{ color: "#f8fafc", fontSize: "20px" }}>Connecting to AI Code Insight...</h2>
            </div>
        );
    }

    // 2. UNAUTHENTICATED STATE: GORGEOUS LANDING & GITHUB OAUTH BUTTON
    if (authStatus === "unauthenticated") {
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

                <a 
                    href={`${API_BASE_URL}/oauth2/authorization/github`} 
                    onClick={handleLogin}
                    className="github-login-btn"
                >
                    <svg viewBox="0 0 24 24">
                        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                    </svg>
                    <span>Login with GitHub</span>
                </a>

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

    // 3. AUTHENTICATED DASHBOARD
    return (
        <div className="analysis-page">

            {/* TOP NAVBAR */}
            <div className="top-navbar">
                <div className="brand-section">
                    <div className="brand-logo-icon">✨</div>
                    <div>
                        <h1 className="analysis-title">AI Code Insight</h1>
                        <p className="repository-name">Intelligent Repository Code Review &amp; Security Analysis</p>
                    </div>
                </div>

                <div className="user-profile-section">
                    <div className="user-badge">
                        <span className="status-indicator-dot"></span>
                        <span>@{owner}</span>
                    </div>
                    <button className="logout-button" onClick={handleLogout}>
                        Sign Out
                    </button>
                </div>
            </div>

            {/* REPOSITORY SELECTION CARD */}
            <div className="card-container">
                <div className="analysis-form">
                    <div className="form-group">
                        <label>GitHub Account</label>
                        <input
                            value={owner}
                            readOnly
                            disabled
                        />
                    </div>

                    <div className="form-group">
                        <label>Select Repository</label>
                        <select
                            value={repo}
                            onChange={(e) => setRepo(e.target.value)}
                            disabled={loadingRepositories || loading}
                        >
                            <option value="">
                                {loadingRepositories ? "Loading your GitHub repositories..." : "-- Select a Repository --"}
                            </option>
                            {repositories.map((repository) => (
                                <option
                                    key={repository.id || repository.full_name || repository.name}
                                    value={repository.name}
                                >
                                    {repository.full_name} {repository.private ? "🔒" : "🌐"}
                                </option>
                            ))}
                        </select>
                    </div>

                    <button
                        className="analyze-button"
                        onClick={handleAnalyze}
                        disabled={loading || !repo}
                    >
                        {loading ? "Starting Scan..." : "🚀 Analyze Repository"}
                    </button>
                </div>
            </div>

            {error && (
                <div className="problem-box" style={{ margin: "20px 0" }}>
                    ⚠️ {error}
                </div>
            )}

            {/* LIVE JOB STATES */}
            {job && (
                <div>
                    {job.status === "STARTED" && (
                        <div className="progress-card">
                            <div className="pulse-spinner"></div>
                            <div className="progress-headline">Preparing Repository Tree</div>
                            <p className="progress-subtext">Fetching source files from GitHub and organizing analysis batches...</p>
                            <div className="animated-progress-bar">
                                <div className="animated-progress-fill"></div>
                            </div>
                        </div>
                    )}

                    {job.status === "ANALYZING" && (
                        <div className="progress-card">
                            <div className="pulse-spinner"></div>
                            <div className="progress-headline">AI Code Analysis in Progress</div>
                            <p className="progress-subtext">Scanning for security vulnerabilities, logic bugs, and performance bottlenecks with Spring AI...</p>
                            <div className="animated-progress-bar">
                                <div className="animated-progress-fill"></div>
                            </div>
                        </div>
                    )}

                    {job.status === "FAILED" && (
                        <div className="card-container" style={{ borderColor: "rgba(239, 68, 68, 0.4)", textAlign: "center" }}>
                            <h2 style={{ color: "#f87171", marginBottom: "10px" }}>❌ Analysis Failed</h2>
                            <p style={{ color: "#94a3b8", marginBottom: "20px" }}>
                                {job.error || "Something went wrong during repository analysis."}
                            </p>
                            <button
                                className="analyze-button"
                                onClick={handleAnalyze}
                            >
                                Try Again
                            </button>
                        </div>
                    )}

                    {/* COMPLETED RESULTS DASHBOARD */}
                    {job.status === "COMPLETED" && result && (
                        <div>
                            {/* HEADER */}
                            <div className="result-header-bar">
                                <div className="result-repo-name">
                                    📦 {result.owner ? `${result.owner}/` : ""}{result.repository}
                                </div>
                                <div className="repo-meta-badges">
                                    {result.branch && (
                                        <div className="meta-chip">
                                            🌿 Branch: <strong>{result.branch}</strong>
                                        </div>
                                    )}
                                    <div className="meta-chip">
                                        📁 Files Analyzed: <strong>{result.filesAnalyzed || "All"}</strong>
                                    </div>
                                </div>
                            </div>

                            {/* SCORE HERO */}
                            <div className="score-hero-card">
                                <div className={`score-circle ${getScoreClass(result.score)}`}>
                                    <div className="score-number">{result.score}</div>
                                    <div className="score-denom">/ 100</div>
                                </div>

                                <div className="score-info">
                                    <h2>Overall Codebase Health</h2>
                                    <p>
                                        {result.score >= 80 
                                            ? "High quality codebase with clean patterns and solid security posture."
                                            : result.score >= 50
                                            ? "Moderate codebase health. Several actionable bugs or optimizations recommended."
                                            : "Critical attention required. Significant security or architectural flaws detected."}
                                    </p>
                                </div>

                                <div>
                                    <button
                                        className="reanalyze-btn"
                                        onClick={() => {
                                            if (window.confirm("Run a fresh AI analysis on this repository?")) {
                                                handleAnalyze();
                                            }
                                        }}
                                        disabled={loading}
                                    >
                                        🔄 Re-analyze
                                    </button>
                                </div>
                            </div>

                            {/* 4 CORE METRIC CARDS */}
                            <div className="metrics-grid">
                                <div className="metric-card metric-bugs">
                                    <div className="metric-header">
                                        <span className="metric-label">Bugs</span>
                                        <span className="metric-icon">🐛</span>
                                    </div>
                                    <div className="metric-count">{result.bugs}</div>
                                </div>

                                <div className="metric-card metric-security">
                                    <div className="metric-header">
                                        <span className="metric-label">Security</span>
                                        <span className="metric-icon">🛡️</span>
                                    </div>
                                    <div className="metric-count">{result.security}</div>
                                </div>

                                <div className="metric-card metric-performance">
                                    <div className="metric-header">
                                        <span className="metric-label">Performance</span>
                                        <span className="metric-icon">⚡</span>
                                    </div>
                                    <div className="metric-count">{result.performance}</div>
                                </div>

                                <div className="metric-card metric-quality">
                                    <div className="metric-header">
                                        <span className="metric-label">Code Quality</span>
                                        <span className="metric-icon">🧹</span>
                                    </div>
                                    <div className="metric-count">{result.codeQuality}</div>
                                </div>
                            </div>

                            {/* SEVERITY BREAKDOWN */}
                            <div className="severity-summary-card">
                                <div className="severity-title">Severity Breakdown</div>
                                <div className="severity-grid">
                                    <div className="severity-pill-box sev-critical">
                                        <div className="sev-name">Critical</div>
                                        <div className="sev-count">{countSeverity("CRITICAL")}</div>
                                    </div>

                                    <div className="severity-pill-box sev-high">
                                        <div className="sev-name">High</div>
                                        <div className="sev-count">{countSeverity("HIGH")}</div>
                                    </div>

                                    <div className="severity-pill-box sev-medium">
                                        <div className="sev-name">Medium</div>
                                        <div className="sev-count">{countSeverity("MEDIUM")}</div>
                                    </div>

                                    <div className="severity-pill-box sev-low">
                                        <div className="sev-name">Low</div>
                                        <div className="sev-count">{countSeverity("LOW")}</div>
                                    </div>
                                </div>
                            </div>

                            {/* FILTER BAR */}
                            <div className="issue-filters-bar">
                                <button
                                    className={`filter-btn ${issueFilter === "ALL" ? "active" : ""}`}
                                    onClick={() => setIssueFilter("ALL")}
                                >
                                    All Issues ({result.issues?.length || 0})
                                </button>
                                <button
                                    className={`filter-btn ${issueFilter === "BUG" ? "active" : ""}`}
                                    onClick={() => setIssueFilter("BUG")}
                                >
                                    🐛 Bugs ({result.bugs || 0})
                                </button>
                                <button
                                    className={`filter-btn ${issueFilter === "SECURITY" ? "active" : ""}`}
                                    onClick={() => setIssueFilter("SECURITY")}
                                >
                                    🛡️ Security ({result.security || 0})
                                </button>
                                <button
                                    className={`filter-btn ${issueFilter === "PERFORMANCE" ? "active" : ""}`}
                                    onClick={() => setIssueFilter("PERFORMANCE")}
                                >
                                    ⚡ Performance ({result.performance || 0})
                                </button>
                                <button
                                    className={`filter-btn ${issueFilter === "CODE_QUALITY" ? "active" : ""}`}
                                    onClick={() => setIssueFilter("CODE_QUALITY")}
                                >
                                    🧹 Code Quality ({result.codeQuality || 0})
                                </button>
                            </div>

                            {/* ISSUES LIST */}
                            {filteredIssues.length > 0 ? (
                                filteredIssues.map((issue, index) => (
                                    <div className="issue-card" key={index}>
                                        <div className="issue-card-top">
                                            <div className="badge-group">
                                                <span className={`badge ${getSeverityBadgeClass(issue.severity)}`}>
                                                    {issue.severity}
                                                </span>
                                                <span className="badge badge-category">
                                                    {issue.category}
                                                </span>
                                                {issue.confidence && (
                                                    <span className="badge badge-category" style={{ opacity: 0.75 }}>
                                                        {issue.confidence} CONFIDENCE
                                                    </span>
                                                )}
                                            </div>

                                            <div className="file-location-badge">
                                                📄 {issue.file} {issue.line ? `: L${issue.line}` : ""}
                                            </div>
                                        </div>

                                        <div className="issue-detail-box">
                                            <div className="problem-box">
                                                <strong>Problem:</strong> {issue.problem}
                                            </div>

                                            <div className="suggestion-box">
                                                <strong>Suggested Fix:</strong> {issue.suggestion}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="empty-state-box">
                                    <div className="empty-icon">🎉</div>
                                    <h3>No Issues in this Category</h3>
                                    <p>The analyzed files do not contain any detected issues for this filter.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default RepositoryAnalysis;
