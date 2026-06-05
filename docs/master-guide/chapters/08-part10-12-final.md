<div class="part-divider">
<div class="part-label">Part X</div>
<div class="part-title">Full-Stack Glue</div>
<div class="part-desc">The connective tissue between frontend and backend: REST design, security (CORS, CSRF, XSS), JWT flow end-to-end, and the Axios interceptors that make SkillSync's auth feel seamless.</div>
</div>

# 75–78. Full-Stack Integration

<span class="chapter-label">Chapters 75–78</span>

## 75.1 REST API Design

**Resource naming:**
```
GET    /users           # List users
GET    /users/:id       # Get specific user
POST   /users           # Create user
PUT    /users/:id       # Full update
PATCH  /users/:id       # Partial update
DELETE /users/:id       # Delete user

GET    /users/:id/orders   # Nested resource
```

**Status codes:**
- `200 OK` — Success
- `201 Created` — Resource created (return Location header)
- `204 No Content` — Success, no body (DELETE, empty PUT)
- `400 Bad Request` — Client error (validation)
- `401 Unauthorized` — Not authenticated
- `403 Forbidden` — Authenticated but not authorized
- `404 Not Found` — Resource doesn't exist
- `409 Conflict` — Conflict (duplicate, etc.)
- `422 Unprocessable Entity` — Semantic errors
- `500 Internal Server Error` — Server problem

## 76.1 CORS, CSRF, XSS, CSP

### CORS (Cross-Origin Resource Sharing)
Browser blocks cross-origin requests unless server opts in.

```java
// Spring CORS config
@Configuration
public class CorsConfig {
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(Arrays.asList("https://app.skillsync.in"));
        config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE"));
        config.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type"));
        config.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
```

> Remember: CORS is enforced by the browser. `curl` never sees it.

### CSRF (Cross-Site Request Forgery)
Attacker tricks browser into making authenticated request.

**Defenses:**
1. SameSite cookies (`SameSite=Strict` or `Lax`)
2. CSRF tokens for state-changing operations
3. Use `Authorization: Bearer` header instead of cookies

SkillSync uses JWT in header → CSRF not applicable.

### XSS (Cross-Site Scripting)
Attacker injects malicious scripts.

**Defenses:**
1. React auto-escapes JSX content
2. Never use `dangerouslySetInnerHTML` with user content
3. Content Security Policy (CSP) headers
4. Sanitize HTML if needed (DOMPurify)

### CSP (Content Security Policy)
```
Content-Security-Policy: default-src 'self'; 
                       script-src 'self' https://trusted-cdn.com; 
                       style-src 'self' 'unsafe-inline';
```

## 77.1 Axios Interceptors

Centralize request/response handling:

```javascript
// apiClient.js
import axios from 'axios';

const apiClient = axios.create({
    baseURL: process.env.REACT_APP_API_URL || '/api',
    timeout: 10000,
    headers: { 'Content-Type': 'application/json' }
});

// Request interceptor: attach token
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor: handle errors
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        
        // Token expired, try refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const refreshToken = localStorage.getItem('refreshToken');
                const { data } = await axios.post('/auth/refresh', { refreshToken });
                
                localStorage.setItem('accessToken', data.accessToken);
                originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
                
                return apiClient(originalRequest);
            } catch (refreshError) {
                // Refresh failed, logout
                window.dispatchEvent(new CustomEvent('skillsync:unauthorized'));
                return Promise.reject(refreshError);
            }
        }
        
        return Promise.reject(error);
    }
);

export default apiClient;
```

## 78.1 Complete JWT Flow (End-to-End)

```
[ User enters credentials ]
          │
          ▼
[ Frontend: LoginForm ]
  axios.post('/auth/login', { email, password })
          │
          ▼
[ Gateway ] → [ Auth Service ]
  - Verify credentials (BCrypt)
  - Generate access + refresh tokens
  - Return { accessToken, refreshToken, user }
          │
          ▲
[ Frontend: AuthContext ]
  - Store tokens in localStorage
  - Set user in state
  - Navigate to dashboard
          │
          ▼
[ Subsequent requests ]
  - Axios interceptor attaches accessToken
  - Gateway validates JWT signature
  - Injects X-User-Id, X-User-Role headers
  - Routes to appropriate service
          │
          ▼
[ Protected resource returned ]
```

<div class="part-divider">
<div class="part-label">Part XI</div>
<div class="part-title">SkillSync Project Documentary</div>
<div class="part-desc">Everything about the SkillSync application: architecture, services, database schema, JWT implementation, observability stack, and the decisions that shaped it. The complete story of a real full-stack application.</div>
</div>

