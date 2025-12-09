package com.chillcall;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class ChillCallApplication {

    public static void main(String[] args) {
        SpringApplication.run(ChillCallApplication.class, args);
    }
}
