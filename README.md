# AI Code Insight

[![Live Demo](https://img.shields.io/badge/Live_Demo-Render-46E3B7?style=for-the-badge&logo=render&logoColor=white)](https://ai-code-insight-frontend.onrender.com)
[![Backend API](https://img.shields.io/badge/Backend_API-Live-009688?style=for-the-badge&logo=spring&logoColor=white)](https://github-ai-code-insight.onrender.com/api/health)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-4.1.1-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)](https://spring.io)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-3.5_Flash-8E75B2?style=for-the-badge&logo=google&logoColor=white)](https://aistudio.google.com)
[![React 19](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)

> 🌐 **Live Frontend Application**: [https://ai-code-insight-frontend.onrender.com](https://ai-code-insight-frontend.onrender.com)  
> ⚡ **Live Backend Web Service**: [https://github-ai-code-insight.onrender.com](https://github-ai-code-insight.onrender.com)  
> 🩺 **Backend Health Endpoint**: [https://github-ai-code-insight.onrender.com/api/health](https://github-ai-code-insight.onrender.com/api/health)

---

AI Code Insight is an AI-powered code review web application that analyzes GitHub repositories and identifies potential problems in the source code.

The application connects to GitHub using OAuth authentication, retrieves source code from a selected repository, sends the code to Google's Gemini AI through Spring AI, and displays the analysis in an easy-to-understand dashboard.

The system focuses on identifying:

- **Bugs** (logic errors, null pointer risks, race conditions)
- **Security issues** (hardcoded secrets, injection vulnerabilities, unsafe dependencies)
- **Performance problems** (inefficient algorithms, memory leaks, redundant database operations)
- **Code quality issues** (code smells, antipatterns, maintainability concerns)

It also provides issue severity, confidence level, problem explanation, and suggested improvements.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Problem Statement](#problem-statement)
- [Objectives](#objectives)
- [Features](#features)
- [How the Application Works](#how-the-application-works)
- [Application Workflow](#application-workflow)
- [System Architecture](#system-architecture)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
  - [Backend](#backend)
  - [Frontend](#frontend)
- [AI Analysis](#ai-analysis)
  - [Issue Categories](#issue-categories)
  - [Severity Levels](#severity-levels)
  - [Confidence Levels](#confidence-levels)
  - [Score Calculation](#score-calculation)
- [Authentication](#authentication)
- [API Endpoints](#api-endpoints)
- [Prerequisites](#prerequisites)
- [Environment Variables](#environment-variables)
- [Local Setup](#local-setup)
  - [Running the Backend](#running-the-backend)
  - [Running the Frontend](#running-the-frontend)
- [GitHub OAuth Setup](#github-oauth-setup)
- [Gemini AI Setup](#gemini-ai-setup)
- [Testing the Application](#testing-the-application)
- [Deployment](#deployment)
  - [Render Deployment](#render-deployment)
  - [Frontend Routing](#frontend-routing)
- [Security Considerations](#security-considerations)
- [Limitations](#limitations)
- [Future Scope](#future-scope)
- [Authors](#authors)

---

## Project Overview

AI Code Insight helps developers review their GitHub repositories using Artificial Intelligence.

Traditional code review can take significant time, especially when a project contains many source files. This application automates the initial review process by analyzing source code using Google's Gemini AI models via Spring AI.

The application does not modify the user's GitHub repository. It operates strictly in read-only mode, fetching file trees and contents to run diagnostic prompts and generate real-time metrics.

### Main Idea

```text
GitHub Repository
       |
       v
GitHub OAuth Login
       |
       v
Select Repository
       |
       v
Fetch Repository Source Code
       |
       v
Split Code into Batches
       |
       v
Gemini AI Analysis
       |
       v
Detect Issues
       |
       v
Calculate Score
       |
       v
Display Dashboard
```

---

## Problem Statement

Software development teams often experience bottlenecks during peer code reviews:
- **Time Consuming**: Manual code review of multiple files across large repositories demands extensive developer hours.
- **Inconsistent Quality**: Human reviewers can overlook subtle bugs, security vulnerabilities, or performance anti-patterns.
- **Lack of Immediate Feedback**: Junior engineers frequently wait hours or days for pull request reviews to catch basic flaws.
- **Security Risks**: Accidental check-ins of API keys, SQL injections, and insecure inputs often slip through initial reviews undetected.

---

## Objectives

1. Provide one-click GitHub authentication to browse user repositories.
2. Automate full-repository codebase scanning across multiple languages (Java, JavaScript, TypeScript, Python, etc.).
3. Deliver structured issue categorization: Bugs, Security, Performance, and Code Quality.
4. Calculate an objective, deterministic codebase health score (0–100).
5. Suggest concrete, actionable code snippets and remediation steps.
6. Provide an intuitive, modern, high-performance developer dashboard.

---

## Features

- **GitHub OAuth 2.0 Integration**: Secure login with personal access token delegation (`read:user`, `repo`).
- **Dynamic Repository Browser**: Automatically lists public and private repositories accessible by the user.
- **Asynchronous Code Analysis**: Background job processing with status polling (`QUEUED`, `ANALYZING`, `COMPLETED`, `FAILED`).
- **Gemini Generative AI Engine**: Powered by `gemini-3.5-flash` for high-speed, cost-effective, multi-file reasoning.
- **Categorized Issue Explorer**: Filter issues dynamically by category (Bugs, Security, Performance, Code Quality).
- **Severity & Confidence Indicators**: Color-coded badges for issue priority (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`) and model confidence.
- **Code Health Scorecard**: Calculated 0–100 rating reflecting overall code safety and cleanliness.
- **Dockerized Backend**: Ready for zero-friction containerized deployment on Render, Railway, AWS, or GCP.
- **Single-Page Application SPA Routing**: Client-side routing with automatic physical fallback files to prevent 404s.

---

## How the Application Works

1. **Authentication**: The user clicks **Login with GitHub**. Spring Security initiates an OAuth2 flow, delegating authentication to GitHub.
2. **Repository Discovery**: Upon authorization, the backend uses the acquired OAuth2 access token to call the GitHub REST API (`/user/repos`) and retrieve repositories.
3. **Repository Tree Fetching**: When an analysis is initiated, the backend queries GitHub's Git Trees API recursively to obtain code file paths while filtering out binaries, dependencies (`node_modules/`, `target/`), and lock files.
4. **Source Code Extraction**: Relevant code files are read using the GitHub Contents API.
5. **AI Prompt Engineering**: The source code is packaged into structured prompts sent to Google's Gemini models via Spring AI's `ChatClient`.
6. **Structured Parsing**: The AI returns structured JSON containing identified issues, descriptions, file locations, line numbers, and suggestions.
7. **Score Derivation**: The system computes a weighted score deducted from 100 based on the count and severity of detected issues.
8. **Interactive UI**: The React frontend renders the scorecard, metrics, and actionable fixes.

---

## Application Workflow

```text
+-------------------+             +-----------------------+             +--------------------+
|  React Frontend   |             |  Spring Boot Backend  |             |  GitHub / Gemini   |
+-------------------+             +-----------------------+             +--------------------+
          |                                   |                                    |
          | ----- 1. Login with GitHub -----> |                                    |
          |                                   | ----- 2. OAuth2 Authorization ---> |
          |                                   | <---- 3. Access Token Callback --- |
          | <---- 4. Redirect to /analysis -- |                                    |
          |                                   |                                    |
          | ----- 5. GET /api/github/me ----> | ----- 6. Fetch User Info --------> |
          | <---- 7. User Details Returned -- | <---- 8. Return Profile ---------- |
          |                                   |                                    |
          | -- 9. GET /api/github/repos ----> | ---- 10. Fetch Repositories -----> |
          | <--- 11. Return Repositories ---- | <--- 12. List Repos -------------- |
          |                                   |                                    |
          | --- 13. POST /api/ai/analyze ---> |                                    |
          | <--- 14. Return Job ID (Async) -- |                                    |
          |                                   | ---- 15. Fetch Repo Tree & Files ->|
          |                                   | ---- 16. Send Code to Gemini ----->|
          |                                   | <--- 17. Return AI Review JSON --- |
          |                                   |                                    |
          | -- 18. Poll /api/ai/analysis/{id} |                                    |
          | <--- 19. Completed Review Data -- |                                    |
```

---

## System Architecture

```text
[ Browser / Client ]
         |
         | HTTPS
         v
+-------------------------------------------------------------+
|               ai-code-insight-frontend (Render)             |
|   - React 19 + Vite 6 Single Page Application               |
|   - SPA Fallbacks (analysis.html, 404.html, _redirects)     |
+-------------------------------------------------------------+
         |
         | REST API (CORS + SameSite=None Secure Cookies)
         v
+-------------------------------------------------------------+
|               github-ai-code-insight (Render)               |
|   - Spring Boot 4.1.1 (Java 21)                             |
|   - Spring Security OAuth2 Client                           |
|   - Spring AI (Google GenAI Starter)                        |
|   - Embedded Tomcat with Forwarded Headers Strategy         |
+-------------------------------------------------------------+
         |                                           |
         | GitHub REST API                           | Gemini REST API
         v                                           v
+-----------------------+                  +-------------------------+
|     GitHub APIs       |                  |     Google Gemini       |
|  - /user              |                  |  - gemini-3.5-flash     |
|  - /user/repos        |                  |  - Multi-file Context   |
|  - /repos/{o}/{r}/git |                  |  - JSON Schema Parsing  |
+-----------------------+                  +-------------------------+
```

---

## Technology Stack

### Backend
- **Language**: Java 21 (Eclipse Temurin JDK)
- **Framework**: Spring Boot 4.1.1
- **AI Integration**: Spring AI Google GenAI (`gemini-3.5-flash`)
- **Security**: Spring Security 6 (OAuth2 Client, CORS, Session Management)
- **HTTP Client**: Spring `RestClient` / `WebClient`
- **JSON Processing**: Jackson (`ObjectMapper`)
- **Build Tool**: Apache Maven (`mvnw` wrapper)
- **Containerization**: Docker

### Frontend
- **Framework**: React 19
- **Build Tool**: Vite 6
- **Routing**: Lightweight client-side SPA routing (`/` and `/analysis`)
- **Styling**: Vanilla CSS3 (Custom design system, dark-mode themed, responsive grid layout)
- **Icons & Visuals**: Custom SVG iconography

### Infrastructure & Cloud
- **Hosting (Backend)**: Render Web Service (Docker runtime)
- **Hosting (Frontend)**: Render Static Site (Vite production bundle)
- **Identity Provider**: GitHub OAuth Apps
- **LLM Provider**: Google AI Studio (Gemini API)

---

## Project Structure

```text
github-ai-code-insight/
├── Dockerfile                                 # Production Docker image configuration
├── pom.xml                                    # Maven dependencies & build plugins
├── mvnw / mvnw.cmd                            # Maven wrapper scripts
├── HELP.md                                    # Spring Boot generated help
├── README.md                                  # Comprehensive documentation
├── src/
│   ├── main/
│   │   ├── java/com/ajay/githubaicodeinsight/
│   │   │   ├── GithubAiCodeInsightApplication.java   # Spring Boot entry point
│   │   │   ├── config/
│   │   │   │   ├── AppConfig.java                    # Bean definitions (RestClient, ObjectMapper)
│   │   │   │   ├── SecurityConfig.java               # OAuth2 login, CORS, and endpoint rules
│   │   │   │   └── WebConfig.java                    # Spring MVC CORS mappings
│   │   │   ├── controller/
│   │   │   │   ├── AIController.java                 # /api/ai/analyze, /analysis/{id}, /history
│   │   │   │   ├── GitHubController.java             # /api/github/me
│   │   │   │   ├── HealthController.java             # /api/health
│   │   │   │   ├── RepositoryController.java         # /api/github/repositories
│   │   │   │   └── UserController.java               # Authentication & session endpoints
│   │   │   ├── dto/
│   │   │   │   ├── AnalysisJob.java                  # Analysis tracking model & status
│   │   │   │   ├── AnalysisRequest.java              # Request payload (owner, repo)
│   │   │   │   ├── AnalysisResponse.java             # Result payload (score, stats, issues)
│   │   │   │   ├── AnalysisStatus.java               # Enum: QUEUED, ANALYZING, COMPLETED, FAILED
│   │   │   │   ├── CodeFile.java                     # Model representing extracted file content
│   │   │   │   ├── IssueDto.java                     # Model for single detected issue
│   │   │   │   ├── RepositoryDto.java                # GitHub repository item
│   │   │   │   └── ...
│   │   │   └── service/
│   │   │       ├── AIAnalysisService.java            # Async prompt generation & Gemini invocation
│   │   │       ├── AnalysisJobService.java           # In-memory analysis job state management
│   │   │       ├── GitHubRepositoryService.java      # Git tree & file content retrieval
│   │   │       └── GitHubService.java                # GitHub user profile & repo API calls
│   │   └── resources/
│   │       ├── application.properties                # Production properties with env placeholders
│   │       └── application.properties.example        # Reference configuration template
│   └── test/
└── frontend/
    ├── index.html                             # Single Page Application HTML template
    ├── package.json                           # React dependencies & scripts
    ├── vite.config.js                         # Vite config + automatic SPA fallback generator
    ├── public/
    │   ├── _redirects                         # Render rewrite configuration
    │   ├── favicon.svg                        # Site favicon
    │   └── icons.svg                          # System icons
    └── src/
        ├── App.jsx                            # Client-side router component
        ├── main.jsx                           # React DOM bootstrap
        ├── style.css                          # Global typography and base CSS variables
        ├── pages/
        │   ├── Login.jsx                      # Landing page with hero and GitHub OAuth button
        │   ├── RepositoryAnalysis.jsx         # Authenticated dashboard with filterable results
        │   └── RepositoryAnalysis.css         # Dashboard styles, badges, and scorecard cards
        └── services/
            └── analysisService.js             # HTTP API service for backend communication
```

---

## AI Analysis

### Issue Categories

Every detected issue is classified into one of four primary categories:

| Category | Description | Example Findings |
| :--- | :--- | :--- |
| `BUG` | Logic errors, runtime crashes, and unintended behaviors | NullPointer dereferencing, unhandled promises, race conditions |
| `SECURITY` | Vulnerabilities that expose data or access | Hardcoded API tokens, SQL injections, insecure deserialization |
| `PERFORMANCE` | Bottlenecks that slow down execution or consume memory | Unindexed queries, redundant computations, memory leaks |
| `CODE_QUALITY` | Architectural anti-patterns and maintainability issues | Duplicate code, deeply nested loops, unused variables |

### Severity Levels

| Severity | Impact | Score Penalty |
| :--- | :--- | :--- |
| `CRITICAL` | Severe security flaw or application-crashing bug | -15 points |
| `HIGH` | Significant bug or performance degradation | -10 points |
| `MEDIUM` | Noticeable quality or maintainability deficiency | -5 points |
| `LOW` | Minor styling, readability, or minor improvement | -2 points |

### Confidence Levels

The AI engine annotates each issue with a confidence rating:
- **`HIGH`**: Strong certainty backed by clear code evidence.
- **`MEDIUM`**: Probable issue depending on surrounding context.
- **`LOW`**: Heuristic observation or recommendation for review.

### Score Calculation

The codebase score is calculated deterministically on a scale of **0 to 100**:

$$\text{Score} = \max\Big(0, 100 - \sum (\text{penalty}_i)\Big)$$

Where:
- Starting base score: `100`
- Deductions:
  - `CRITICAL`: -15 points
  - `HIGH`: -10 points
  - `MEDIUM`: -5 points
  - `LOW`: -2 points

Score tiers:
- **80 – 100**: Excellent (Green) — Clean codebase, ready for production.
- **50 – 79**: Moderate (Orange) — Noticeable issues requiring attention.
- **0 – 49**: Critical (Red) — Severe vulnerabilities or bugs detected.

---

## Authentication

Authentication is implemented using **OAuth 2.0 Authorization Code Flow** with GitHub:

1. **Client Initiation**: The user navigates to `/` and clicks **Login with GitHub**.
2. **Authorization Request**: The browser redirects to:
   ```text
   GET /oauth2/authorization/github
   ```
3. **GitHub Approval**: The user grants access on GitHub (`read:user`, `repo`).
4. **Authorization Callback**: GitHub redirects back to:
   ```text
   GET /login/oauth2/code/github?code=...&state=...
   ```
5. **Token Exchange**: Spring Security exchanges the authorization code for a GitHub User Access Token.
6. **Session Creation**: An encrypted HTTP-only session cookie (`JSESSIONID`) is set with:
   ```text
   SameSite=None; Secure
   ```
7. **Destination Redirect**: Spring Security redirects the browser to:
   ```text
   https://ai-code-insight-frontend.onrender.com/analysis
   ```
8. **Session Verification**: The React dashboard calls `/api/github/me` with `credentials: "include"`, receiving the user profile.

---

## API Endpoints

### Authentication & Public
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Public | Health check endpoint returning application status |
| `GET` | `/oauth2/authorization/github` | Public | Initiates GitHub OAuth2 sign-in flow |
| `POST` | `/api/auth/logout` | Authenticated | Clears user session and terminates authentication |

### GitHub Endpoints
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/github/me` | Authenticated | Returns current authenticated GitHub user profile |
| `GET` | `/api/github/repositories` | Authenticated | Returns list of accessible GitHub repositories |

### AI Analysis Endpoints
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/ai/analyze` | Authenticated | Initiates asynchronous analysis for `{ owner, repo }` |
| `GET` | `/api/ai/analysis/{id}` | Authenticated | Retrieves current status and review results for job ID |
| `GET` | `/api/ai/history` | Authenticated | Retrieves previous repository analysis history |

---

## Prerequisites

Before running the project locally, ensure you have installed:
- **Java 21 JDK** (e.g., Eclipse Temurin, Amazon Corretto, or OpenJDK)
- **Node.js** (v18.x or later) and **npm**
- **Git**
- **GitHub Account** (to register an OAuth App)
- **Google AI Studio Account** (to obtain a Gemini API key)

---

## Environment Variables

The backend relies on the following environment variables:

| Variable | Description | Example / Default |
| :--- | :--- | :--- |
| `PORT` | Web server listening port | `8080` |
| `GEMINI_API_KEY` | Google Gemini API key from AI Studio | `AIzaSy...` |
| `GITHUB_CLIENT_ID` | GitHub OAuth App Client ID | `Ov23li...` |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth App Client Secret | `9f1479...` |

---

## Local Setup

### 1. Clone the Repository
```bash
git clone https://github.com/AjaySontakke1/github-ai-code-insight.git
cd github-ai-code-insight
```

### 2. Configure Environment Variables
Set your environment variables in your terminal or IDE:

**On Windows (PowerShell):**
```powershell
$env:PORT="8080"
$env:GEMINI_API_KEY="your_gemini_api_key_here"
$env:GITHUB_CLIENT_ID="your_github_client_id_here"
$env:GITHUB_CLIENT_SECRET="your_github_client_secret_here"
```

**On macOS / Linux:**
```bash
export PORT=8080
export GEMINI_API_KEY="your_gemini_api_key_here"
export GITHUB_CLIENT_ID="your_github_client_id_here"
export GITHUB_CLIENT_SECRET="your_github_client_secret_here"
```

---

### Running the Backend

From the project root:
```bash
# Compile and run with Maven wrapper
./mvnw spring-boot:run
```
The backend will start at: `http://localhost:8080`

Verify health endpoint:
```bash
curl http://localhost:8080/api/health
# Output: GitHub AI Code Insight is running!
```

---

### Running the Frontend

In a separate terminal:
```bash
cd frontend

# Install npm dependencies
npm install

# Start development server
npm run dev
```
The frontend will start at: `http://localhost:5173`

---

## GitHub OAuth Setup

1. Open [GitHub Developer Settings](https://github.com/settings/developers).
2. Select **OAuth Apps** ➔ **New OAuth App**.
3. Fill in the application details:
   - **Application name**: `AI Code Insight`
   - **Homepage URL**:
     - Local development: `http://localhost:5173`
     - Production: `https://ai-code-insight-frontend.onrender.com`
   - **Authorization callback URL**:
     - Local development: `http://localhost:8080/login/oauth2/code/github`
     - Production: `https://github-ai-code-insight.onrender.com/login/oauth2/code/github`
4. Click **Register application**.
5. Copy the **Client ID** and generate a new **Client Secret**.
6. Set them as `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET`.

---

## Gemini AI Setup

1. Visit [Google AI Studio](https://aistudio.google.com/).
2. Sign in with your Google account.
3. Click **Get API key** ➔ **Create API key**.
4. Set the key as the `GEMINI_API_KEY` environment variable.

---

## Testing the Application

### 1. Automated Backend Tests
Run the unit and context tests using Maven:
```bash
./mvnw test
```

### 2. Frontend Production Build Check
Ensure the frontend compiles with no syntax errors:
```bash
cd frontend
npm run build
```

---

## Deployment

### Render Deployment

The application is architected for dual-service deployment on **Render**:

#### 1. Backend Web Service (`github-ai-code-insight`)
- **Environment**: `Docker`
- **Region**: Oregon (US West) or Singapore
- **Branch**: `main`
- **Docker Command**: Automatically reads [`Dockerfile`](Dockerfile)
- **Environment Variables**:
  - `PORT`: `8080`
  - `GEMINI_API_KEY`: *(Set your key)*
  - `GITHUB_CLIENT_ID`: *(Set your Client ID)*
  - `GITHUB_CLIENT_SECRET`: *(Set your Client Secret)*

#### 2. Frontend Static Site (`ai-code-insight-frontend`)
- **Environment**: `Static Site`
- **Root Directory**: `frontend`
- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `dist`

---

### Frontend Routing

Because Render's static server looks for physical files corresponding to URLs, client-side routing on routes like `/analysis` can return `404 Not Found` if accessed directly.

This application includes an **automated multi-strategy routing solution**:
1. **Physical File Generation**: During `npm run build`, a custom Vite hook in [`vite.config.js`](frontend/vite.config.js) automatically copies the compiled `index.html` to:
   - `dist/analysis.html`
   - `dist/analysis/index.html`
   - `dist/404.html`
2. **Static Rewrite File**: A [`_redirects`](frontend/public/_redirects) file is placed in `frontend/public/_redirects`:
   ```text
   /*    /index.html   200
   ```
This guarantees zero 404 errors regardless of how users land on or refresh the page.

---

## Security Considerations

- **No Hardcoded Credentials**: All secrets (OAuth keys, Gemini keys) are injected exclusively through environment variables.
- **Git Ignore Security**: `application-local.properties`, `.env`, and sensitive local files are strictly ignored.
- **Cross-Site Cookie Protection**: Session cookies use `SameSite=None` combined with `Secure=true` to prevent unauthorized cross-site leakages while enabling authentications across separate domains.
- **CSRF Configuration**: Public endpoints (`/api/**`, `/mcp/**`) have appropriate request matching policies while authenticated sessions are guarded.
- **Read-Only GitHub Permissions**: The application only requests read permissions (`read:user`, `repo`) and never pushes or alters user source repositories.

---

## Limitations

- **Rate Limits**: Extremely large repositories with thousands of source files may hit GitHub API rate limits or Gemini context window limits.
- **Binary & Media Files**: Non-text assets (images, PDFs, binary libraries) are omitted from analysis.
- **Cold Starts**: On free hosting tiers (such as Render Free Tier), backend containers may spin down after inactivity, causing a 30–50 second delay on first boot.

---

## Future Scope

- **Pull Request Bot**: Automatically comment on GitHub Pull Requests with inline suggestions.
- **Custom Rule Engine**: Allow developers to define company-specific coding standards and linting rules.
- **Multi-Model Support**: Switch between Gemini, Claude, and OpenAI models dynamically based on cost and latency preferences.
- **PDF & Markdown Export**: Download comprehensive code review audit reports for compliance and leadership review.
- **CI/CD Action**: GitHub Action workflow integration for automated CI pipeline gating.

---

## Authors

- **Ajay Sontakke** — Creator & Developer ([@AjaySontakke1](https://github.com/AjaySontakke1))
- **Google DeepMind / Antigravity Agent** — Pair Programming & Architectural Optimization
