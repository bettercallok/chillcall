# Deployment Guide

This guide explains how to host ChillCall for free using **Render** (for Backend) and **Vercel** (for Frontend).

## Option 1: Render + Vercel (Recommended for Quick Start)

### 1. Backend Deployment (Render)

Render offers a free tier for Web Services that can run Docker containers.

1.  Push your code to a GitHub repository.
2.  Sign up/Log in to [Render](https://render.com/).
3.  Click **New +** -> **Web Service**.
4.  Connect your GitHub repository.
5.  **Configuration:**
    *   **Name:** `chillcall-backend` (or any name)
    *   **Region:** Choose the one closest to you.
    *   **Branch:** `main`
    *   **Root Directory:** `backend` (Important! This tells Render to look for the Dockerfile here)
    *   **Runtime:** `Docker`
    *   **Instance Type:** `Free`
6.  Click **Create Web Service**.
7.  Wait for the build to finish. Once deployed, Render will provide a URL (e.g., `https://chillcall-backend.onrender.com`).
    *   *Note: The free tier spins down after inactivity, so the first request might take 50+ seconds.*

**Important URL:**
Your WebSocket URL will be the Render URL with `wss://` instead of `https://` and appending `/signaling`.
Example: `wss://chillcall-backend.onrender.com/signaling`

### 2. Frontend Deployment (Vercel)

Vercel is perfect for hosting Vite React apps.

1.  Sign up/Log in to [Vercel](https://vercel.com/).
2.  Click **Add New...** -> **Project**.
3.  Import your GitHub repository.
4.  **Configuration:**
    *   **Framework Preset:** `Vite` (Should detect automatically)
    *   **Root Directory:** Click "Edit" and select `frontend-react`.
    *   **Environment Variables:**
        *   Key: `VITE_WEBSOCKET_URL`
        *   Value: Your Backend WebSocket URL (e.g., `wss://chillcall-backend.onrender.com/signaling`)
5.  Click **Deploy**.

---

## Option 2: Google Cloud Platform (GCP)

If you have a Google Cloud account (or Google Cloud Credits), this provides a robust, scalable environment.

### 1. Backend Deployment (Cloud Run)

Cloud Run is a fully managed serverless platform for containerized applications.

**Prerequisites:**
- [Google Cloud CLI (`gcloud`)](https://cloud.google.com/sdk/docs/install) installed and authenticated.
- A Google Cloud Project created.

**Steps:**

1.  **Navigate to backend directory:**
    ```bash
    cd backend
    ```

2.  **Submit Build to Cloud Build:**
    Replace `YOUR_PROJECT_ID` with your actual project ID.
    ```bash
    gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/chillcall-backend
    ```

3.  **Deploy to Cloud Run:**
    ```bash
    gcloud run deploy chillcall-backend \
      --image gcr.io/YOUR_PROJECT_ID/chillcall-backend \
      --platform managed \
      --region us-central1 \
      --allow-unauthenticated
    ```

4.  **Get the URL:**
    After deployment, the command will output a Service URL (e.g., `https://chillcall-backend-xyz-uc.a.run.app`).
    Your WebSocket URL will be `wss://chillcall-backend-xyz-uc.a.run.app/signaling`.

### 2. Frontend Deployment (Firebase Hosting)

Firebase Hosting provides fast, secure hosting for web apps.

**Prerequisites:**
- Node.js installed.
- Firebase CLI: `npm install -g firebase-tools`

**Steps:**

1.  **Navigate to frontend directory:**
    ```bash
    cd frontend-react
    ```

2.  **Initialize Firebase:**
    ```bash
    firebase login
    firebase init hosting
    ```
    *   **Project:** Select your existing Google Cloud Project.
    *   **Public directory:** `dist`
    *   **Configure as a single-page app?** `Yes`
    *   **Set up automatic builds and deploys with GitHub?** `No` (for now)

3.  **Build the App:**
    You must provide the Backend URL during the build.
    ```bash
    export VITE_WEBSOCKET_URL="wss://YOUR-CLOUD-RUN-URL/signaling"
    npm run build
    ```
    *(On Windows PowerShell: `$env:VITE_WEBSOCKET_URL="..."; npm run build`)*

4.  **Deploy:**
    ```bash
    firebase deploy
    ```

5.  **Access:**
    The CLI will output your Hosting URL.

---

## Verify Deployment

1.  Open your App URL (Vercel or Firebase).
2.  Open the Browser Console (F12).
3.  Click **[ CONNECT_UPLINK ]**.
4.  If connected successfully, you should see `[WS] Connected` in the console.

## Troubleshooting

*   **WebSocket Error:** Check if you are using `wss://` (Secure WebSocket) for production URLs. Browsers block `ws://` connections from `https://` sites.
*   **Connection Timeout:** If the backend is on Render's free tier, it might be "sleeping". Try connecting again after a minute.
