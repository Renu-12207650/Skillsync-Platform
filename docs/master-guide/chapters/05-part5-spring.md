<div class="part-divider">
<div class="part-label">Part V</div>
<div class="part-title">Spring & Spring Boot</div>
<div class="part-desc">Spring Boot is the framework powering SkillSync's backend. This part covers everything from dependency injection and REST controllers to JPA, security with JWT, microservices patterns, and the global exception handler that ties it all together.</div>
</div>

# 30. Spring Core: IoC & Dependency Injection

<span class="chapter-label">Chapter 30</span>

## 30.1 The core principle

> "Don't create your dependencies. Ask for them."

**Without DI:**
```java
class AuthService {
    // Tight coupling! Hard to test, hard to change
    AuthUserRepository repo = new AuthUserRepositoryImpl();
    EmailService email = new SmtpEmailService("smtp.gmail.com", 587);
}
```

**With DI (SkillSync style):**
```java
@Service
@RequiredArgsConstructor
class AuthService {
    private final AuthUserRepository repo;
    private final EmailService emailService;
    // Spring injects these via constructor
}
```

## 30.2 IoC vs DI

| | Inversion of Control | Dependency Injection |
|---|---|---|
| What | Pattern: framework controls flow | Implementation of IoC |
| How | Container creates/wires objects | Objects receive dependencies |
| Analogy | Restaurant: you order, kitchen makes | Chef receives ingredients |

## 30.3 Injection types compared

| Type | Pros | Cons | Use when |
|---|---|---|---|
| **Constructor** | Immutable, testable, fail-fast | Verbose without Lombok | **Default choice** |
| **Setter** | Optional dependencies, can change | Mutable, easy to forget | Optional deps |
| **Field** (`@Autowired`) | Less code | Hard to test, hidden deps | Avoid — anti-pattern |

> Remember: "Constructor inject = mandatory dep. Setter = optional. Field = lazy + bad."

## 30.4 Bean scopes

| Scope | Lifespan | Use case |
|---|---|---|
| `singleton` (default) | One per container | Stateless services |
| `prototype` | New per injection | Stateful, per-request objects |
| `request` | Per HTTP request | Request-scoped data |
| `session` | Per HTTP session | User session data |
| `application` | Per ServletContext | App-wide data |

**Gotcha:** Injecting `prototype` into `singleton` → you get the SAME prototype forever. Fix with `ObjectFactory<PrototypeBean>` or `@Lookup`.

---

# 31. Spring Boot Essentials

<span class="chapter-label">Chapter 31</span>

## 31.1 Spring vs Spring Boot

| | Spring Framework | Spring Boot |
|---|---|---|
| Configuration | XML or Java config | Auto-configuration |
| Server | Deploy to external Tomcat | Embedded Tomcat/Jetty |
| Dependencies | Manual version management | Starter POMs |
| Production | Manual setup | Actuator, metrics out of box |
| Annotations | `@Configuration`, `@Bean` | `@SpringBootApplication` |

## 31.2 Key annotations

| Annotation | Meaning |
|---|---|
| `@SpringBootApplication` | `@Configuration` + `@EnableAutoConfiguration` + `@ComponentScan` |
| `@Component` | Generic Spring bean |
| `@Service` | Business logic layer |
| `@Repository` | Data access layer (adds exception translation) |
| `@Controller` | Web controller (returns views) |
| `@RestController` | REST controller (@Controller + @ResponseBody) |
| `@Configuration` | Java-based configuration class |
| `@Bean` | Explicit bean definition in config class |

## 31.3 Configuration properties

```yaml
# application.yml
server:
  port: 8081

spring:
  datasource:
    url: jdbc:mysql://localhost:3306/skillsync
    username: ${DB_USER:skillsync}
    password: ${DB_PASS:secret}
  
  jpa:
    hibernate:
      ddl-auto: validate
    show-sql: true

jwt:
  secret: ${JWT_SECRET:defaultdevsecretmustbechanged}
  expiration: 86400000  # 24 hours in ms
```

Map to Java:
```java
@ConfigurationProperties(prefix = "jwt")
@Data
public class JwtProperties {
    private String secret;
    private long expiration;
}
```

---

# 32. Spring MVC & REST Controllers

<span class="chapter-label">Chapter 32</span>

## 32.1 Request mapping

