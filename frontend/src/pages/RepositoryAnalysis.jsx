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

                if (data && data.length > 0) {
                    setRepo(data[0].name);
                }
            } catch (err) {
                setError("Failed to load GitHub data");
            } finally {
                setLoadingRepositories(false);
            }
        };

        loadData();
    }, []);

    const handleAnalyze = async () => {
        if (!repo) {
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

            setError("Failed to start analysis");

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

                setError("Failed to get analysis status");

            }

        }, 2000);

        return () => clearInterval(interval);

    }, [job]);

    const result = job?.result;

    const getSeverityClass = (severity) => {
        switch (severity?.toUpperCase()) {
            case "HIGH":
            case "CRITICAL":
                return "severity severity-high";
            case "MEDIUM":
                return "severity severity-medium";
            case "LOW":
                return "severity severity-low";
            default:
                return "severity";
        }
    };

    const handleRepoChange = (e) => {
        const selectedRepoName = e.target.value;
        setRepo(selectedRepoName);

        const selectedRepo = repositories.find((r) => r.name === selectedRepoName);
        if (selectedRepo) {
            if (selectedRepo.owner?.login) {
                setOwner(selectedRepo.owner.login);
            } else if (selectedRepo.full_name) {
                const parts = selectedRepo.full_name.split("/");
                if (parts.length > 0) setOwner(parts[0]);
            }
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
                        onChange={handleRepoChange}
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
                                {repository.full_name || repository.name}
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

                        {job.status === "ANALYZING" && (
                            <p>⏳ AI is analyzing the repository...</p>
                        )}

                        {job.status === "FAILED" && (
                            <p className="error-message">
                                Analysis failed: {job.error}
                            </p>
                        )}
                    </div>

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

                            <h2>Issues</h2>

                            {result.issues && result.issues.length > 0 ? (
                                result.issues.map((issue, index) => (
                                    <div className="issue-card" key={index}>
                                        <div className="issue-header">
                                            <h3>{issue.category || "Issue"}</h3>
                                            <span className={getSeverityClass(issue.severity)}>
                                                {issue.severity}
                                            </span>
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
                                <p>No issues detected.</p>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default RepositoryAnalysis;
