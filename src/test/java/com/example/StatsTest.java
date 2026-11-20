package com.example;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.assertEquals;

public class StatsTest {
    @Test
    void average_keepsTheFraction() {
        assertEquals(1.5, new Stats().average(new int[] {1, 2}), 1e-9);
    }
}