```java
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;
    
    @GetMapping("/{id}")                    // GET /api/users/42
    public UserDTO getUser(@PathVariable Long id) {
        return userService.findById(id);
    }
    
    @PostMapping                            // POST /api/users
    public ResponseEntity<UserDTO> create(@RequestBody @Valid UserCreateRequest req) {
        UserDTO created = userService.create(req);
        URI location = ServletUriComponentsBuilder
            .fromCurrentRequest()
            .path("/{id}")
            .buildAndExpand(created.getId())
            .toUri();
        return ResponseEntity.created(location).body(created);
    }
    
    @PutMapping("/{id}")                     // PUT /api/users/42
    public UserDTO update(@PathVariable Long id, @RequestBody UserUpdateRequest req) {
        return userService.update(id, req);
    }
    
    @DeleteMapping("/{id}")                  // DELETE /api/users/42
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        userService.delete(id);
    }
}
```

## 32.2 Common annotations

| Annotation | Purpose |
|---|---|
| `@PathVariable` | Extract from URL path `/users/{id}` |
| `@RequestParam` | Extract from query `?name=John&age=25` |
| `@RequestBody` | Deserialize JSON to object |
| `@RequestHeader` | Extract header value |
| `@CookieValue` | Extract cookie value |
| `@ModelAttribute` | Bind form data to object |

## 32.3 Content negotiation

```java
// Accepts and produces JSON
@GetMapping(value = "/{id}", produces = MediaType.APPLICATION_JSON_VALUE)

// Multiple representations
@GetMapping(value = "/{id}", produces = { "application/json", "application/xml" })
```

---

# 33. Spring Data JPA

<span class="chapter-label">Chapter 33</span>

## 33.1 The repository pattern

```java
public interface UserRepository extends JpaRepository<User, Long> {
    // Custom finder methods (Spring generates implementation)
    Optional<User> findByEmail(String email);
    List<User> findByRoleAndStatus(Role role, Status status);
    boolean existsByEmail(String email);
    
    // Custom query with JPQL
    @Query("SELECT u FROM User u WHERE u.lastLogin > :since")
    List<User> findRecentUsers(@Param("since") LocalDateTime since);
    
    // Native SQL
    @Query(value = "SELECT * FROM users WHERE created_at > :since", nativeQuery = true)
    List<User> findRecentNative(@Param("since") LocalDateTime since);
}
```

## 33.2 Method name keywords

| Keyword | Example | Generates |
|---|---|---|
| `And` | `findByNameAndStatus` | `WHERE name=? AND status=?` |
| `Or` | `findByNameOrEmail` | `WHERE name=? OR email=?` |
| `Like` | `findByNameLike` | `WHERE name LIKE ?` |
| `StartingWith` | `findByNameStartingWith` | `WHERE name LIKE '?%'` |
| `GreaterThan` | `findByAgeGreaterThan` | `WHERE age > ?` |
| `OrderBy` | `findByStatusOrderByNameAsc` | `ORDER BY name ASC` |

## 33.3 Entity lifecycle

```java
@Entity
@Table(name = "users")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true)
    private String email;
    
    @Column(name = "full_name", length = 100)
    private String fullName;
    
    @Enumerated(EnumType.STRING)
    private Role role;
    
    @CreatedDate
    private Instant createdAt;
    
    @LastModifiedDate
    private Instant updatedAt;
}
```

## 33.4 Relationships

```java
@Entity
public class Order {
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;  // Order has one User
    
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL)
    private List<OrderItem> items;  // Order has many Items
}

@Entity
public class OrderItem {
    @ManyToOne
    @JoinColumn(name = "order_id")
    private Order order;  // Item belongs to one Order
}
```

| Annotation | Meaning | Database |
|---|---|---|
| `@OneToOne` | One entity, one related entity | Foreign key or shared PK |
| `@ManyToOne` | Many entities refer to one | Foreign key |
| `@OneToMany` | One entity has many | Foreign key in "many" table |
| `@ManyToMany` | Many-to-many | Join table |

---

# 34. Bean Validation

<span class="chapter-label">Chapter 34</span>

## 34.1 Built-in constraints

```java
public class RegisterRequest {
    @NotBlank
    @Email
    private String email;
    
    @NotBlank
    @Size(min = 8, max = 100)
    @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).+$",
             message = "Password must contain uppercase, lowercase, and digit")
    private String password;
    
    @NotNull
    @Min(18)
    @Max(120)
    private Integer age;
    
    @AssertTrue(message = "Must accept terms")
    private Boolean termsAccepted;
}
```

## 34.2 Common constraints

