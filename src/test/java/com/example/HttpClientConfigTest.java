package com.example;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.assertTrue;

public class HttpClientConfigTest {
    @Test
    void defaultTimeout_isPositive() {
        // 0 means "wait forever" to most HTTP clients: a hung upstream hangs us.
        assertTrue(new HttpClientConfig().timeoutSeconds() > 0);
    }
}