# 79–91. SkillSync Deep Dive

<span class="chapter-label">Chapters 79–91</span>

## 79.1 What SkillSync Is

SkillSync is a peer-to-peer skill exchange platform where:
- **Learners** discover mentors and book 1-on-1 video sessions
- **Mentors** create profiles, list skills, set availability, and earn from teaching
- **Admin** manages users, monitors platform health, and handles disputes

Built as a **Spring Boot microservices** backend with **React** frontend, deployed via **Docker Compose**.

## 80.1 Architecture at a Glance

```
┌─────────────────────────────────────────┐
│         React SPA (Vite + Nginx)        │
│         skillsync-frontend              │
└───────────────────┬─────────────────────┘
                    │ HTTPS / HTTP
┌───────────────────▼─────────────────────┐
│      Spring Cloud Gateway (8888)       │
│      - JWT validation                  │
│      - Routing to services             │
│      - Rate limiting                   │
└───────────────────┬─────────────────────┘
                    │
      ┌─────────────┼─────────────┐
      │             │             │
┌─────▼────┐ ┌─────▼────┐ ┌──────▼─────┐
│  Auth    │ │  User    │ │   Mentor   │  ...
│ Service  │ │ Service  │ │  Service   │
│  (8081)  │ │  (8082)  │ │  (8083)    │
└──────────┘ └──────────┘ └────────────┘
      │             │             │
      └─────────────┼─────────────┘
                    │
      ┌─────────────▼─────────────┐
      │    Eureka Server (8761)  │  ← Service Discovery
      └───────────────────────────┘
                    │
      ┌─────────────▼─────────────┐
      │    RabbitMQ (5672)       │  ← Async messaging
      │    - notification.queue   │
      └───────────────────────────┘
                    │
      ┌─────────────▼─────────────┐
      │    MySQL (3306)          │  ← Data persistence
      └───────────────────────────┘
```

## 81.1 Repository Structure

```
SprintSkillSync/
├── skillsync-api-gateway/        # Entry point, JWT validation
├── skillsync-auth-service/       # Authentication, registration
├── skillsync-user-service/       # User profiles, preferences
├── skillsync-mentor-service/      # Mentor profiles, availability
├── skillsync-skill-service/       # Skills catalog, categories
├── skillsync-session-service/     # Booking, scheduling
├── skillsync-notification-service/ # Email, push notifications
├── skillsync-common/              # Shared DTOs, exceptions, security
├── skillsync-frontend/            # React SPA
├── docker-compose.yml
└── docs/
```

## 82.1 Tech Stack Decisions (Why X not Y)

| Choice | Why this | Why not alternatives |
|---|---|---|
| **Spring Boot** | Mature ecosystem, huge community, auto-config | Quarkus (newer, less hiring), plain Spring (too verbose) |
| **Microservices** | Learning distributed patterns, independent deploy | Monolith (simpler for this scale, but wanted to learn) |
| **MySQL** | Familiar, ubiquitous in product companies | PostgreSQL (better features, would choose for greenfield), MongoDB (wrong for relational data) |
| **JWT** | Stateless, works across services | Sessions (would need shared store, bottleneck) |
| **BCrypt** | Adaptive cost, battle-tested, Spring default | MD5/SHA (fast = crackable), Argon2 (better but newer) |
| **RabbitMQ** | Smart broker, easy DLQ/retry | Kafka (overkill for our volume), Redis Pub/Sub (no persistence) |
| **Eureka** | Spring Cloud integration | Consul (CP, heavier), Kubernetes DNS (would use if on K8s) |
| **React** | Largest ecosystem, most jobs | Angular (opinionated, steeper curve), Vue (smaller ecosystem) |
| **Vite** | Fast dev, modern, ESM native | CRA (deprecated, slow), Webpack (config hell) |
| **Context API** | Auth + theme only, no complexity | Redux (boilerplate not justified), Zustand (good alternative) |
| **Axios** | Interceptors perfect for JWT | Fetch (no interceptors, manual error handling) |
| **Docker Compose** | Local dev simplicity | Kubernetes (overkill for dev) |

## 83.1 Service-by-Service Breakdown

### Auth Service (8081)
- **Responsibilities**: Registration, login, password reset, JWT generation
- **Database**: `auth_users` table
- **Key classes**: `AuthController`, `AuthService`, `JwtService`, `CustomUserDetailsService`

### User Service (8082)
- **Responsibilities**: User profiles, preferences, settings
- **Database**: `user_profiles`, `preferences`
- **Integration**: Listens to `user.created` events from RabbitMQ