| Annotation | Validates |
|---|---|
| `@NotNull` | Value is not null |
| `@NotBlank` | String not null and not whitespace-only |
| `@NotEmpty` | String/Collection/Map not null and not empty |
| `@Size(min, max)` | String/Collection length within range |
| `@Min` / `@Max` | Number within range |
| `@DecimalMin` / `@DecimalMax` | Decimal within range |
| `@Pattern(regex)` | Matches regex |
| `@Email` | Valid email format |
| `@Future` / `@Past` | Date in future/past |
| `@Valid` | Cascade validation to nested object |

## 34.3 Using in controllers

```java
@PostMapping("/register")
public ResponseEntity<Void> register(@Valid @RequestBody RegisterRequest req) {
    // Only reached if validation passes
}

// Or validate programmatically
@Autowired
private Validator validator;

Set<ConstraintViolation<RegisterRequest>> violations = validator.validate(request);
```

---

# 35. Spring Security

<span class="chapter-label">Chapter 35</span>

## 35.1 Core concepts

| Concept | Meaning |
|---|---|
| **Authentication** | Who are you? (verify identity) |
| **Authorization** | What can you do? (check permissions) |
| **Principal** | The currently authenticated user |
| **GrantedAuthority** | Permission/role (e.g., `ROLE_ADMIN`) |

## 35.2 Filter chain

Every request passes through a chain of filters:

```
Request → CsrfFilter → UsernamePasswordFilter → BasicAuthFilter → 
          JwtFilter → AnonymousFilter → ExceptionTranslationFilter → 
          FilterSecurityInterceptor (authorization)
```

## 35.3 Configuration

```java
@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())  // For stateless JWT APIs
            .sessionManagement(session -> 
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/auth/**").permitAll()
                .requestMatchers("/admin/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/**").authenticated()
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);
        
        return http.build();
    }
}
```

## 35.4 Method security

```java
@RestController
public class AdminController {
    
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/admin/users")
    public List<User> listUsers() { ... }
    
    @PreAuthorize("hasRole('ADMIN') or #userId == authentication.principal.id")
    @GetMapping("/users/{userId}/private-data")
    public PrivateData getData(@PathVariable Long userId) { ... }
}
```

---

# 36. JWT in Depth

<span class="chapter-label">Chapter 36</span>

## 36.1 JWT vs Session

| | Session | JWT |
|---|---|---|
| Storage | Server-side (memory/Redis) | Client-side (token) |
| Scalability | Sticky sessions or shared store needed | Stateless — any server can verify |
| Payload size | Small (~32 bytes) | Larger (~500 bytes) |
| Revocation | Easy (delete from store) | Hard (token valid until expiry) |
| CSRF risk | Yes (cookies auto-sent) | No (header manually attached) |

> Why SkillSync uses JWT: Microservices need to be stateless. With sessions, every service would need to query a shared session store — bottleneck.

## 36.2 JWT structure

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.  ← Header (algorithm, type)
eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.  ← Payload (claims)
SflKxwRJSMeKKF2QT4fwpMe...  ← Signature
```

**Header:**
```json
{ "alg": "HS256", "typ": "JWT" }
```

**Payload (claims):**
```json
{
  "sub": "user-id-123",
  "email": "user@example.com",
  "roles": ["LEARNER", "MENTOR"],
  "iat": 1516239022,
  "exp": 1516242622
}
```

**Signature:** `HMACSHA256(base64Url(header) + "." + base64Url(payload), secret)`

## 36.3 Implementation in SkillSync

```java
@Component
public class JwtService {
    @Value("${jwt.secret}")
    private String secret;
    
    private final long ACCESS_TOKEN_VALIDITY = 15 * 60 * 1000;  // 15 minutes
    private final long REFRESH_TOKEN_VALIDITY = 7 * 24 * 60 * 60 * 1000;  // 7 days
    
    public String generateToken(User user) {
        Map<String, Object> claims = Map.of(
            "roles", user.getRoles(),
            "email", user.getEmail()
        );
        
        return Jwts.builder()
            .setClaims(claims)
            .setSubject(user.getId().toString())
            .setIssuedAt(new Date())
            .setExpiration(new Date(System.currentTimeMillis() + ACCESS_TOKEN_VALIDITY))
            .signWith(SignatureAlgorithm.HS512, secret)
            .compact();
    }
    
