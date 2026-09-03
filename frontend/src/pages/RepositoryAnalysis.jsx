import { useEffect, useState } from "react";
import {
    startAnalysis,
    getAnalysis,
    getRepositories,
    getCurrentUser,
    logout
} from "../services/analysisService";
import "./RepositoryAnalysis.css";

function RepositoryAnalysis() {

    const [owner, setOwner] = useState("");
    const [repo, setRepo] = useState("");
    const [repositories, setRepositories] = useState([]);
    const [loadingRepositories, setLoadingRepositories] = useState(false);

    const [loading, setLoading] = useState(false);
    const [job, setJob] = useState(null);
    const [error, setError] = useState("");
    const [issueFilter, setIssueFilter] = useState("ALL");

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const user = await getCurrentUser();
                if (user && user.login) {
                    setOwner(user.login);
                }
            } catch (err) {
                console.error("Failed to load current user:", err);
            }
            loadRepositories();
        };

        loadInitialData();
    }, []);

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
        } catch (err) {
            console.error("Logout failed:", err);
        } finally {
            window.location.href = "/";
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

    // AUTHENTICATED DASHBOARD
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
