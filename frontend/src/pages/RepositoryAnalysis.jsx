import { useState } from "react";
import { startAnalysis } from "../services/analysisService";

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

            const result = await startAnalysis(owner, repo);

            setJob(result);

        } catch (err) {

            setError("Failed to start analysis");

        } finally {

            setLoading(false);
        }
    };

    return (
        <div>

            <h1>Repository Analysis</h1>

            <div>
                <label>Owner</label>
                <input
                    value={owner}
                    onChange={(e) => setOwner(e.target.value)}
                />
            </div>

            <div>
                <label>Repository</label>
                <input
                    value={repo}
                    onChange={(e) => setRepo(e.target.value)}
                />
            </div>

            <button
                onClick={handleAnalyze}
                disabled={loading}
            >
                {loading ? "Starting..." : "Analyze Repository"}
            </button>

            {error && (
                <p>{error}</p>
            )}

            {job && (
                <div>
                    <h2>Analysis Started</h2>

                    <p>
                        Job ID: {job.id}
                    </p>

                    <p>
                        Status: {job.status}
                    </p>
                </div>
            )}

        </div>
    );
}

export default RepositoryAnalysis;