    public Claims validateToken(String token) {
        return Jwts.parser()
            .setSigningKey(secret)
            .parseClaimsJws(token)
            .getBody();
    }
}
```

---

# 37. Global Exception Handling

<span class="chapter-label">Chapter 37</span>

## 37.1 The pattern

Don't `try-catch` in every controller. Handle all exceptions in ONE place.

```java
@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {
    
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(ResourceNotFoundException ex) {
        return ResponseEntity
            .status(HttpStatus.NOT_FOUND)
            .body(ErrorResponse.of(ex.getMessage()));
    }
    
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidation(
            MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(error ->
            errors.put(error.getField(), error.getDefaultMessage())
        );
        return ResponseEntity.badRequest().body(
            Map.of("status", 400, "error", "Validation Failed", "errors", errors)
        );
    }
    
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneric(Exception ex) {
        log.error("Unexpected error", ex);
        return ResponseEntity.status(500)
            .body(ErrorResponse.of("An unexpected error occurred"));
    }
}
```

## 37.2 Key principles

1. **Specific exceptions first** — `Exception.class` always last
2. **Never expose stack traces** to client in production
3. **Log full details** server-side
4. **Consistent response format** across all endpoints

## 37.3 Comparison: ControllerAdvice vs RestControllerAdvice

| | `@ControllerAdvice` | `@RestControllerAdvice` |
|---|---|---|
| Returns | View name | JSON (auto @ResponseBody) |
| Use case | MVC with Thymeleaf | REST APIs |
| Equivalent to | `@ControllerAdvice` + `@ResponseBody` | Just the annotation |

## 37.4 SkillSync's exception hierarchy

```
skillsync-common
├── ResourceNotFoundException (404)
├── DuplicateEmailException (409)
├── DuplicateSkillException (409)
├── UnauthorizedActionException (403)
├── ValidationException (400)
└── GlobalExceptionHandler
```

Shared across all 7 microservices via `skillsync-common` dependency.

---

# 38. AOP: Cross-Cutting Concerns

<span class="chapter-label">Chapter 38</span>

## 38.1 What AOP solves

Logging, transaction management, security, caching — code that would otherwise be duplicated across many methods.

## 38.2 Core concepts

| Term | Meaning |
|---|---|
| **Aspect** | The cross-cutting concern (e.g., logging) |
| **Join Point** | Where advice can be applied (method execution) |
| **Advice** | What to do (before, after, around) |
| **Pointcut** | Which join points to apply to |
| **Weaving** | Applying aspects to target |

## 38.3 Advice types

```java
@Aspect
@Component
public class LoggingAspect {
    
    @Before("execution(* in.skillsync..*Service.*(..))")
    public void logBefore(JoinPoint jp) {
        log.info("Calling: {} with args: {}", 
            jp.getSignature(), jp.getArgs());
    }
    
    @AfterReturning(pointcut = "serviceMethods()", returning = "result")
    public void logAfter(JoinPoint jp, Object result) {
        log.info("Completed: {} with result: {}", 
            jp.getSignature(), result);
    }
    
    @Around("serviceMethods()")
    public Object logTiming(ProceedingJoinPoint pjp) throws Throwable {
        long start = System.currentTimeMillis();
        Object result = pjp.proceed();
        long elapsed = System.currentTimeMillis() - start;
        log.info("{} took {}ms", pjp.getSignature(), elapsed);
        return result;
    }
    
    @Pointcut("execution(* in.skillsync..*Service.*(..))")
    private void serviceMethods() {}
}
```

## 38.4 How Spring implements AOP

Default: **JDK dynamic proxies** (implements your interface). If no interface: **CGLIB** (subclasses your class).

> Remember: `this.method()` inside a bean bypasses the proxy! Use `AopContext.currentProxy()` or split into two beans if you need aspects on self-calls.

---

# 39. Microservices Patterns

<span class="chapter-label">Chapter 39</span>

## 39.1 Monolith vs Microservices

| | Monolith | Microservices |
|---|---|---|
| Deploy | Single artifact | Multiple independent |
| Scale | All or nothing | Per-service |
| Tech stack | One | Per-service choice |
| Complexity | Code complexity | Operational complexity |
| Transaction | Database ACID | Distributed (Saga) |
| Debugging | Single process | Distributed tracing |

> Honest take: Microservices solve organizational problems (independent teams), not technical ones. A small team is faster with a well-structured monolith.

## 39.2 Essential patterns

| Pattern | Purpose | SkillSync Implementation |
|---|---|---|
| **API Gateway** | Single entry, routing, auth | Spring Cloud Gateway (port 8888) |
| **Service Discovery** | Dynamic service location | Eureka Server |
| **Config Server** | Centralized configuration | Spring Cloud Config |
| **Circuit Breaker** | Fail fast, prevent cascade | Resilience4j |
| **Event-Driven** | Async communication | RabbitMQ |
| **CQRS** | Separate read/write models | (Future: materialized views) |

---

# 40. Messaging with RabbitMQ

<span class="chapter-label">Chapter 40</span>

## 40.1 Why message queues?

- **Decoupling**: Producer doesn't wait for consumer
- **Async**: Fire-and-continue
- **Load leveling**: Queue absorbs spikes
- **Reliability**: Messages persisted, retried

## 40.2 Exchange types

| Type | Routing | Use case |
|---|---|---|
| **Direct** | Exact match | Specific queue |
| **Fanout** | Broadcast | All queues |
| **Topic** | Pattern match (`user.*.created`) | Flexible routing |
| **Headers** | Header matching | Complex matching |

## 40.3 Implementation

```java
@Configuration
public class RabbitConfig {
    @Bean
    public Queue notificationQueue() {
        return QueueBuilder.durable("notification.queue")
            .withArgument("x-dead-letter-exchange", "dlx")
            .withArgument("x-dead-letter-routing-key", "notification.failed")
            .build();
    }
}

