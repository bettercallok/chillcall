package com.example;
import java.util.List;

public class BatchProcessor {
    public void process(List<String> items) {
        // BUG: <= size() will throw IndexOutOfBoundsException
        for (int i = 0; i <= items.size(); i++) {
            System.out.println(items.get(i));
        }
    }
}
