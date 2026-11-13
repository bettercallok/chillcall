package com.example;

public class RateLimiter {
    private final int limit;

    public RateLimiter(int limit) {
        this.limit = limit;
    }

    /** True if one more request is allowed after {@code requestsSoFar}. */
    public boolean allow(int requestsSoFar) {
        return requestsSoFar <= limit;
    }
}
