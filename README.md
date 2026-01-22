# ChillCall

A peer-to-peer video calling application with real-time WebRTC communication, built-in chat, games, and media sharing.

**This is the Modern React Version (Branch: `main`)**
> Looking for the original Vanilla JS version? Switch to the [`legacy`](https://github.com/bettercallok/chillcall/tree/legacy) branch.

## Features

- **Video Calls**: Multi-user video conferencing (up to 4 participants)
- **Real-time Chat**: Text messaging between call participants (P2P via Data Channels)
- **Tic-Tac-Toe**: Collaborative multiplayer game with state synchronization
- **Media Player**: Synchronized floating player for Spotify, YouTube, and Apple Music
- **Cinema Mode**: Drag & Drop interface with floating video cards
- **Brutalist UI**: Custom retro-terminal aesthetic

## Tech Stack

### Frontend (React)
- **Framework**: React 18 + Vite
- **Styling**: TailwindCSS + Custom CSS Variables
- **Architecture**: Context API for global state management
- **Communication**: WebRTC (Mesh topology) + Socket.IO (Signaling)

### Backend (Java)
- **Runtime**: Java 17+
- **Framework**: Spring Boot 3.2
- **Protocol**: WebSocket (Raw) for signaling

## Getting Started

### Prerequisites
- Node.js 18+ & npm
- Java 17+ & Maven

### 1. Running the Backend (Signaling Server)

The backend handles the initial handshake (Signaling) to establish P2P connections.

```bash
cd backend
mvn spring-boot:run
```
*Server starts on `ws://localhost:8080/signaling`*

### 2. Running the Frontend (React App)

```bash
cd frontend-react
npm install
npm run dev
```
*Open `http://localhost:5173` in your browser.*

## Usage

### Creating a Room
1. Leave the Room ID field empty
2. Click **[ CONNECT_UPLINK ]**
3. Copy the generated Room ID (displayed in top header)

### Joining a Room
1. Paste the Room ID from another user
2. Click **[ CONNECT_UPLINK ]**
3. Video streams connect automatically via WebRTC

### Collaborative Tools
- **Media Player**: Click the Apple/Spotify/YouTube icons in the dock. Pasting a link syncs it for everyone.
- **Game Center**: Click the Gamepad icon to open the shared Tic-Tac-Toe board.
- **Drag & Drop**: Drag your local or remote video cards anywhere on the screen.

## Project Structure

```
chillcall/
├── frontend-react/         # React Application
│   ├── src/
│   │   ├── components/     # UI Components (VideoCard, ChatSidebar, etc.)
│   │   ├── context/        # CallContext (WebRTC/Socket Logic)
│   │   └── hooks/          # Custom Hooks
│   └── public/
└── backend/                # Spring Boot Application
    └── src/main/java/      # Signaling Handler & Socket Config
```

## Architecture

1.  **Signaling**: Spring Boot acts as a lightweight broker to exchange SDP offers/answers.
2.  **P2P Mesh**: Once connected, all video, audio, chat, and game data flows directly between peers via `RTCPeerConnection`.
3.  **State Sync**: `AppScreen.jsx` and `CallContext` handle synchronization of UI states (Game open/close, Media URL) across the mesh.
