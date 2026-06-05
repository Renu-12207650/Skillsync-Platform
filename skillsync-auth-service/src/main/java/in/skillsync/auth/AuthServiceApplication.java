package in.skillsync.auth;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.scheduling.annotation.EnableAsync;

/**
 * SkillSync Authentication Service
 * Handles user registration, login, and JWT token issuance.
 * Port: 9081
 * Swagger UI: http://localhost:9081/swagger-ui.html
 *
 * ComponentScan includes skillsync-common so that JwtTokenProvider,
 * GlobalExceptionHandler, SwaggerConfig, CacheConfig are auto-detected.
 */
@SpringBootApplication
@EnableDiscoveryClient
@EnableAsync
@ComponentScan(basePackages = {
        "in.skillsync.auth",
        "in.skillsync.common"
})
public class AuthServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(AuthServiceApplication.class, args);
    }
}