### Mentor Service (8083)
- **Responsibilities**: Mentor profiles, availability slots, pricing
- **Database**: `mentor_profiles`, `availability`, `pricing_tiers`

### Skill Service (8084)
- **Responsibilities**: Skills taxonomy, categories, search
- **Database**: `skills`, `categories`, `skill_relationships`

### Session Service (8085)
- **Responsibilities**: Booking, scheduling, status management, video room links
- **Database**: `sessions`, `session_notes`
- **Integration**: Publishes `session.booked`, `session.completed` events

### Notification Service (8086)
- **Responsibilities**: Email notifications, push notifications
- **Integration**: Consumes from RabbitMQ, sends via SendGrid/SMTP

### API Gateway (8888)
- **Responsibilities**: Routing, JWT validation, rate limiting, CORS
- **Key classes**: `JwtAuthenticationFilter`, `GatewayConfig`

## 84.1 Database Schema (Simplified)

```sql
-- Auth Service
CREATE TABLE auth_users (
    user_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('LEARNER','MENTOR','ADMIN') DEFAULT 'LEARNER',
    enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User Service
CREATE TABLE user_profiles (
    profile_id BIGINT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    full_name VARCHAR(100),
    bio TEXT,
    profile_image_url VARCHAR(500),
    location VARCHAR(100),
    FOREIGN KEY (user_id) REFERENCES auth_users(user_id)
);

-- Mentor Service
CREATE TABLE mentor_profiles (
    mentor_id BIGINT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    headline VARCHAR(200),
    about TEXT,
    hourly_rate DECIMAL(10,2),
    verified BOOLEAN DEFAULT FALSE
);

CREATE TABLE availability (
    slot_id BIGINT PRIMARY KEY,
    mentor_id BIGINT NOT NULL,
    day_of_week TINYINT, -- 0=Monday
    start_time TIME,
    end_time TIME,
    is_booked BOOLEAN DEFAULT FALSE
);

-- Session Service
CREATE TABLE sessions (
    session_id BIGINT PRIMARY KEY,
    learner_id BIGINT NOT NULL,
    mentor_id BIGINT NOT NULL,
    skill_id BIGINT,
    scheduled_at TIMESTAMP NOT NULL,
    duration_minutes INT DEFAULT 60,
    status ENUM('PENDING','CONFIRMED','COMPLETED','CANCELLED'),
    price DECIMAL(10,2),
    video_room_url VARCHAR(500)
);
```

## 85.1 JWT End-to-End in SkillSync

See Chapter 78 for the complete flow. Implementation details:

**Token structure:**
```json
{
  "sub": "42",
  "email": "renu@example.com",
  "roles": ["LEARNER", "MENTOR"],
  "iat": 1704067200,
  "exp": 1704068100  // 15 minutes
}
```

**Storage:**
- `accessToken` in `localStorage` (15 min expiry)
- `refreshToken` in `localStorage` (7 days expiry)
- Production recommendation: move refresh to HttpOnly cookie

**Frontend integration:**
- `apiClient.js` interceptor attaches token
- `AuthContext` manages login state
- `PrivateRoute` component checks auth for protected routes

## 86.1 Global Exception Handler in SkillSync

Located in `skillsync-common`:

```java
@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {
    
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(ResourceNotFoundException ex) {
        log.warn("Not found: {}", ex.getMessage());
        return ResponseEntity.status(404)
            .body(ErrorResponse.builder()
                .status(404)
                .error("Not Found")
                .message(ex.getMessage())
                .build());
    }
    
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidation(
            MethodArgumentNotValidException ex) {
        Map<String, String> fieldErrors = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(error ->
            fieldErrors.put(error.getField(), error.getDefaultMessage())
        );
        
        return ResponseEntity.badRequest().body(Map.of(
            "status", 400,
            "error", "Validation Failed",
            "errors", fieldErrors
        ));
    }
    
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneric(Exception ex) {
        log.error("Unexpected error: ", ex);
        return ResponseEntity.status(500)
            .body(ErrorResponse.of("An unexpected error occurred"));
    }
}
```

Shared across all services via `skillsync-common` dependency.

## 87.1 Key User Workflows

### Registration Flow
1. User submits registration form
2. Auth Service creates `auth_user` (status: PENDING_VERIFICATION)
3. Notification Service sends verification email via RabbitMQ
4. User clicks link → status ACTIVE
5. User Service creates empty profile on `user.created` event

### Booking Flow
1. Learner views mentor profile, selects slot
2. Frontend calls `/sessions` with mentor_id, slot_id, skill_id
3. Session Service creates PENDING session
4. Mentor receives notification
5. Mentor accepts → status CONFIRMED
6. Both receive calendar invite + video link

