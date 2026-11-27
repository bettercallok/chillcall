package com.example;

import java.util.List;

public class BatchProcessor {
    public int process(List<String> items) {
        int processed = 0;
        for (int i = 0; i <= items.size(); i++) {
            System.out.println(items.get(i));
            processed++;
        }
        return processed;
    }
}
