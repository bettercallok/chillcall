package com.example;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.assertTrue;

public class AuthServiceTest {
    @Test
    void isAdmin_comparesTheRoleByValue() {
        // A role read from a request or the database is a distinct String instance.
        assertTrue(new AuthService().isAdmin(new String("admin")));
    }
}