## 88.1 Observability Stack

| Tool | Purpose | Endpoint |
|---|---|---|
| **Prometheus** | Metrics collection | `:9090` |
| **Grafana** | Dashboards | `:3000` |
| **Loki** | Log aggregation | `:3100` |
| **Zipkin** | Distributed tracing | `:9411` |

**Micrometer** exposes Spring Boot metrics to Prometheus.

**Logback** configuration sends logs to Loki.

**Sleuth** adds trace IDs across service boundaries.

## 89.1 Running Locally

```bash
# Start infrastructure
docker-compose up -d mysql rabbitmq eureka

# Start services (each in separate terminal)
./mvnw spring-boot:run -pl skillsync-auth-service
./mvnw spring-boot:run -pl skillsync-user-service
# ... etc

# Or all at once
docker-compose up -d

# Frontend
cd skillsync-frontend
npm install
npm run dev
```

## 90.1 Security Posture

| Layer | Measures |
|---|---|
| **Transport** | HTTPS in production, TLS 1.3 |
| **Auth** | JWT with 15-min expiry, refresh tokens, BCrypt passwords |
| **Input** | Bean Validation on all endpoints, prepared statements (no SQL injection) |
| **Output** | React auto-escaping, no `dangerouslySetInnerHTML` for user content |
| **CORS** | Whitelist origins, credentials allowed |
| **Headers** | Security headers via Gateway (X-Frame-Options, CSP, etc.) |
| **Secrets** | Externalized in env vars, never committed |

## 91.1 Known Limitations & Roadmap

**Current limitations:**
- JWT in localStorage (XSS vulnerable, should be httpOnly cookie)
- No rate limiting on auth endpoints
- No email verification in current flow
- Video calls via external link (Jitsi), not integrated
- Single-region deployment

**Roadmap:**
- Move to httpOnly cookies with CSRF protection
- Redis for refresh token blacklist (logout)
- WebSocket integration for real-time chat
- Kubernetes deployment manifests
- Payment integration (Stripe)
- Mobile app (React Native)

<div class="part-divider">
<div class="part-label">Part XII</div>
<div class="part-title">Appendices</div>
<div class="part-desc">Quick references and tools for ongoing learning: design patterns, data structures and algorithms, a comprehensive glossary, an interview question index, and a 7-day study plan to tie it all together.</div>
</div>

# A–E. Appendices

<span class="chapter-label">Appendices A–E</span>

## A. Design Patterns Reference

### Creational

| Pattern | Purpose | Example in SkillSync |
|---|---|---|
| **Singleton** | One instance per JVM | Spring beans (default scope) |
| **Factory** | Create objects based on input | `BeanFactory`, `LoggerFactory` |
| **Builder** | Step-by-step construction | Lombok `@Builder`, `UriComponentsBuilder` |
| **Prototype** | Clone existing object | Spring `prototype` scope |

### Structural

| Pattern | Purpose | Example |
|---|---|---|
| **Adapter** | Convert interface | `Arrays.asList()` |
| **Decorator** | Add behavior dynamically | Spring AOP advice |
| **Proxy** | Control access | Spring `@Transactional` proxy |
| **Facade** | Simplified interface | `AuthService` hides complexity |

### Behavioral

| Pattern | Purpose | Example |
|---|---|---|
| **Strategy** | Interchangeable algorithms | `PasswordEncoder` interface |
| **Observer** | One-to-many notification | `ApplicationEventPublisher` |
| **Template Method** | Algorithm skeleton | `JdbcTemplate` |
| **Chain of Responsibility** | Pass request along chain | `SecurityFilterChain` |
| **Command** | Encapsulate request | `Runnable`, `Callable` |

## B. DSA Quick Reference

### Big-O Complexity

| Structure | Access | Search | Insert | Delete |
|---|---|---|---|---|
| Array | O(1) | O(n) | O(n) | O(n) |
| ArrayList | O(1) | O(n) | O(1)* | O(n) |
| LinkedList | O(n) | O(n) | O(1) | O(1) |
| HashMap/HashSet | — | O(1) | O(1) | O(1) |
| TreeMap/TreeSet | — | O(log n) | O(log n) | O(log n) |
| Heap | — | — | O(log n) | O(log n) |

*amortized

### Sorting

| Algorithm | Best | Avg | Worst | Space | Stable |
|---|---|---|---|---|---|
| Bubble | O(n) | O(n²) | O(n²) | O(1) | Yes |
| Merge | O(n log n) | O(n log n) | O(n log n) | O(n) | Yes |
| Quick | O(n log n) | O(n log n) | O(n²) | O(log n) | No |
| Heap | O(n log n) | O(n log n) | O(n log n) | O(1) | No |

