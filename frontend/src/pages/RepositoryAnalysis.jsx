import { useEffect, useState } from "react";
import {
    startAnalysis,
    getAnalysis,
    getRepositories,
    getCurrentUser
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

            <h1 className="analysis-title">AI Code Insight</h1>
            <p className="repository-name">Repository Analysis</p>

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
                                Analysis Result for {result.repository}
                            </h2>

                            <div className="score-card">
                                <h2>Code Quality Score</h2>
                                <div className="score">
                                    {result.score}/100
                                </div>
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

                            <div className="summary-section">
                                <h2>Analysis Summary</h2>
                                <p>
                                    The AI analyzed the repository and found{" "}
                                    <strong>
                                        {result.issues?.length || 0}
                                    </strong>{" "}
                                    potential issues.
                                </p>
                                <p>
                                    Overall code quality score:{" "}
                                    <strong>{result.score}/100</strong>
                                </p>
                            </div>

                            <h2>Issues</h2>

                            {result.issues && result.issues.length > 0 ? (
                                result.issues.map((issue, index) => (
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
                                            <strong>File:</strong> {issue.file}
                                        </p>

                                        <p className="issue-info">
                                            <strong>Line:</strong> {issue.line}
                                        </p>

                                        <p className="issue-info">
                                            <strong>Confidence:</strong> {issue.confidence}
                                        </p>

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
                                    <h3>No Issues Found</h3>
                                    <p>
                                        The AI did not identify any significant
                                        problems in the analyzed code.
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