// Producer
@Service
@RequiredArgsConstructor
public class EventPublisher {
    private final RabbitTemplate rabbitTemplate;
    
    public void publishUserRegistered(User user) {
        rabbitTemplate.convertAndSend(
            "user.events",           // exchange
            "user.registered",       // routing key
            new UserRegisteredEvent(user.getId(), user.getEmail())
        );
    }
}

// Consumer
@Component
@RabbitListener(queues = "notification.queue")
public class NotificationListener {
    @RabbitHandler
    public void handle(UserRegisteredEvent event) {
        emailService.sendWelcomeEmail(event.getEmail());
    }
}
```

## 40.4 Dead Letter Queue (DLQ)

Failed messages (after retries) go to DLQ for inspection and reprocessing.

---

# 41. Testing Spring Apps

<span class="chapter-label">Chapter 41</span>

## 41.1 Test types

| Type | Scope | Speed | Tool |
|---|---|---|---|
| **Unit** | Single class | Fast | JUnit + Mockito |
| **Integration** | Multiple classes | Medium | `@SpringBootTest` |
| **Slice** | One layer (Web, Data) | Medium | `@WebMvcTest`, `@DataJpaTest` |
| **E2E** | Full system | Slow | TestContainers |

## 41.2 Unit test with Mockito

```java
@ExtendWith(MockitoExtension.class)
class AuthServiceTest {
    @Mock
    private AuthUserRepository repository;
    
    @Mock
    private PasswordEncoder passwordEncoder;
    
    @InjectMocks
    private AuthService authService;
    
    @Test
    void login_withValidCredentials_returnsToken() {
        // Given
        String email = "test@example.com";
        String rawPassword = "password";
        String encodedPassword = "$2a$10$...";
        AuthUser user = AuthUser.builder()
            .email(email)
            .password(encodedPassword)
            .build();
        
        when(repository.findByEmail(email)).thenReturn(Optional.of(user));
        when(passwordEncoder.matches(rawPassword, encodedPassword)).thenReturn(true);
        
        // When
        AuthResponse response = authService.login(email, rawPassword);
        
        // Then
        assertNotNull(response.getAccessToken());
        verify(repository).findByEmail(email);
    }
}
```

## 41.3 Integration test

```java
@SpringBootTest
@AutoConfigureMockMvc
class AuthControllerTest {
    @Autowired
    private MockMvc mockMvc;
    
    @Autowired
    private ObjectMapper objectMapper;
    
    @Test
    void register_withValidRequest_createsUser() throws Exception {
        RegisterRequest req = RegisterRequest.builder()
            .email("new@example.com")
            .password("Password123!")
            .build();
        
        mockMvc.perform(post("/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.email").value("new@example.com"));
    }
}
```

## 41.4 TestContainers

```java
@SpringBootTest
@Testcontainers
class UserRepositoryTest {
    @Container
    static MySQLContainer<?> mysql = new MySQLContainer<>("mysql:8.0")
        .withDatabaseName("test");
    
    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", mysql::getJdbcUrl);
        registry.add("spring.datasource.username", mysql::getUsername);
        registry.add("spring.datasource.password", mysql::getPassword);
    }
    
    @Autowired
    private UserRepository repository;
    
    @Test
    void findByEmail_returnsUser() {
        // Test against real MySQL
    }
}
```
