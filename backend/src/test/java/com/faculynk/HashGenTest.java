package com.faculynk;

import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class HashGenTest {
    @Test
    public void generateHash() {
        System.out.println("HASH: " + new BCryptPasswordEncoder().encode("password123"));
    }
}
