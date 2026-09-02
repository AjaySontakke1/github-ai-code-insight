import { useEffect, useState } from "react";
import {
    startAnalysis,
    getAnalysis
} from "../services/analysisService";
import "./RepositoryAnalysis.css";

function RepositoryAnalysis() {

    const [owner, setOwner] = useState("AjaySontakke1");
    const [repo, setRepo] = useState("CampusSync");

    const [loading, setLoading] = useState(false);
    const [job, setJob] = useState(null);
    const [error, setError] = useState("");

    const handleAnalyze = async () => {

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

    return (
        <div className="analysis-page">

            <h1 className="analysis-title">AI Code Insight</h1>
            <p className="repository-name">Repository Analysis</p>

            <div className="analysis-form">
                <div className="form-group">
                    <label>Owner</label>
                    <input
                        value={owner}
                        onChange={(e) => setOwner(e.target.value)}
                        placeholder="e.g. AjaySontakke1"
                    />
                </div>

                <div className="form-group">
                    <label>Repository</label>
                    <input
                        value={repo}
                        onChange={(e) => setRepo(e.target.value)}
                        placeholder="e.g. CampusSync"
                    />
                </div>

                <button
                    className="analyze-button"
                    onClick={handleAnalyze}
                    disabled={loading}
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
