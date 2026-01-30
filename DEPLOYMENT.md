# Deployment Guide

This guide explains how to host ChillCall for free using **Render** (for Backend) and **Vercel** (for Frontend).

## 1. Backend Deployment (Render)

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

## 2. Frontend Deployment (Vercel)

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

## 3. Verify Deployment

1.  Open your Vercel App URL.
2.  Open the Browser Console (F12).
3.  Click **[ CONNECT_UPLINK ]**.
4.  If connected successfully, you should see `[WS] Connected` in the console.

## Troubleshooting

*   **WebSocket Error:** Check if you are using `wss://` (Secure WebSocket) for production URLs. Browsers block `ws://` connections from `https://` sites.
*   **Connection Timeout:** If the backend is on Render's free tier, it might be "sleeping". Try connecting again after a minute.
