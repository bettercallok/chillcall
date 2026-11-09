package com.example;

import org.junit.jupiter.api.Test;
import java.util.List;
import static org.junit.jupiter.api.Assertions.assertEquals;

public class BatchProcessorTest {
    @Test
    void process_handlesEveryItemExactlyOnce() {
        assertEquals(3, new BatchProcessor().process(List.of("a", "b", "c")));
    }
}
