const API_BASE_URL = "http://localhost:8080";

export async function startAnalysis(owner, repo) {

    const response = await fetch(
        `${API_BASE_URL}/api/ai/analyze`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({
                owner,
                repo
            })
        }
    );

    if (!response.ok) {
        throw new Error("Failed to start analysis");
    }

    return response.json();
}

export async function getAnalysis(id) {

    const response = await fetch(
        `${API_BASE_URL}/api/ai/analysis/${id}`,
        {
            method: "GET",
            credentials: "include"
        }
    );

    if (!response.ok) {
        throw new Error("Failed to get analysis");
    }

    return response.json();
}

export async function getRepositories() {

    const response = await fetch(
        `${API_BASE_URL}/api/github/repositories`,
        {
            method: "GET",
            credentials: "include"
        }
    );

    if (!response.ok) {
        throw new Error("Failed to fetch repositories");
    }

    return response.json();
}

export async function getCurrentUser() {

    const response = await fetch(
        `${API_BASE_URL}/api/github/me`,
        {
            method: "GET",
            credentials: "include"
        }
    );

    if (!response.ok) {
        throw new Error("Failed to fetch current user");
    }

    return response.json();
}

export async function getAnalysisHistory() {

    const response = await fetch(
        `${API_BASE_URL}/api/ai/history`,
        {
            method: "GET",
            credentials: "include"
        }
    );

    if (!response.ok) {
        throw new Error("Failed to fetch analysis history");
    }

    return response.json();
}

export async function logout() {

    const response = await fetch(
        `${API_BASE_URL}/api/auth/logout`,
        {
            method: "POST",
            credentials: "include"
        }
    );

    if (!response.ok) {
        throw new Error("Logout failed");
    }
}
