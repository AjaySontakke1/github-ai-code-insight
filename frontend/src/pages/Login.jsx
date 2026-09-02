import React from "react";

function Login() {
    const handleLogin = () => {
        window.location.href =
            "https://github-ai-code-insight.onrender.com/oauth2/authorization/github";
    };

    return (
        <div className="login-container">
            <h2>Login to GitHub AI Code Insight</h2>
            <button onClick={handleLogin} className="github-login-btn">
                Login with GitHub
            </button>
        </div>
    );
}

export default Login;
