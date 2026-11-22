package com.example;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

public class RateLimiterTest {
    @Test
    void allow_admitsExactlyLimitRequests() {
        RateLimiter limiter = new RateLimiter(3);
        assertTrue(limiter.allow(2));
        assertFalse(limiter.allow(3));
    }
}
