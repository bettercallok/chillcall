package com.example;

public class HttpClientConfig {
    public static final int DEFAULT_TIMEOUT_SECONDS = 30;

    private final int timeoutSeconds;

    public HttpClientConfig() {
        this(DEFAULT_TIMEOUT_SECONDS);
    }

    public HttpClientConfig(int timeoutSeconds) {
        this.timeoutSeconds = timeoutSeconds;
    }

    public int timeoutSeconds() {
        return timeoutSeconds;
    }
}
