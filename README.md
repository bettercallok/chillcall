# ChillCall

A peer-to-peer video calling application with real-time WebRTC communication, built-in chat, games, and media sharing.

## Features

- **Video Calls**: Multi-user video conferencing (up to 4 participants)
- **Real-time Chat**: Text messaging between call participants
- **Tic-Tac-Toe**: Built-in multiplayer game
- **Media Sharing**: Embed Spotify, YouTube, and Apple Music links

## Tech Stack

### Frontend
- HTML/CSS/JavaScript
- TailwindCSS
- WebRTC API
- Font Awesome icons

### Backend
- Java 17+
- Spring Boot 3.2
- WebSocket for signaling

## Getting Started

### Prerequisites
- Java 17 or higher
- Maven
- Modern web browser with WebRTC support

### Running the Backend

```bash
cd backend
mvn spring-boot:run
```

The signaling server starts on `ws://localhost:8080/signaling`

### Running the Frontend

```bash
cd frontend
python3 -m http.server 3000
```

Open `http://localhost:3000` in your browser.

## Usage

### Creating a Room
1. Leave the Room ID field empty
2. Click "Connect_Uplink"
3. Copy the generated Room ID (UUID shown in FREQ header)

### Joining a Room
1. Paste the Room ID from another user
2. Click "Connect_Uplink"
3. Video streams connect automatically

### Media Player
1. Click Spotify, YouTube, or Apple Music button in the dock
2. Paste a link from that service
3. Click "Load" to embed

## Project Structure

```
chillcall/
├── backend/
│   └── src/main/java/com/chillcall/
│       ├── ChillCallApplication.java
│       ├── config/
│       │   └── WebSocketConfig.java
│       ├── handler/
│       │   └── SignalingHandler.java
│       └── model/
│           └── Room.java
└── frontend/
    └── index.html
```

## Architecture

1. **Signaling Server** (Spring Boot WebSocket)
   - Handles room creation/joining
   - Routes WebRTC offers, answers, and ICE candidates between peers

2. **WebRTC Peer Connections**
   - Direct peer-to-peer video/audio streams
   - Data channels for chat and game state

3. **Frontend**
   - Single-page application
   - Brutalist/retro terminal design aesthetic


