package com.example;

public class AuthService {
    public boolean isAdmin(String role) {
        return "admin".equals(role);
    }
}
