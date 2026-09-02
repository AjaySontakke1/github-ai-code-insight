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
    const [loadingRepositories, setLoadingRepositories] = useState(true);

    const [loading, setLoading] = useState(false);
    const [job, setJob] = useState(null);
    const [error, setError] = useState("");
    const [issueFilter, setIssueFilter] = useState("ALL");

    useEffect(() => {
        const loadData = async () => {
            try {
                const user = await getCurrentUser();
                setOwner(user.login);

                const data = await getRepositories();
                setRepositories(data);
            } catch (err) {
                setError(err.message || "Failed to load GitHub data");
            } finally {
                setLoadingRepositories(false);
            }
        };

        loadData();
    }, []);

    const handleAnalyze = async () => {
        if (!owner || !repo) {
            setError("Please select a repository");
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
            window.location.href = "http://localhost:8080/oauth2/authorization/github";
        } catch (err) {
            setError("Failed to logout cleanly");
        }
    };

    useEffect(() => {

        if (!job?.id) {
            return;
        }

        if (
            job.status === "COMPLETED" ||
            job.status === "FAILED"
        ) {
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
        if (!result?.issues) {
            return 0;
        }

        return result.issues.filter(
            (issue) =>
                issue.severity?.toUpperCase() === severity
        ).length;
    };

    const filteredIssues = result?.issues?.filter((issue) => {
        if (issueFilter === "ALL") {
            return true;
        }
        return issue.category?.toUpperCase() === issueFilter;
    }) || [];

    const getSeverityClass = (severity) => {

        switch (severity?.toUpperCase()) {

            case "CRITICAL":
                return "severity-critical";

            case "HIGH":
                return "severity-high";

            case "MEDIUM":
                return "severity-medium";

            case "LOW":
                return "severity-low";

            default:
                return "";
        }
    };

    return (
        <div className="analysis-page">

            <div className="top-navbar">
                <div>
                    <h1 className="analysis-title">AI Code Insight</h1>
                    <p className="repository-name">Intelligent Repository Code Review & Security Analysis</p>
                </div>
                {owner && (
                    <button className="logout-button" onClick={handleLogout}>
                        Logout ({owner})
                    </button>
                )}
            </div>

            <div className="analysis-form">
                <div className="form-group">
                    <label>GitHub User</label>
                    <input
                        value={owner}
                        readOnly
                        placeholder="Loading username..."
                    />
                </div>

                <div className="form-group">
                    <label>Repository</label>
                    <select
                        value={repo}
                        onChange={(e) => setRepo(e.target.value)}
                        disabled={loadingRepositories}
                    >
                        <option value="">
                            {loadingRepositories ? "Loading repositories..." : "Select Repository"}
                        </option>
                        {repositories.map((repository) => (
                            <option
                                key={repository.id || repository.full_name || repository.name}
                                value={repository.name}
                            >
                                {repository.full_name}
                            </option>
                        ))}
                    </select>
                </div>

                <button
                    className="analyze-button"
                    onClick={handleAnalyze}
                    disabled={loading || !repo}
                >
                    {loading ? "Starting..." : "Analyze Repository"}
                </button>
            </div>

            {error && (
                <p className="error-message">{error}</p>
            )}

            {job && (
                <div>
                    <div className="status-box">
                        <h2>Analysis Status</h2>
                        <p>
                            <strong>Status:</strong> {job.status}
                        </p>
                    </div>

                    {job.status === "STARTED" && (
                        <div className="progress-box">
                            <h2>Preparing Analysis</h2>
                            <p>Preparing your repository for AI analysis...</p>
                        </div>
                    )}

                    {job.status === "ANALYZING" && (
                        <div className="progress-box">
                            <h2>Analysis in Progress</h2>
                            <div className="progress-spinner"></div>
                            <p>AI is reviewing your repository...</p>
                            <p>This may take a few moments.</p>
                            <div className="progress-bar-container">
                                <div className="progress-bar"></div>
                            </div>
                        </div>
                    )}

                    {job.status === "FAILED" && (
                        <div className="error-box">
                            <h2>Analysis Failed</h2>
                            <p>
                                {job.error || "Something went wrong during analysis."}
                            </p>
                            <button
                                className="analyze-button"
                                onClick={handleAnalyze}
                            >
                                Try Again
                            </button>
                        </div>
                    )}

                    {job.status === "COMPLETED" && result && (
                        <div>
                            <h2 style={{ marginTop: "30px" }}>
                                Analysis Result for {result.owner ? `${result.owner}/` : ""}{result.repository}
                            </h2>

                            {result.branch && (
                                <p style={{ color: "#666", marginTop: "-10px", marginBottom: "20px" }}>
                                    Branch: <strong>{result.branch}</strong> &bull; Files Analyzed: <strong>{result.filesAnalyzed}</strong>
                                </p>
                            )}

                            <div className="score-card">
                                <h2>Code Quality Score</h2>
                                <div className="score">
                                    {result.score}/100
                                </div>
                            </div>

                            <div className="reanalyze-container">
                                <button
                                    className="analyze-button"
                                    onClick={() => {
                                        const confirmed = window.confirm(
                                            "Do you want to analyze this repository again?"
                                        );
                                        if (confirmed) {
                                            handleAnalyze();
                                        }
                                    }}
                                    disabled={loading}
                                >
                                    {loading ? "Starting..." : "Re-analyze Repository"}
                                </button>
                            </div>

                            <div className="metrics">
                                <div className="metric-card">
                                    <h3>Bugs</h3>
                                    <div className="metric-number">
                                        {result.bugs}
                                    </div>
                                </div>

                                <div className="metric-card">
                                    <h3>Security</h3>
                                    <div className="metric-number">
                                        {result.security}
                                    </div>
                                </div>

                                <div className="metric-card">
                                    <h3>Performance</h3>
                                    <div className="metric-number">
                                        {result.performance}
                                    </div>
                                </div>

                                <div className="metric-card">
                                    <h3>Code Quality</h3>
                                    <div className="metric-number">
                                        {result.codeQuality}
                                    </div>
                                </div>
                            </div>

                            <div className="severity-summary">
                                <h2>Severity Summary</h2>
                                <div className="severity-metrics">
                                    <div className="severity-card">
                                        <h3>Critical</h3>
                                        <div className="metric-number">
                                            {countSeverity("CRITICAL")}
                                        </div>
                                    </div>

                                    <div className="severity-card">
                                        <h3>High</h3>
                                        <div className="metric-number">
                                            {countSeverity("HIGH")}
                                        </div>
                                    </div>

                                    <div className="severity-card">
                                        <h3>Medium</h3>
                                        <div className="metric-number">
                                            {countSeverity("MEDIUM")}
                                        </div>
                                    </div>

                                    <div className="severity-card">
                                        <h3>Low</h3>
                                        <div className="metric-number">
                                            {countSeverity("LOW")}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="summary-section">
                                <h2>Analysis Summary</h2>
                                <p>
                                    The AI analyzed the repository and found{" "}
                                    <strong>
                                        {result.issues?.length || 0}
                                    </strong>{" "}
                                    potential issues across{" "}
                                    <strong>{result.filesAnalyzed || "all"}</strong> files.
                                </p>
                                <p>
                                    Overall code quality score:{" "}
                                    <strong>{result.score}/100</strong>
                                </p>
                            </div>

                            <h2>Issues ({filteredIssues.length})</h2>

                            <div className="issue-filters">
                                <button
                                    onClick={() => setIssueFilter("ALL")}
                                    className={issueFilter === "ALL" ? "active-filter" : ""}
                                >
                                    All ({result.issues?.length || 0})
                                </button>
                                <button
                                    onClick={() => setIssueFilter("BUG")}
                                    className={issueFilter === "BUG" ? "active-filter" : ""}
                                >
                                    Bugs ({result.bugs || 0})
                                </button>
                                <button
                                    onClick={() => setIssueFilter("SECURITY")}
                                    className={issueFilter === "SECURITY" ? "active-filter" : ""}
                                >
                                    Security ({result.security || 0})
                                </button>
                                <button
                                    onClick={() => setIssueFilter("PERFORMANCE")}
                                    className={issueFilter === "PERFORMANCE" ? "active-filter" : ""}
                                >
                                    Performance ({result.performance || 0})
                                </button>
                                <button
                                    onClick={() => setIssueFilter("CODE_QUALITY")}
                                    className={issueFilter === "CODE_QUALITY" ? "active-filter" : ""}
                                >
                                    Code Quality ({result.codeQuality || 0})
                                </button>
                            </div>

                            {filteredIssues.length > 0 ? (
                                filteredIssues.map((issue, index) => (
                                    <div className="issue-card" key={index}>
                                        <div className="issue-header">
                                            <div>
                                                <span
                                                    className={`severity ${getSeverityClass(
                                                        issue.severity
                                                    )}`}
                                                >
                                                    {issue.severity}
                                                </span>

                                                <span className="category-badge">
                                                    {issue.category}
                                                </span>
                                            </div>
                                        </div>

                                        <p className="issue-info">
                                            <strong>File:</strong> {issue.file} {issue.line ? `(Line ${issue.line})` : ""}
                                        </p>

                                        {issue.confidence && (
                                            <p className="issue-info">
                                                <strong>Confidence:</strong> {issue.confidence}
                                            </p>
                                        )}

                                        <p className="issue-info">
                                            <strong>Problem:</strong> {issue.problem}
                                        </p>

                                        <p className="issue-info">
                                            <strong>Suggestion:</strong> {issue.suggestion}
                                        </p>
                                    </div>
                                ))
                            ) : (
                                <div className="summary-section">
                                    <h3>No Matching Issues</h3>
                                    <p>
                                        No issues were found in this category.
                                    </p>
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
