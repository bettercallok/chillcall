package com.example;

public class Stats {
    public double average(int[] values) {
        if (values.length == 0) {
            return 0.0;
        }
        int sum = 0;
        for (int v : values) {
            sum += v;
        }
        return sum / values.length;
    }
}
