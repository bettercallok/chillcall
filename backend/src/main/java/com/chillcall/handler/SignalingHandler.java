package com.chillcall.handler;

import com.chillcall.model.Room;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.time.Duration;
import java.time.Instant;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Component
public class SignalingHandler extends TextWebSocketHandler {

    private final ObjectMapper objectMapper = new ObjectMapper();

    // 1. Storage for Rooms (Key = RoomID)
    private final ConcurrentHashMap<String, Room> rooms = new ConcurrentHashMap<>();

    // 2. Fast lookup: Which room is this session in? (Key = SessionID)
    private final ConcurrentHashMap<String, String> sessionToRoom = new ConcurrentHashMap<>();

    // 3. Fast lookup: Who is this user? (Key = SessionID)
    private final ConcurrentHashMap<String, String> sessionToUserId = new ConcurrentHashMap<>();

    // --- CONNECTION EVENTS ---

    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        log.info("New WebSocket connection: {}", session.getId());
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        log.info("Connection closed: {}", session.getId());
        cleanupSession(session);
    }

    // --- MAIN MESSAGE HANDLER ---

    @Override
    public void handleTextMessage(WebSocketSession session, TextMessage message) {
        try {
            JsonNode jsonMessage = objectMapper.readTree(message.getPayload());

            if (!jsonMessage.has("type")) {
                log.warn("Message missing 'type' field from {}", session.getId());
                return;
            }

            String type = jsonMessage.get("type").asText();
            log.info("Received: {} from {}", type, session.getId());

            switch (type) {
                case "create_room":
                    handleCreateRoom(session, jsonMessage);
                    break;
                case "join_room":
                    handleJoinRoom(session, jsonMessage);
                    break;
                case "offer":
                case "answer":
                case "ice_candidate":
                    relaySignaling(session, jsonMessage);
                    break;
                case "leave_room":
                    cleanupSession(session);
                    break;
                default:
                    log.warn("Unknown message type: {}", type);
            }
        } catch (Exception e) {
            log.error("Error handling message", e);
        }
    }

    // --- LOGIC METHODS ---

    private void handleCreateRoom(WebSocketSession session, JsonNode message) throws IOException {
        String roomId = UUID.randomUUID().toString();
        String userId = message.has("userId")
                ? message.get("userId").asText()
                : "User-" + session.getId().substring(0, 8);

        Room room = new Room(roomId);
        rooms.put(roomId, room);

        // Add the creator
        room.getParticipants().add(session);
        sessionToRoom.put(session.getId(), roomId);
        sessionToUserId.put(session.getId(), userId);

        Map<String, Object> response = new HashMap<>();
        response.put("type", "room_created");
        response.put("roomId", roomId);
        response.put("userId", userId);

        session.sendMessage(new TextMessage(objectMapper.writeValueAsString(response)));
        log.info("Room created{} by user:{}", roomId, userId);

    }

    private void handleJoinRoom(WebSocketSession session, JsonNode message) throws IOException {
        String roomId = message.get("roomId").asText();
        String userId = message.has("userID") ? message.get("userID").asText()
                : "User-" + session.getId().substring(0, 8);
        Room room = rooms.get(roomId);
        if (room == null) {
            sendError(session, "Room not found");
            return;
        }
        if (!room.canJoin()) {
            sendError(session, "Room is full");
            return;
        }

        room.getParticipants().add(session);
        sessionToRoom.put(session.getId(), roomId);
        sessionToUserId.put(session.getId(), userId);
        List<Map<String, String>> existingParticipants = new ArrayList<>();
        for (WebSocketSession s : room.getParticipants()) {
            if (!s.getId().equals(session.getId())) {
                Map<String, String> p = new HashMap<>();
                p.put("sessionId", s.getId());
                p.put("userId", sessionToUserId.getOrDefault(s.getId(), "Unknown"));
                existingParticipants.add(p);
            }
        }
        Map<String, Object> joinaNotification = new HashMap<>();
        joinaNotification.put("type", "participant_joined");
        joinaNotification.put("sessionId", session.getId());
        joinaNotification.put("userId", userId);
        broadcastToRoom(roomId, joinaNotification, session.getId());

        Map<String, Object> welcomeMessage = new HashMap<>();
        welcomeMessage.put("type", "room_joined");
        welcomeMessage.put("roomId", roomId);
        welcomeMessage.put("userId", userId);
        welcomeMessage.put("participants", existingParticipants);

        session.sendMessage(new TextMessage(objectMapper.writeValueAsString(welcomeMessage)));
        log.info("User {} joined room {}", userId, roomId);

    }

    private void relaySignaling(WebSocketSession sender, JsonNode message) throws IOException {
        String roomId = sessionToRoom.get(sender.getId());
        String targetSessionId = message.get("target").asText();
        Room room = rooms.get(roomId);
        if (room != null) {
            for (WebSocketSession target : room.getParticipants()) {
                if (target.getId().equals(targetSessionId)) {
                    // Forward the message to the specific target
                    Map<String, Object> relayMessage = objectMapper.convertValue(message, Map.class);
                    relayMessage.put("from", sender.getId());

                    target.sendMessage(new TextMessage(objectMapper.writeValueAsString(relayMessage)));
                    log.debug("Relayed {} from {} to {}", message.get("type").asText(), sender.getId(),
                            targetSessionId);
                    return;
                }
            }

        }
    }

    private void handleLeaveRoom(WebSocketSession session) throws IOException {
        cleanupSession(session);

    }

    private void cleanupSession(WebSocketSession session) {
        String roomId = sessionToRoom.remove(session.getId());
        String userId = sessionToUserId.remove(session.getId());

        if (roomId != null) {
            Room room = rooms.get(roomId);
            if (room != null) {
                room.getParticipants().remove(session);

                // Notify others
                Map<String, Object> leaveNotification = new HashMap<>();
                leaveNotification.put("type", "participant_left");
                leaveNotification.put("sessionId", session.getId());
                leaveNotification.put("userId", userId);
                broadcastToRoom(roomId, leaveNotification, null);

                // Delete room if empty
                if (room.isEmpty()) {
                    rooms.remove(roomId);
                    log.info("Room {} deleted (empty)", roomId);
                }
            }
        }
    }

    private void broadcastToRoom(String roomId, Map<String, Object> message, String excludeSessionId) {
        Room room = rooms.get(roomId);
        if (room != null) {
            for (WebSocketSession s : room.getParticipants()) {
                if (excludeSessionId == null || !s.getId().equals(excludeSessionId)) {
                    try {
                        s.sendMessage(new TextMessage(objectMapper.writeValueAsString(message)));
                    } catch (IOException e) {
                        log.error("Error broadcasting", e);
                    }
                }
            }
        }
    }

    private void sendError(WebSocketSession session, String errorMessage) {
        try {
            Map<String, Object> error = new HashMap<>();
            error.put("type", "error");
            error.put("message", errorMessage);
            session.sendMessage(new TextMessage(objectMapper.writeValueAsString(error)));
        } catch (IOException e) {
            log.error("Error sending error message", e);
        }
    }

    // Cleanup stale rooms every 5 minutes
    // Cleanup stale rooms every 5 minutes
    @Scheduled(fixedRate = 300000)
    public void cleanupStaleRooms() {
        Instant cutoff = Instant.now().minus(Duration.ofHours(2));
        int removed = 0;

        // Use an iterator to safely remove and count at the same time
        var iterator = rooms.entrySet().iterator();
        while (iterator.hasNext()) {
            var entry = iterator.next();
            if (entry.getValue().getCreatedAt().isBefore(cutoff) && entry.getValue().isEmpty()) {
                iterator.remove();
                removed++;
            }
        }

        if (removed > 0) {
            log.info("Cleaned up {} stale rooms", removed);
        }
    }
}
