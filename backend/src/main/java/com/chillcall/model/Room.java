package com.chillcall.model;

import lombok.Data;
import org.springframework.web.socket.WebSocketSession;

import java.time.Instant;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Data
public class Room {
    private String roomId;
    // Thread-safe set to store participants
    private Set<WebSocketSession> participants;
    private Instant createdAt;
    private int maxParticipants = 4;

    public Room(String roomId) {
        this.roomId = roomId;
        // logic: concurrent set is required because multiple users might join/leave at
        // the same time
        this.participants = ConcurrentHashMap.newKeySet();
        this.createdAt = Instant.now();
    }

    public boolean canJoin() {
        return participants.size() < maxParticipants;
    }

    public boolean isEmpty() {
        return participants.isEmpty();
    }

}