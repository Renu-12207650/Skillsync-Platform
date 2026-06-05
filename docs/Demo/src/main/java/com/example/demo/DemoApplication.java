/*
 * SPRING BOOT DEMO APPLICATION
 * ============================
 * 
 * TERMINAL COMMANDS TO RUN THIS APPLICATION:
 * ------------------------------------------
 * 
 * 1. Navigate to project directory:
 *    cd c:\SprintSkillSync\docs\Demo
 * 
 * 2. Run using Maven Spring Boot plugin:
 *    mvn spring-boot:run
 * 
 * 3. Clean and run (recommended after changes):
 *    mvn clean spring-boot:run
 * 
 * 4. Build JAR file:
 *    mvn clean package
 * 
 * 5. Run the built JAR:
 *    java -jar target\Demo-1.0.0.jar
 * 
 * 6. Run in debug mode:
 *    mvn spring-boot:run -Dspring-boot.run.jvmArguments="-Xdebug -Xrunjdwp:transport=dt_socket,server=y,suspend=n,address=5005"
 * 
 * 7. Run with specific Spring profile:
 *    mvn spring-boot:run -Dspring-boot.run.profiles=dev
 * 
 * VERIFICATION:
 * -------------
 * - Application starts on: http://localhost:8080
 * - Health check: http://localhost:8080/actuator/health
 * - Should return: {"status":"UP"}
 * 
 * STOP THE APPLICATION:
 * ---------------------
 * Press Ctrl+C in the terminal
 */

package com.example.demo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Main entry point for the Spring Boot Demo application.
 * 
 * @SpringBootApplication - Combines:
 *   @Configuration - Marks as configuration class
 *   @EnableAutoConfiguration - Auto-configures Spring
 *   @ComponentScan - Scans for components in this package and sub-packages
 */
@SpringBootApplication
public class DemoApplication {

    /**
     * Main method - application entry point.
     * 
     * @param args command line arguments
     */
    public static void main(String[] args) {
        SpringApplication.run(DemoApplication.class, args);
        System.out.println("========================================");
        System.out.println("  DEMO APPLICATION STARTED!");
        System.out.println("  URL: http://localhost:8080");
        System.out.println("  Health: http://localhost:8080/actuator/health");
        System.out.println("========================================");
    }
}

/**
 * Simple REST Controller to test the application.
 * URL: http://localhost:8080/hello
 */
@RestController
class HelloController {
    
    @GetMapping("/hello")
    public String hello() {
        return "Hello from Spring Boot Demo!";
    }
    
    @GetMapping("/")
    public String home() {
        return "Demo Application is running! Try /hello endpoint.";
    }
}
