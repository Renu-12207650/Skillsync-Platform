/*
 * SPRING BOOT TEST CLASS
 * ======================
 * 
 * TERMINAL COMMANDS TO RUN TESTS:
 * ------------------------------
 * 
 * 1. Run all tests:
 *    mvn test
 * 
 * 2. Run specific test:
 *    mvn test -Dtest=DemoApplicationTests
 * 
 * 3. Run tests and create report:
 *    mvn clean test
 * 
 * 4. Skip tests during build:
 *    mvn clean package -DskipTests
 */

package com.example.demo;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

/**
 * Integration test for DemoApplication.
 * Uses @SpringBootTest to load full application context.
 */
@SpringBootTest
class DemoApplicationTests {

    /**
     * Tests that Spring context loads successfully.
     * If this passes, basic configuration is correct.
     */
    @Test
    void contextLoads() {
        // Test passes if context loads without errors
    }
}