### Common Patterns

- **Two Pointers**: sorted arrays, palindrome
- **Sliding Window**: substrings, subarrays
- **Fast & Slow**: cycle detection (Floyd's)
- **Hash Map**: frequency, two-sum, anagrams
- **Stack**: valid parentheses, next greater
- **BFS**: shortest path unweighted, level order
- **DFS**: trees, backtracking, connected components
- **Binary Search**: sorted search
- **Heap**: top-K, kth largest
- **DP**: optimal substructure, overlapping subproblems

### 10 Must-Know Problems

1. Two Sum (hash map)
2. Reverse Linked List
3. Detect Cycle (Floyd's)
4. Valid Parentheses (stack)
5. Merge Sorted Lists
6. Best Time to Buy/Sell Stock
7. Longest Substring Without Repeating (sliding window)
8. Maximum Subarray (Kadane's)
9. Binary Tree Level Order (BFS)
10. Number of Islands (DFS/BFS)

## C. Glossary

| Term | Definition |
|---|---|
| **ACID** | Atomicity, Consistency, Isolation, Durability (transaction properties) |
| **AOP** | Aspect-Oriented Programming (cross-cutting concerns) |
| **API** | Application Programming Interface |
| **Bean** | Spring-managed object |
| **CORS** | Cross-Origin Resource Sharing |
| **CSRF** | Cross-Site Request Forgery |
| **DTO** | Data Transfer Object |
| **GC** | Garbage Collector |
| **IoC** | Inversion of Control |
| **JPA** | Java Persistence API |
| **JVM** | Java Virtual Machine |
| **JWT** | JSON Web Token |
| **ORM** | Object-Relational Mapping |
| **REST** | Representational State Transfer |
| **SPA** | Single Page Application |
| **SQL** | Structured Query Language |
| **TLS** | Transport Layer Security |
| **XSS** | Cross-Site Scripting |

## D. Interview Question Index

### Java Core
- OOP pillars with examples
- `==` vs `.equals()`
- Why override `equals()` and `hashCode()` together?
- `final` vs `finally` vs `finalize`
- Checked vs unchecked exceptions
- String immutability

### Collections
- HashMap internal working
- HashMap vs ConcurrentHashMap
- ArrayList vs LinkedList
- Stream API pipeline

### Concurrency
- `synchronized` vs `volatile`
- Thread pool types
- `volatile` `count++` mistake
- CompletableFuture

### Spring
- IoC and DI explained
- Bean scopes
- `@Transactional` gotchas
- Spring vs Spring Boot

### SQL
- ACID properties
- Join types with diagrams
- Index types and use
- Normalization forms

### JavaScript
- Event loop explained
- Closure with example
- `this` binding rules
- Promise vs async/await

### React
- useEffect dependencies
- useMemo vs useCallback
- Context vs Redux
- Reconciliation and keys
- Error boundaries

### System Design
- Monolith vs Microservices
- JWT vs Session
- CORS explanation
- Global exception handling

## E. 7-Day Study Plan

### Day 1: Java Core
- Morning: OOP, access modifiers, exceptions
- Afternoon: Strings, equals/hashCode
- Evening: Practice 5 coding problems

### Day 2: Collections & Streams
- Morning: All collection types, internal working
- Afternoon: Stream API operations
- Evening: Practice stream exercises

### Day 3: Spring Fundamentals
- Morning: IoC, DI, bean lifecycle
- Afternoon: Spring Boot, annotations
- Evening: Build a small CRUD app

### Day 4: Spring Advanced
- Morning: JPA, transactions
- Afternoon: Security, JWT
- Evening: Global exception handling

### Day 5: SQL
- Morning: Joins, subqueries
- Afternoon: Indexes, normalization
- Evening: Practice complex queries

### Day 6: Frontend (JS + React)
- Morning: Closures, event loop, promises
- Afternoon: All hooks, Context
- Evening: Build a form with validation

### Day 7: Integration & Project
- Morning: REST design, CORS, JWT flow
- Afternoon: Deep dive into SkillSync codebase
- Evening: Review all comparison tables, rehearse explanations

---

<div class="remember" style="text-align: center; font-size: 14pt; padding: 20mm;">

**You now have everything you need.**

From JVM internals to React reconciliation.
From SQL window functions to JWT end-to-end.
From the abstract principles to the concrete SkillSync implementation.

The best preparation is active:
- Write code. Break things. Fix them.
- Explain concepts out loud.
- Trace through the SkillSync codebase.

Good luck with your interview. You've got this.

— The SkillSync Master Guide

</div>
