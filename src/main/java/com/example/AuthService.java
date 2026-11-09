package com.example;

public class AuthService {
    public boolean isAdmin(String role) {
        return "admin".equals(role); // Use value equality; '==' compares object references and fails for DB strings
    }
}
