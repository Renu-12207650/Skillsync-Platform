# SkillSync Interview Prep — Java Full Stack (React)

> **Interview in 48 hrs.** Day 1: Core concepts. Day 2 morning: Project viva + tricky Qs. Ctrl+F any topic.

## Table of Contents

### Backend (Java side)
1. [48-hr Study Plan](#study-plan)
2. [Core Java](#core-java)
3. [Collections & Streams](#collections--streams)
4. [Multithreading](#multithreading)
5. [Spring Boot](#spring-boot)
6. [Spring Security & JWT](#spring-security--jwt)
7. [JPA / Hibernate](#jpa--hibernate)
8. [Microservices Patterns](#microservices-patterns)
9. [REST API Design](#rest-api-design)
10. [SQL](#sql)
11. [Design Patterns](#design-patterns)
12. [DSA Quick Reference](#dsa-quick-reference)

### Frontend (React side)
13. [HTML5 Essentials](#html5-essentials)
14. [CSS Deep Dive](#css-deep-dive)
15. [JavaScript Fundamentals](#javascript-fundamentals)
16. [TypeScript Essentials](#typescript-essentials)
17. [React (Comprehensive)](#react-comprehensive)
18. [State Management](#state-management)
19. [Forms & Validation](#forms--validation)
20. [Browser & Web APIs](#browser--web-apis)
21. [Frontend Performance](#frontend-performance)
22. [Frontend Security](#frontend-security)
23. [Testing (Frontend & Backend)](#testing-frontend--backend)
24. [Build Tools (Vite, Webpack)](#build-tools-vite-webpack)
25. [Accessibility (a11y)](#accessibility-a11y)

### Project & Behavioral
26. [SkillSync Project Viva](#skillsync-project-viva) ⭐ **most important**
27. [System Design Lite](#system-design-lite)
28. [Tricky Interview Qs](#tricky-interview-qs)
29. [HR / Behavioral](#hr--behavioral)

---

## Study Plan

### Day 1 (Tomorrow)
- **Morning (3h)**: Core Java + Collections + Multithreading
- **Afternoon (3h)**: Spring Boot + Security + JPA
- **Evening (2h)**: React fundamentals + hooks

### Day 2 (Interview day — morning before)
- **1h**: SkillSync project walkthrough — **rehearse out loud**
- **1h**: SQL queries + system design lite
- **30min**: Tricky Qs + HR answers
- **Before interview**: Re-read SkillSync section twice

---

## Core Java

### Q: What's the difference between JDK, JRE, and JVM?
- **JVM**: Runtime engine that executes bytecode (`.class` files). Platform-specific.
- **JRE**: JVM + core libraries needed to *run* Java apps.
- **JDK**: JRE + compiler (`javac`) + tools (`javap`, `jar`). Needed to *develop* Java apps.

### Q: Explain OOP pillars with examples.
- **Encapsulation**: Private fields + public getters/setters. Example: `AuthUser` entity has `private String password` with a setter that BCrypt-hashes it.
- **Inheritance**: `class Dog extends Animal`. In Spring, `@RestController` inherits from `@Controller`.
- **Polymorphism**: 
  - *Compile-time* (method overloading): same name, different params.
  - *Runtime* (method overriding): child overrides parent method. Example: `toString()` override.
- **Abstraction**: Hide implementation via abstract classes / interfaces. Example: `JpaRepository` interface — you just declare methods, Spring implements.

### Q: `==` vs `.equals()`?

| | `==` | `.equals()` |
|---|---|---|
| Compares | reference (address) | content |
| Primitives | value | N/A |
| Default Object | reference | reference (Object's default) |
| Override needed? | No (operator) | Yes, to compare content |

**Tricky example (String pool):**
```java
String a = "abc";              // pooled
String b = "abc";              // same pool reference
String c = new String("abc");  // new heap object

a == b;          // true — same pooled reference
a == c;          // false — different objects
a.equals(c);     // true — same content
```

**Remember:** *"`==` asks 'same box?' — `.equals()` asks 'same content?'"*

### Q: Why override `equals()` and `hashCode()` together?

**Rule (memorize this):**
> If `a.equals(b)` is `true`, then `a.hashCode()` MUST equal `b.hashCode()`.

**Why it matters:**
Hash-based collections (`HashMap`, `HashSet`, `HashTable`) work in 2 steps:
1. Use `hashCode()` to find the bucket.
2. Use `equals()` to find the exact match within that bucket.

If you only override `equals()`, two "equal" objects land in **different buckets** → `set.contains(obj)` returns false, `map.get(key)` returns null. Bug city.

**Example:**
```java
User a = new User(1, "Renu");
User b = new User(1, "Renu");
Set<User> s = new HashSet<>();
s.add(a);
s.contains(b); // false if hashCode() not overridden!
```

**Remember:** *"Override equals → override hashCode. Otherwise HashMap breaks silently."* Lombok's `@EqualsAndHashCode` does both for you in one annotation.

### Q: Abstract class vs Interface?
| | Abstract class | Interface |
|---|---|---|
| Methods | Can have implemented + abstract | Default/static allowed (Java 8+), rest abstract |
| Fields | Any (instance, static, final) | `public static final` only |
| Inheritance | Single (`extends`) | Multiple (`implements`) |
| Use case | "is-a" with shared code | Capability contract |

### Q: Final vs Finally vs Finalize?

| Word | Type | Purpose | Memorize |
|---|---|---|---|
| `final` | keyword | restrict modification | "final = locked forever" |
| `finally` | block | always run (cleanup) | "finally = always runs" |
| `finalize()` | method | called by GC before collection (deprecated) | "finalize = farewell" |

```java
final class Constants {}            // can't extend
final int X = 5;                    // can't reassign
try { ... } finally { closeAll(); } // always runs
```

**Gotcha:** `finally` runs even if try has `return`. Doesn't run only on `System.exit()` or JVM crash.

### Q: What's new in Java 8+?
- **Lambdas**: `list.forEach(x -> System.out.println(x))`
- **Streams**: `list.stream().filter(x -> x > 5).collect(toList())`
- **Optional**: `Optional.ofNullable(obj).orElse(default)`
- **Default methods** in interfaces
- **`var`** (Java 10): local type inference
- **Records** (Java 14): immutable data classes: `record User(String name, int age){}`
- **Sealed classes** (Java 17)
- **Text blocks**: `"""multi-line string"""`

### Q: Checked vs Unchecked exceptions?

| | Checked | Unchecked |
|---|---|---|
| Parent | `Exception` (not RuntimeException) | `RuntimeException` |
| Examples | `IOException`, `SQLException` | `NullPointerException`, `IllegalArgumentException` |
| Must catch / declare? | Yes (compiler enforces) | No |
| Use case | Recoverable (file missing, network) | Programming bugs |

**Spring philosophy:** Wraps all checked into runtime (e.g., `JdbcTemplate` converts `SQLException` → `DataAccessException`). Cleaner code, no boilerplate `throws` clauses.

**Remember:** *"Checked = compiler nags. Unchecked = your bug."*

### Q: String vs StringBuilder vs StringBuffer?
- **String**: Immutable. Each concatenation creates new object.
- **StringBuilder**: Mutable, **not thread-safe**, faster.
- **StringBuffer**: Mutable, **thread-safe** (synchronized), slower.

---

## Collections & Streams

### The hierarchy:
```
Collection (interface)
├── List (ordered, duplicates allowed)
│   ├── ArrayList (dynamic array, fast random access)
│   ├── LinkedList (doubly-linked, fast insert/delete)
│   └── Vector (synchronized, legacy)
├── Set (no duplicates)
│   ├── HashSet (no order)
│   ├── LinkedHashSet (insertion order)
│   └── TreeSet (sorted)
└── Queue / Deque
    ├── PriorityQueue (sorted)
    └── ArrayDeque

Map (NOT a Collection)
├── HashMap (no order)
├── LinkedHashMap (insertion order)
├── TreeMap (sorted by key)
└── ConcurrentHashMap (thread-safe)
```

### Q: HashMap internal working?

**The 4-step story (memorize):**
1. **Bucket array**: Internal `Node<K,V>[]` array, default size **16**, load factor **0.75**.
2. **`put(key, value)`**:
   - Compute `hash(key)` → bucket index = `(n - 1) & hash`.
   - Empty bucket → insert. Collision → chain (linked list).
   - **Java 8+**: chain length > 8 → convert to **red-black tree** (O(log n) instead of O(n)).
3. **`get(key)`**: compute hash → bucket → traverse list/tree, compare with `equals()`.
4. **Resize**: When `size > capacity × 0.75` → double capacity, rehash all entries.

**Why load factor 0.75?** Sweet spot between space (less = wasted) and time (more = collisions).

**Why initial size 16?** Power of 2 lets bucket index use fast bitwise `&` instead of `%`.

**Remember:** *"16 buckets, 0.75 load, chain → tree at 8."*

### Q: HashMap vs ConcurrentHashMap vs Hashtable?

| | HashMap | Hashtable | ConcurrentHashMap |
|---|---|---|---|
| Thread-safe | ❌ | ✅ (full lock) | ✅ (segment lock) |
| Null key/value | 1 null key, many null values | None allowed | None allowed |
| Performance | Fastest | Slowest (single lock) | Fast (locks per bucket) |
| Era | Modern | Legacy (Java 1) | Java 1.5+ |

**Why ConcurrentHashMap is faster than Hashtable?**
- Hashtable: ONE big lock on the whole map → only one thread at a time.
- ConcurrentHashMap (Java 8+): locks only the **bucket node** being written using CAS + `synchronized`. 16 threads can write to 16 different buckets simultaneously.

**Remember:** *"HashMap = solo. Hashtable = traffic jam. ConcurrentHashMap = multi-lane highway."*

### Q: Fail-fast vs Fail-safe iterators?
- **Fail-fast** (`ArrayList`, `HashMap`): Throw `ConcurrentModificationException` if collection modified during iteration.
- **Fail-safe** (`ConcurrentHashMap`, `CopyOnWriteArrayList`): Work on a copy/snapshot. No exception.

### Q: Stream API essentials:

**The pipeline mental model:**
> *"Source → intermediate ops (lazy) → terminal op (triggers execution)."*

```java
// Filter + map + collect
List<String> names = users.stream()           // SOURCE
    .filter(u -> u.getAge() > 18)              // intermediate (lazy)
    .map(User::getName)                        // intermediate (lazy)
    .collect(Collectors.toList());             // TERMINAL (executes pipeline)

// Grouping
Map<Role, List<User>> byRole = users.stream()
    .collect(Collectors.groupingBy(User::getRole));

// Reduce
int sum = nums.stream().reduce(0, Integer::sum);

// Parallel (only when CPU-bound + large data + stateless ops)
list.parallelStream().forEach(...);
```

**Key principles:**
- **Lazy**: Intermediate ops don't run until terminal op is called.
- **Single-use**: A stream can be consumed only once — throws `IllegalStateException` if reused.
- **No mutation**: Streams don't modify the source.

**Remember:** *"Filter → map → collect. Lazy until terminal."*

### Q: `map` vs `flatMap`?
- `map`: 1→1 transformation. `Stream<User>` → `Stream<String>`.
- `flatMap`: 1→many, flatten. `Stream<List<String>>` → `Stream<String>`.

---

## Multithreading

### Q: Thread vs Runnable?
- `Thread`: Extend class. Only single inheritance.
- `Runnable`: Implement interface. Preferred — allows other inheritance. Use `new Thread(runnable).start()`.
- Modern: `ExecutorService` / `CompletableFuture`.

### Q: `synchronized` keyword?

**Two ways to use it:**
```java
// 1. Method-level: locks `this` (or class object for static)
public synchronized void increment() { count++; }

// 2. Block-level: lock a specific object (preferred — finer control)
synchronized(lockObj) { ... }
```

**What it guarantees:**
1. **Mutual exclusion** — only one thread inside at a time.
2. **Visibility** — changes flush to main memory on exit.
3. **Happens-before** ordering (JMM guarantee).

### Q: `volatile` vs `synchronized`?

| | `volatile` | `synchronized` |
|---|---|---|
| Visibility | ✅ | ✅ |
| Atomicity | ❌ (only single read/write) | ✅ |
| Mutual exclusion | ❌ | ✅ |
| Performance cost | Low | Higher |
| Use case | Status flags (`boolean running`) | Multi-step state changes |

**The classic mistake:**
```java
volatile int count;
count++;   // STILL not thread-safe! (read-modify-write — 3 ops)
```
Use `AtomicInteger` for counters, or `synchronized` for compound operations.

**Remember:** *"`volatile` = always see the latest. `synchronized` = only I'm doing it."*

### Q: Executor Framework?
```java
ExecutorService pool = Executors.newFixedThreadPool(4);
Future<Integer> future = pool.submit(() -> expensiveCall());
Integer result = future.get(); // blocks
pool.shutdown();
```

### Q: CompletableFuture:
```java
CompletableFuture.supplyAsync(() -> fetchUser(id))
    .thenApply(user -> user.getEmail())
    .thenAccept(email -> send(email))
    .exceptionally(ex -> handle(ex));
```

### Q: Deadlock — how to prevent?
- Always acquire locks in the same order.
- Use `tryLock` with timeout.
- Avoid nested locks.

---

## Spring Boot

### Q: What is Spring Boot vs Spring?
- **Spring Framework**: Core DI/IoC container, AOP, MVC. Requires lots of XML/Java config.
- **Spring Boot**: Opinionated starter on top of Spring. Auto-configuration, embedded Tomcat, starters, production-ready features (Actuator).

### Q: What is IoC / DI?

**One-liner:**
> *"Don't create your dependencies. Ask for them."*

**IoC (Inversion of Control)**: The container (Spring) creates and wires objects — not your code.
**DI (Dependency Injection)**: How IoC is achieved — inject dependencies via constructor/setter/field.

**Without DI:**
```java
class AuthService {
    AuthUserRepository repo = new AuthUserRepositoryImpl();  // tight coupling!
}
```

**With DI (SkillSync style):**
```java
@Service
@RequiredArgsConstructor
class AuthService {
    private final AuthUserRepository repo;  // Spring injects via constructor
}
```

**Constructor vs Setter vs Field:**
| Type | Pros | Cons | Use when |
|---|---|---|---|
| Constructor | Immutable, easy testing, fail-fast on missing dep | Verbose without Lombok | **Default choice** — SkillSync uses this |
| Setter | Optional dependencies | Mutable, can forget to set | Optional dependencies |
| Field (`@Autowired` on field) | Less code | Hard to test, hidden deps, can't be `final` | Avoid — anti-pattern |

**Remember:** *"Constructor inject = mandatory dep. Setter = optional. Field = lazy + bad."*

### Q: Bean scopes?

| Scope | Lifespan | Use case |
|---|---|---|
| `singleton` (default) | One per Spring container | Stateless services (99% of beans) |
| `prototype` | New instance per `getBean()` call | Stateful objects, expensive but transient |
| `request` | Per HTTP request (web only) | Per-request data |
| `session` | Per HTTP session (web only) | User-specific session data |
| `application` | Per ServletContext | App-wide servlet beans |
| `websocket` | Per WebSocket session | Chat apps |

**Common gotcha:** Injecting a `prototype` bean into a `singleton` — you get the SAME prototype instance forever (singleton resolved once). Fix with `ObjectFactory<MyBean>` or `@Lookup`.

**Remember:** *"Singleton = one ring to rule them all. Prototype = new every time."*

### Q: Bean lifecycle?
1. Instantiate
2. Populate properties (DI)
3. `BeanNameAware.setBeanName()`
4. `@PostConstruct` / `InitializingBean.afterPropertiesSet()` / custom init method
5. Ready for use
6. `@PreDestroy` / `DisposableBean.destroy()` / custom destroy method

### Q: Key annotations
| Annotation | Purpose |
|---|---|
| `@Component` | Generic Spring-managed bean |
| `@Service` | Business logic (semantic alias) |
| `@Repository` | DAO layer; translates SQL exceptions |
| `@Controller` | MVC controller (returns view) |
| `@RestController` | `@Controller` + `@ResponseBody` |
| `@Configuration` | Config class with `@Bean` methods |
| `@Bean` | Method-level bean definition |
| `@Autowired` | Inject by type |
| `@Qualifier("name")` | Disambiguate when multiple beans |
| `@Value("${prop}")` | Inject property |
| `@Transactional` | Declarative transaction |
| `@RequestMapping` / `@GetMapping` / `@PostMapping` | REST routing |
| `@PathVariable` / `@RequestParam` / `@RequestBody` | Request binding |
| `@Valid` | Trigger Bean Validation |
| `@ControllerAdvice` | Global exception handler |
| `@EnableCaching` / `@Cacheable` | Cache |
| `@Async` | Run method in thread pool |
| `@Scheduled` | Cron/fixed-rate task |

### Q: Spring Boot starter — what is it?
Curated dependencies for a feature. Example: `spring-boot-starter-web` pulls in Tomcat, Jackson, Spring MVC. Single import instead of 10.

### Q: How does auto-configuration work?
- `@SpringBootApplication` = `@Configuration + @EnableAutoConfiguration + @ComponentScan`.
- `@EnableAutoConfiguration` triggers loading from `META-INF/spring.factories` (or `AutoConfiguration.imports` in 2.7+).
- Each auto-config class uses `@ConditionalOn...` (e.g., `@ConditionalOnClass(DataSource.class)`) to configure beans only if dependencies present.

### Q: Profiles?
- `@Profile("dev")` on bean/class.
- `spring.profiles.active=dev` in `application.yml` or env var.
- Separate configs: `application-dev.yml`, `application-prod.yml`.

### Q: Exception handling:
```java
@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handle(ResourceNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
            .body(new ErrorResponse(ex.getMessage()));
    }
}
```
**SkillSync uses this** in `skillsync-common` — centralized across all services.

### Q: Validation:
```java
@PostMapping("/register")
public AuthResponse register(@Valid @RequestBody RegisterRequest req) { ... }

public class RegisterRequest {
    @NotBlank @Email String email;
    @Size(min=8) String password;
}
```

### Q: `@Transactional` — how it works?

**The mechanism (proxy-based AOP):**
1. Spring wraps your `@Service` bean in a proxy.
2. Proxy intercepts the method call.
3. Before method: `BEGIN TRANSACTION`.
4. After method success: `COMMIT`.
5. If `RuntimeException` thrown: `ROLLBACK`.

**The 3 famous gotchas:**

**Gotcha 1 — Self-invocation:**
```java
@Service
class UserService {
    public void outer() { this.inner(); }   // ⚠️ bypasses proxy
    @Transactional public void inner() { ... }
}
```
`this.inner()` calls the bare method, not through the proxy. Tx ignored. Fix: split into two beans, or `@EnableAspectJAutoProxy(exposeProxy=true)` + `((UserService) AopContext.currentProxy()).inner()`.

**Gotcha 2 — Checked exceptions don't rollback by default:**
```java
@Transactional                                // rolls back on RuntimeException only
@Transactional(rollbackFor = Exception.class) // rolls back on ANY exception
```

**Gotcha 3 — Private methods can't be `@Transactional`** (proxy can't intercept).

**Propagation modes:**
| Mode | Behavior |
|---|---|
| `REQUIRED` (default) | Join existing tx, or create new |
| `REQUIRES_NEW` | Always new tx; suspend existing |
| `NESTED` | Nested savepoint within existing |
| `SUPPORTS` | Join if exists, else non-tx |
| `MANDATORY` | Throw if no tx exists |
| `NEVER` | Throw if tx exists |

**Isolation levels (problems they prevent):**
| Level | Dirty read | Non-repeatable read | Phantom read |
|---|---|---|---|
| READ_UNCOMMITTED | ❌ | ❌ | ❌ |
| READ_COMMITTED | ✅ | ❌ | ❌ |
| REPEATABLE_READ (MySQL default) | ✅ | ✅ | ❌ |
| SERIALIZABLE | ✅ | ✅ | ✅ |

**Remember:** *"Proxy intercepts. Self-call skips. Runtime rolls back."*

### Q: How do you define a Global Exception Handler?

**Rule (one-liner):**
> *"Don't `try-catch` in every controller. Catch all exceptions in ONE central class using `@RestControllerAdvice` + `@ExceptionHandler`."*

**Why it matters:**
- **Consistency**: All errors return the same JSON shape.
- **DRY**: No exception boilerplate scattered across controllers.
- **HTTP semantics**: Map exception types → correct status codes (`404`, `409`, `500`).

**The 3 ingredients:**
```java
@RestControllerAdvice   // 1. Apply to ALL controllers (= @ControllerAdvice + @ResponseBody)
@Slf4j
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)   // 2. Which exception
    public ResponseEntity<ErrorResponse> handle(ResourceNotFoundException ex) {
        log.warn("Resource not found: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND)   // 3. Status + body
                .body(ErrorResponse.builder()
                        .timestamp(LocalDateTime.now().toString())
                        .status(404)
                        .error("Not Found")
                        .message(ex.getMessage())
                        .build());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)   // @Valid failures
    public ResponseEntity<Map<String,Object>> handleValidation(MethodArgumentNotValidException ex) {
        Map<String,String> fieldErrors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach(err -> {
            fieldErrors.put(((FieldError)err).getField(), err.getDefaultMessage());
        });
        return ResponseEntity.badRequest().body(Map.of(
            "status", 400, "error", "Validation Failed", "errors", fieldErrors));
    }

    @ExceptionHandler(Exception.class)   // catch-all, MUST be last
    public ResponseEntity<ErrorResponse> handleGeneric(Exception ex) {
        log.error("Unexpected error: ", ex);
        return ResponseEntity.status(500)
                .body(buildError(500, "An unexpected error occurred."));
    }
}
```

**`@ControllerAdvice` vs `@RestControllerAdvice`:**
| | `@ControllerAdvice` | `@RestControllerAdvice` |
|---|---|---|
| Returns | View name (Thymeleaf) | JSON (auto-`@ResponseBody`) |
| Use for | Server-rendered apps | REST APIs (SkillSync uses this) |

**SkillSync's GlobalExceptionHandler covers 8 scenarios:**

| Exception | Status | Trigger |
|---|---|---|
| `MethodArgumentNotValidException` | 400 | `@Valid` failed |
| `HttpMessageNotReadableException` | 400 | Malformed JSON body |
| `BadCredentialsException` | 401 | Wrong login credentials |
| `AccessDeniedException` | 403 | Re-thrown so Spring Security handles it |
| `UnauthorizedActionException` | 403 | Custom — editing someone else's data |
| `ResourceNotFoundException` | 404 | Custom — user/skill/session not found |
| `DuplicateEmailException` | 409 | Register with existing email |
| `Exception.class` | 500 | Last-resort catch-all |

**Smart design**: SkillSync's handler lives in `skillsync-common` so **all 7 microservices share it** via dependency. Auto-detected because each service scans `in.skillsync` package.

**The 4 famous gotchas:**
1. **Filter exceptions are NOT caught** — `@RestControllerAdvice` runs in the dispatcher servlet. JWT filter errors must use `AuthenticationEntryPoint` / `AccessDeniedHandler`.
2. **Order matters** — most specific exceptions first; `Exception.class` always last (else it swallows everything).
3. **Don't leak internal info** — never `.message(ex.toString())` to client. Log full stack server-side; return generic message.
4. **Don't catch `Throwable` or `Error`** — let JVM-fatal errors (OOM, StackOverflow) propagate.

**Targeting specific scope:**
```java
@RestControllerAdvice(basePackages = "in.skillsync.auth.controller")
@RestControllerAdvice(assignableTypes = {AuthController.class})
@RestControllerAdvice(annotations = {RestController.class})
```

**Remember:** *"`@RestControllerAdvice` = JSON. `@ControllerAdvice` = views. Specific first, `Exception.class` last. Filters bypass it."*

---

## Spring Security & JWT

### Q: How does Spring Security work?
Filter chain: each request passes through a chain of filters (`SecurityFilterChain`). Authentication filter extracts credentials → `AuthenticationManager` → `AuthenticationProvider` → `UserDetailsService` → populate `SecurityContextHolder`. Authorization filter checks roles.

### Q: JWT vs Session?

| | Session | JWT |
|---|---|---|
| State | Server-side (DB / Redis) | Client-side (token holds state) |
| Scaling | Sticky sessions OR shared store | **Stateless** — any server can verify |
| Storage | Cookie (session ID) | `Authorization: Bearer <token>` header |
| Revoke | Easy (delete from store) | Hard (token valid until expiry) |
| Size | Tiny (~32 chars) | Larger (~500 chars) |
| CSRF risk | Yes (cookies auto-sent) | No (header set by JS) |

**Why SkillSync uses JWT:** Microservices need to be stateless. With sessions, every service would need to query a shared session store on every request — bottleneck. JWT lets the API gateway validate once and pass user info via headers.

**Mitigation for revoke problem:** Short-lived access tokens (15 min) + refresh tokens (7 days). To force logout, blacklist refresh tokens in Redis.

### Q: JWT structure?
`header.payload.signature` (base64url-encoded)
- **Header**: `{ "alg": "HS256", "typ": "JWT" }`
- **Payload (claims)**: `{ "sub": userId, "role": "ROLE_ADMIN", "exp": ..., "iat": ... }`
- **Signature**: `HMAC-SHA256(header + "." + payload, secret)`

### Q: How does SkillSync JWT flow work?
1. User POSTs `/auth/login` with email/password.
2. Auth-service validates via `AuthenticationManager` (BCrypt compare).
3. Returns `{ accessToken, refreshToken, role, email, userId }`.
4. Frontend stores access token in memory (refresh in httpOnly cookie ideally; here localStorage).
5. Every subsequent request: `Authorization: Bearer <accessToken>`.
6. **API Gateway** (`JwtAuthenticationFilter`) validates signature + expiry. Injects `X-User-Id`, `X-User-Role`, `X-User-Email` headers.
7. Downstream services trust these headers via `ServiceJwtFilter` (in `skillsync-common`) — no re-validation needed.

### Q: How is password stored?
- `BCryptPasswordEncoder` with strength 10 (salt + 2^10 rounds).
- Hash stored as `$2a$10$...` or `$2b$10$...`.
- One-way — cannot decrypt, only compare via `matches(raw, hashed)`.

---

## JPA / Hibernate

### Q: JPA vs Hibernate?
- **JPA**: Specification (interfaces/annotations).
- **Hibernate**: Most popular JPA implementation.

### Q: Common annotations:
- `@Entity`, `@Table(name=...)`, `@Id`, `@GeneratedValue(strategy=IDENTITY)`
- `@Column(nullable=false, unique=true, length=255)`
- `@OneToOne`, `@OneToMany(mappedBy="...", cascade=CascadeType.ALL)`, `@ManyToOne`, `@ManyToMany`
- `@JoinColumn(name="user_id")`
- `@Transient` (skip persistence)
- `@CreationTimestamp`, `@UpdateTimestamp`

### Q: Fetch types?
- `EAGER`: Load related entities immediately (default for `@ManyToOne`, `@OneToOne`).
- `LAZY`: Load on access (default for `@OneToMany`, `@ManyToMany`). Preferred for performance, but beware **LazyInitializationException** outside transaction.

### Q: N+1 problem?
Querying a parent with lazy children: 1 query for parents + N queries for each child collection access. Solutions:
- `@EntityGraph(attributePaths="children")` on repo method
- `JOIN FETCH` in JPQL: `SELECT u FROM User u JOIN FETCH u.orders`
- Batch fetching: `@BatchSize(size=20)`

### Q: Spring Data JPA magic methods:
- `findByEmail(String email)` → auto-generates query
- `findByEmailAndEnabledTrue(...)`
- `findByNameContainingIgnoreCase(String name)`
- Custom: `@Query("SELECT u FROM User u WHERE ...")`

### Q: First-level vs Second-level cache?
- **L1** (always on): Session-scoped. Same entity queried twice in one tx → one DB hit.
- **L2** (optional, e.g. Ehcache, Hazelcast): Application-scoped. Shared across sessions.

---

## Microservices Patterns

### Q: Monolith vs Microservices?

| | Monolith | Microservices |
|---|---|---|
| Deploy | One artifact | Independent per service |
| Scaling | All or nothing | Scale only the hot service |
| Tech stack | One | Per-service freedom |
| Local dev | Easy (run one app) | Hard (run many + deps) |
| Network calls | Method calls (fast) | Network (slow, can fail) |
| Transactions | DB transactions easy | Distributed (saga pattern) |
| Best for | Small teams / startups | Large org / independent teams |

**The honest take for a junior interview:**
> "Microservices solve **organizational** problems, not technical ones. A small team is faster with a well-structured monolith. Microservices shine when you have multiple teams that need to deploy independently."

**Remember:** *"Monolith = simple but coupled. Microservices = complex but independent."*

### Q: Common patterns:
1. **API Gateway**: Single entry point (SkillSync uses Spring Cloud Gateway). Routing, auth, rate limiting.
2. **Service Discovery**: Eureka / Consul. Services register themselves; others find them dynamically.
3. **Config Server**: Centralized config (Spring Cloud Config) — SkillSync uses Git-backed.
4. **Circuit Breaker**: Resilience4j / Hystrix. Prevent cascading failures.
5. **Saga**: Distributed transactions via event choreography or orchestration.
6. **Event-Driven**: RabbitMQ/Kafka for async. SkillSync uses RabbitMQ for notifications.
7. **CQRS**: Separate read and write models.
8. **Sidecar**: Service mesh (Istio).

### Q: How do SkillSync services communicate?
- **Sync**: REST via API Gateway (`Spring Cloud Gateway` with reactive `GlobalFilter` for JWT).
- **Async**: RabbitMQ (notifications — session-booked, mentor-approved events).
- **Service discovery**: Eureka — services register with `eureka-server:9761`. Gateway routes use `lb://SKILLSYNC-AUTH-SERVICE`.

### Q: Distributed tracing?
- Spring Cloud Sleuth + **Zipkin** adds `traceId`/`spanId` to every log and propagates across services.
- SkillSync logs show `[traceId-spanId]` — one request across 5 services can be traced end-to-end.

### Q: Observability stack?
**SkillSync has full observability**:
- **Metrics**: Prometheus scrapes `/actuator/prometheus` from every service.
- **Logs**: Loki aggregates.
- **Traces**: Zipkin.
- **Dashboards**: Grafana.

---

## REST API Design

### Q: REST principles?
- **Stateless**: Server doesn't store client state.
- **Resource-based**: URLs name resources, not actions. `/users/1` not `/getUser?id=1`.
- **HTTP verbs**: GET (read, idempotent), POST (create), PUT (full update, idempotent), PATCH (partial), DELETE (idempotent).
- **Status codes**: 200 OK, 201 Created, 204 No Content, 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 409 Conflict, 500 Server Error.
- **HATEOAS** (rarely enforced): Response includes links to next actions.

### Q: Idempotency?
Same request produces same result. GET, PUT, DELETE are idempotent. POST is not (creates new each time).

### Q: Versioning strategies?
- URI: `/v1/users`, `/v2/users` (most common)
- Header: `Accept: application/vnd.app.v2+json`
- Query param: `/users?v=2`

---

## Design Patterns

> Interviewers love asking *“which design patterns have you used?”* — pick 3-4 you can explain with real examples.

### Creational patterns
- **Singleton**: One instance per JVM. Spring beans (`@Service`, `@Component`) are singletons by default.
- **Factory**: Method returns object based on input. Example: `BeanFactory`, `LoggerFactory.getLogger(...)`.
- **Builder**: Step-by-step object creation. Example: `Lombok @Builder`, `StringBuilder`, `UriComponentsBuilder`.
- **Prototype**: Clone existing object. Example: `Object.clone()`, Spring `prototype` scope.

### Structural patterns
- **Adapter**: Convert one interface to another. Example: `Arrays.asList(...)` adapts array to List.
- **Decorator**: Wrap object to add behavior. Example: `BufferedReader` wraps `Reader`. Spring AOP advices are decorators.
- **Proxy**: Stand-in that controls access. Spring uses **dynamic proxies** for `@Transactional`, `@Async`, `@PreAuthorize`.
- **Facade**: Simplified interface to subsystem. Example: `JdbcTemplate` hides JDBC boilerplate.

### Behavioral patterns
- **Strategy**: Interchangeable algorithms. Example: Spring's `PasswordEncoder` (BCrypt, Argon2, Pbkdf2 all implement same interface).
- **Observer**: One-to-many notification. Example: `ApplicationEventPublisher` + `@EventListener` in Spring.
- **Template Method**: Skeleton with steps to override. Example: `JdbcTemplate`, `RestTemplate`.
- **Chain of Responsibility**: Filters in a chain. Example: Spring Security `SecurityFilterChain`, Servlet filters.
- **Command**: Encapsulate request as object. Example: `Runnable`, `Callable`.

### Q: Which patterns are in SkillSync?
- **Singleton**: All Spring beans (services, repos, controllers).
- **Strategy**: `PasswordEncoder` interface — `BCryptPasswordEncoder` is the chosen strategy.
- **Chain of Responsibility**: `JwtAuthenticationFilter` → `ServiceJwtFilter` → controller filter chain.
- **Builder**: Lombok `@Builder` on `AuthUser`, `AuthResponse`.
- **Proxy**: `@Transactional` on `AuthService.login()` — Spring wraps it in a tx-managing proxy.
- **Facade**: `AuthService` is a facade hiding repository + JWT + email + AOP details from the controller.
- **Observer**: RabbitMQ event listeners (notification-service consumes events).

---

## DSA Quick Reference

### Big-O cheat sheet
| Structure | Access | Search | Insert | Delete |
|---|---|---|---|---|
| Array | O(1) | O(n) | O(n) | O(n) |
| ArrayList | O(1) | O(n) | O(1) amortized | O(n) |
| LinkedList | O(n) | O(n) | O(1) | O(1) |
| HashMap/HashSet | — | O(1) avg | O(1) avg | O(1) avg |
| TreeMap/TreeSet | — | O(log n) | O(log n) | O(log n) |
| Stack/Queue | — | — | O(1) | O(1) |
| Heap | — | — | O(log n) | O(log n) |

### Sorting algorithms
| Algorithm | Best | Avg | Worst | Space | Stable? |
|---|---|---|---|---|---|
| Bubble | O(n) | O(n²) | O(n²) | O(1) | Yes |
| Insertion | O(n) | O(n²) | O(n²) | O(1) | Yes |
| Merge | O(n log n) | O(n log n) | O(n log n) | O(n) | Yes |
| Quick | O(n log n) | O(n log n) | O(n²) | O(log n) | No |
| Heap | O(n log n) | O(n log n) | O(n log n) | O(1) | No |
| `Arrays.sort` (primitives) = Dual-Pivot Quicksort. `Collections.sort` / `Arrays.sort` (objects) = TimSort (stable). |

### Common patterns to recognize
- **Two pointers**: sorted array problems, palindrome check, remove duplicates.
- **Sliding window**: longest substring, max sum subarray of size k.
- **Fast & slow pointers**: detect cycle in linked list (Floyd's), find middle node.
- **Hash map for O(1) lookup**: two-sum, anagram groups, frequency count.
- **Stack**: valid parentheses, next greater element, monotonic stack.
- **Recursion + memoization**: fibonacci, climbing stairs, edit distance.
- **BFS**: shortest path in unweighted graph, level-order tree traversal.
- **DFS**: tree problems, graph cycle detection, backtracking (n-queens, sudoku).
- **Binary search**: sorted array, search range, peak element, first/last occurrence.
- **Heap (PriorityQueue)**: top-K elements, kth largest, merge K sorted lists.
- **Dynamic programming**: optimal substructure + overlapping subproblems.

### 10 must-know problems
1. **Two Sum** — hash map.
2. **Reverse a Linked List** — iterative or recursive.
3. **Detect cycle in Linked List** — Floyd's tortoise and hare.
4. **Valid Parentheses** — stack.
5. **Merge Two Sorted Lists** — pointers.
6. **Best Time to Buy/Sell Stock** — single pass.
7. **Longest Substring Without Repeating Characters** — sliding window + set.
8. **Maximum Subarray (Kadane's)** — DP.
9. **Binary Tree Level Order Traversal** — BFS with queue.
10. **Number of Islands** — DFS/BFS on grid.

### Java tip for coding rounds
- `Arrays.sort(arr)`, `Collections.sort(list)`, `list.sort(Comparator.reverseOrder())`
- `Map<K,V>`: `getOrDefault`, `computeIfAbsent`, `merge`
- `PriorityQueue<>(Comparator.reverseOrder())` = max-heap
- `Deque<Integer> stack = new ArrayDeque<>()` (faster than `Stack`)
- `String.toCharArray()`, `Arrays.stream(arr).boxed().toList()`

---

## HTML5 Essentials

### Q: What's new in HTML5?
- **Semantic tags**: `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<aside>`, `<footer>`. Better SEO + a11y.
- **Form input types**: `email`, `tel`, `number`, `date`, `range`, `color`, `search`, `url`.
- **Native validation**: `required`, `pattern`, `min`, `max`, `minlength`, `maxlength`.
- **APIs**: `localStorage`, `sessionStorage`, Geolocation, WebSocket, Web Workers, Drag & Drop, Canvas, History API.
- **Multimedia**: `<video>`, `<audio>` (no Flash needed).
- **Doctype simplified**: `<!DOCTYPE html>`.

### Q: Block vs inline elements?
- **Block**: Take full width, start on new line. `<div>`, `<p>`, `<h1>`-`<h6>`, `<ul>`, `<li>`, `<section>`.
- **Inline**: Take only needed width, flow inline. `<span>`, `<a>`, `<strong>`, `<em>`, `<img>`.
- **Inline-block**: Inline placement + can have width/height/padding/margin.

### Q: `<script>` placement?
- `<script>` (default): Block parsing, fetch, execute.
- `<script async>`: Fetch in parallel, execute as soon as ready (may be out of order).
- `<script defer>`: Fetch in parallel, execute **after** HTML parsed, in order. **Preferred** for most scripts.

### Q: Meta tags every page should have?
```html
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="description" content="...">
<meta name="theme-color" content="#007A64">
<meta property="og:title" content="...">  <!-- social previews -->
```

### Q: `data-*` attributes?
Custom data on element, accessible via `dataset`:
```html
<button data-user-id="42">Edit</button>
<script>btn.dataset.userId  // "42"</script>
```

### Q: What's the DOM?
Document Object Model — tree representation of HTML. JavaScript can read/modify it: `document.querySelector`, `element.appendChild`, etc.

---

## CSS Deep Dive

### Q: Box model?
Every element is a box: **content → padding → border → margin**.
- `box-sizing: content-box` (default): width = content only.
- `box-sizing: border-box` (preferred): width includes padding + border. Set globally:
  ```css
  *, *::before, *::after { box-sizing: border-box; }
  ```

### Q: Selectors specificity?
Higher specificity wins; ties broken by source order.
- Inline style → 1000
- ID (`#id`) → 100
- Class (`.class`), attribute (`[type]`), pseudo-class (`:hover`) → 10
- Element (`div`), pseudo-element (`::before`) → 1
- `!important` overrides all (avoid).

### Q: Position values?
- `static` (default): Normal flow, ignores top/left.
- `relative`: Offset from its normal position; original space preserved.
- `absolute`: Removed from flow, positioned relative to nearest positioned ancestor.
- `fixed`: Relative to viewport (sticks during scroll).
- `sticky`: Toggles between relative and fixed based on scroll.

### Q: Flexbox cheat sheet
```css
.parent {
  display: flex;
  flex-direction: row | column;
  justify-content: flex-start | center | space-between | space-around | space-evenly;
  align-items: stretch | center | flex-start | flex-end | baseline;
  flex-wrap: nowrap | wrap;
  gap: 16px;
}
.child {
  flex: 1;             /* shorthand: grow shrink basis */
  align-self: center;
  order: 2;
}
```
- `justify-content` = main axis. `align-items` = cross axis.
- `flex: 1` = `flex: 1 1 0%` (grow, shrink, basis).

### Q: Grid cheat sheet
```css
.parent {
  display: grid;
  grid-template-columns: repeat(3, 1fr);   /* 3 equal cols */
  grid-template-rows: 80px auto;
  grid-template-areas: "header header header" "sidebar main main";
  gap: 16px;
}
.child {
  grid-column: 1 / 3;       /* span cols 1 to 3 */
  grid-area: main;
}
```
- Use **Grid for 2D layouts**, **Flexbox for 1D**.

### Q: How to center a div?
```css
/* Flexbox (preferred) */
.parent { display: flex; justify-content: center; align-items: center; }

/* Grid */
.parent { display: grid; place-items: center; }

/* Absolute */
.child {
  position: absolute;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
}
```

### Q: Pseudo-classes vs pseudo-elements?
- **Pseudo-class** (`:hover`, `:focus`, `:nth-child(2n)`, `:not(.x)`): State of element.
- **Pseudo-element** (`::before`, `::after`, `::first-line`, `::placeholder`): Virtual sub-element.

### Q: CSS variables?
```css
:root {
  --brand: #007A64;
  --space-md: 16px;
}
.btn { background: var(--brand); padding: var(--space-md); }
```
React in JS: `el.style.setProperty('--brand', 'red')`. SkillSync uses these for theming.

### Q: Responsive — media queries:
```css
@media (max-width: 768px) { .sidebar { display: none; } }
@media (prefers-color-scheme: dark) { :root { --bg: #111; } }
@media (prefers-reduced-motion: reduce) { * { animation: none !important; } }
```

### Q: BEM, CSS Modules, CSS-in-JS — what's the difference?
- **BEM**: Naming convention. `.card__title--featured`. Plain CSS, no tooling.
- **CSS Modules**: Locally-scoped class names auto-generated. `import s from './x.module.css'`.
- **CSS-in-JS** (styled-components, Emotion): Write CSS in JS. Runtime overhead but dynamic.
- **Utility-first** (Tailwind): Atomic classes. Fast prototyping.
- SkillSync uses **inline styles + CSS variables** — pragmatic for a small team.

### Q: `display: none` vs `visibility: hidden` vs `opacity: 0`?
- `display: none`: Removed from layout. No space taken.
- `visibility: hidden`: Hidden but space taken. Not focusable.
- `opacity: 0`: Visually invisible, takes space, **still clickable / focusable**.

### Q: Animation vs Transition?
- **Transition**: From state A to B on a trigger (hover, class change). `transition: opacity 200ms ease;`
- **Animation**: Multi-step via `@keyframes`. Runs on its own, can loop.
```css
@keyframes pulse { 0%,100% {opacity:1} 50% {opacity:.5} }
.dot { animation: pulse 2s infinite; }
```

---

## JavaScript Fundamentals

### Q: `var` vs `let` vs `const`?

| | `var` | `let` | `const` |
|---|---|---|---|
| Scope | function | block | block |
| Hoisting | hoisted (init `undefined`) | hoisted but in TDZ | same as `let` |
| Reassign | yes | yes | no |
| Redeclare | yes | no | no |

**TDZ (Temporal Dead Zone):**
```js
console.log(x);  // ReferenceError (TDZ)
let x = 5;

console.log(y);  // undefined (var hoisted)
var y = 5;
```

**`const` gotcha:** It's the **binding** that's constant, not the value.
```js
const arr = [1, 2];
arr.push(3);    // ✅ OK — mutating the array
arr = [4];      // ❌ TypeError — reassigning the binding
```

**Modern best practice:**
1. Use `const` by default.
2. Use `let` only when you need to reassign.
3. **Never use `var`** in new code.

**Remember:** *"`const` first, `let` if must reassign, `var` never."*

### Q: What is hoisting?
Var/function declarations are moved to the top of their scope at parse time.
```js
console.log(x); // undefined (not error)
var x = 5;

foo();          // works — function declarations fully hoisted
function foo() {}

bar();          // TypeError: bar is not a function
var bar = function() {};
```

### Q: Closure?

**One-liner:**
> *"A function that remembers variables from where it was created, even after that scope is gone."*

```js
function counter() {
  let count = 0;                    // ← captured by closure
  return () => ++count;             // inner function keeps access to count
}
const c = counter();
c(); // 1
c(); // 2
c(); // 3 — count survives because the returned function still holds a reference
```

**Real-world uses:**
1. **Data privacy** (counter above — `count` can't be touched from outside).
2. **Currying**: `add(2)(3)` returns a closure with `2` baked in.
3. **React custom hooks** — every `useState` is a closure capturing the setter.
4. **Event handlers** — the handler closes over the component's variables at definition time (this is why "stale closure" bugs happen in React).

**Classic interview trick:**
```js
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100);  // logs 3, 3, 3
}
for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100);  // logs 0, 1, 2 — each iter has own `i`
}
```

**Remember:** *"Closure = function + its lexical scope, frozen in amber."*

### Q: `this` binding rules?
1. **Default**: global (`window` in browser; `undefined` in strict mode).
2. **Method call**: `obj.method()` → `this = obj`.
3. **Constructor**: `new Foo()` → `this` = new instance.
4. **Explicit**: `fn.call(ctx)`, `fn.apply(ctx, args)`, `fn.bind(ctx)`.
5. **Arrow functions**: Lexical `this` — inherits from enclosing scope. **Don't have their own `this`**.

### Q: Prototypes & inheritance?
Every object has a `__proto__` (link to its prototype). Methods are looked up the prototype chain.
```js
class Animal { eat() { console.log('eat'); } }
class Dog extends Animal { bark() { console.log('woof'); } }
new Dog().eat();  // walks prototype chain
```
Classes are syntactic sugar over prototypes.

### Q: Event Loop?
JS is **single-threaded** but non-blocking via:
- **Call stack**: Synchronous code.
- **Web APIs**: setTimeout, fetch, DOM events run outside the engine.
- **Microtask queue**: Promise callbacks (`.then`), `queueMicrotask`. Runs **before** macrotasks.
- **Macrotask (task) queue**: setTimeout, setInterval, I/O, UI events.

Loop: Stack empty → drain microtasks → run one macrotask → repeat.
```js
console.log('1');
setTimeout(() => console.log('2'), 0);
Promise.resolve().then(() => console.log('3'));
console.log('4');
// Output: 1, 4, 3, 2
```

### Q: Promises & async/await?
```js
// Promise
fetch('/api').then(r => r.json()).then(d => use(d)).catch(e => log(e));

// async/await — same code
async function load() {
  try {
    const r = await fetch('/api');
    const d = await r.json();
    use(d);
  } catch (e) { log(e); }
}
```
- Promise states: pending → fulfilled / rejected.
- `Promise.all([p1,p2])` — waits for all (fails fast on first reject).
- `Promise.allSettled` — waits for all, never rejects.
- `Promise.race` — first to settle wins.
- `Promise.any` — first to fulfill.

### Q: Callback hell — solution?
Nested callbacks → unreadable. **Promises** flatten with chaining; **async/await** makes it look synchronous.

### Q: Spread / rest / destructuring?
```js
const [a, ...rest] = [1, 2, 3];      // a=1, rest=[2,3]
const { name, ...others } = user;
const merged = { ...obj1, ...obj2 };
function sum(...nums) { return nums.reduce((a,b)=>a+b); }
```

### Q: `==` vs `===`?
- `==`: Loose equality, performs type coercion. `"5" == 5` → true.
- `===`: Strict — same type AND value. **Always use `===`**.

### Q: What is `null` vs `undefined`?
- `undefined`: Variable declared but not assigned. Default for missing function params.
- `null`: Explicit "no value" assigned by you.

### Q: Shallow vs deep copy?
```js
const obj = { a: 1, nested: { b: 2 } };
const shallow = { ...obj };               // nested still shared
const deep = JSON.parse(JSON.stringify(obj));  // simple deep (loses functions, dates)
const deep2 = structuredClone(obj);        // modern, handles dates/Map/Set
```

### Q: `map` vs `forEach` vs `filter` vs `reduce`?
- `map(fn)`: Returns new array with transformed values.
- `forEach(fn)`: Iterates, no return.
- `filter(fn)`: Returns new array of items passing predicate.
- `reduce(fn, init)`: Accumulate to single value.
- `find(fn)`: First matching item or undefined.
- `some(fn)`: Returns true if any match.
- `every(fn)`: Returns true if all match.

### Q: Debounce vs Throttle?
- **Debounce**: Wait until N ms after last call. Useful for: search-as-you-type, resize.
- **Throttle**: At most once per N ms. Useful for: scroll, mouse-move.

### Q: ES Modules?
```js
// math.js
export function add(a,b) { return a+b; }
export default function mul(a,b) { return a*b; }

// app.js
import mul, { add } from './math.js';
```
- Static (analyzable for tree-shaking).
- vs CommonJS (`require`/`module.exports`) — dynamic, used in Node.

### Q: Generators / iterators?
Function that can pause/resume with `yield`. Rarely asked but good to know.
```js
function* gen() { yield 1; yield 2; }
for (const v of gen()) console.log(v); // 1, 2
```

---

## TypeScript Essentials

### Q: Why TypeScript?
- Catches type errors at compile time (vs runtime in JS).
- Better IDE autocomplete + refactoring.
- Self-documenting code.

### Q: Basic types
```ts
let name: string = 'Renu';
let age: number = 25;
let active: boolean = true;
let tags: string[] = ['js'];
let pair: [string, number] = ['x', 1];   // tuple
let anything: any = 5;                   // avoid
let unknown_: unknown = JSON.parse('{}'); // safer than any
```

### Q: Interface vs Type alias?
- Both define shapes. Mostly interchangeable.
- **Interface**: Can be reopened (declaration merging). Preferred for object shapes.
- **Type**: Can do unions, intersections, mapped types, conditional types.
```ts
interface User { id: number; name: string; }
type Role = 'admin' | 'user';
type WithEmail = User & { email: string };  // intersection
```

### Q: Generics
```ts
function identity<T>(x: T): T { return x; }
interface ApiResponse<T> { data: T; error?: string; }
const r: ApiResponse<User> = { data: { id: 1, name: 'X' } };
```

### Q: Utility types
- `Partial<T>` — all fields optional.
- `Required<T>` — all required.
- `Pick<T,K>` — subset of keys.
- `Omit<T,K>` — exclude keys.
- `Record<K,V>` — object with key/value types.
- `Readonly<T>` — immutable.

### Q: React + TS quick patterns
```tsx
interface Props { name: string; age?: number; onClick: (id: number) => void; }
const Card: React.FC<Props> = ({ name, age = 0, onClick }) => <div onClick={() => onClick(1)}>{name}</div>;

const [user, setUser] = useState<User | null>(null);
const inputRef = useRef<HTMLInputElement>(null);
```

---

## React (Comprehensive)

### Q: Class vs Functional components?
Modern React — **functional only**. Hooks replaced class state/lifecycle.

```jsx
// Functional (modern)
function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(c => c+1)}>{count}</button>;
}

// Class (legacy)
class Counter extends React.Component {
  state = { count: 0 };
  render() { return <button onClick={() => this.setState({count: this.state.count+1})}>{this.state.count}</button>; }
}
```

### Q: JSX — what is it?
Syntactic sugar over `React.createElement(type, props, ...children)`. Babel/SWC compiles JSX to JS.

### Q: How does React render?
1. State/props change triggers re-render.
2. React builds new **virtual DOM** tree.
3. Diffs against previous (reconciliation algorithm).
4. Computes minimal real DOM updates.
5. Commits to DOM.

### Q: useState?

**Mental model:**
> *"Tell React: when this value changes, re-render the component."*

```jsx
const [count, setCount] = useState(0);
setCount(count + 1);           // direct
setCount(prev => prev + 1);    // functional — safer for async/batched updates
```

**Common pitfalls:**
```jsx
// ❌ Stale state in async closure
setTimeout(() => setCount(count + 1), 1000);  // count captured at render time

// ✅ Functional form sees latest
setTimeout(() => setCount(c => c + 1), 1000);

// ❌ Don't mutate state
state.list.push(item);    // React won't re-render
setState({...state});

// ✅ Create new reference
setState({...state, list: [...state.list, item]});
```

**Remember:** *"useState = remember + re-render. Always new reference, never mutate."*

### Q: useEffect — lifecycle equivalents?

**The 3 patterns by deps array:**

| Deps | Runs when | Class equivalent |
|---|---|---|
| **omitted** | After every render | every lifecycle |
| `[]` (empty) | Once after mount | `componentDidMount` |
| `[a, b]` | On mount + when `a` or `b` changes | `componentDidUpdate` (selective) |

```jsx
// Run once on mount
useEffect(() => { fetchUser(); }, []);

// Re-run when userId changes
useEffect(() => { fetchUser(userId); }, [userId]);

// Cleanup before next run + on unmount
useEffect(() => {
  const id = setInterval(tick, 1000);
  return () => clearInterval(id);  // ← cleanup function
}, []);
```

**Cleanup runs:**
1. Before the effect runs again (deps changed).
2. Before component unmounts.

**Common bugs:**
- **Missing cleanup** → memory leaks (intervals, listeners, subscriptions).
- **Missing deps** → stale closures. Use ESLint plugin `react-hooks/exhaustive-deps`.
- **Object/array deps** → trigger every render. Memoize them with `useMemo`.

**Remember:** *"Empty deps = mount only. No deps = every render. Always cleanup subscriptions."*

### Q: useReducer — when over useState?
When state logic is complex or next state depends on previous in non-trivial ways.
```jsx
function reducer(state, action) {
  switch(action.type) {
    case 'add': return { count: state.count + 1 };
    case 'reset': return { count: 0 };
  }
}
const [state, dispatch] = useReducer(reducer, { count: 0 });
dispatch({ type: 'add' });
```

### Q: useLayoutEffect vs useEffect?
- `useEffect`: Async, runs **after** browser paint. Don't block paint.
- `useLayoutEffect`: Sync, runs **before** paint. Use for DOM measurements that need to be applied before user sees screen.

### Q: Newer hooks (React 18)
- `useId()` — stable unique id (for label/input pairs in SSR).
- `useTransition()` — mark updates as non-urgent (don't block UI).
- `useDeferredValue(value)` — defer re-render of expensive child.
- `useSyncExternalStore` — for libraries integrating with React.

### Q: Custom hooks — when to extract?
When the same logic (state + effects) is reused in multiple components. Naming convention: `useX`.
```jsx
function useFetch(url) {
  const [data, setData] = useState(null);
  useEffect(() => { fetch(url).then(r => r.json()).then(setData); }, [url]);
  return data;
}
```

### Q: useMemo vs useCallback?

**One-liner difference:**
> `useMemo` caches a **value**. `useCallback` caches a **function**.

```jsx
// useMemo — cache expensive computation
const sortedUsers = useMemo(() => users.sort(byName), [users]);

// useCallback — cache function reference
const handleClick = useCallback((id) => doSomething(id), []);

// Equivalence (useCallback is sugar):
useCallback(fn, deps) === useMemo(() => fn, deps);
```

**When to use each:**
| | Use it when |
|---|---|
| `useMemo` | Calculation is **slow** AND result is used in render |
| `useCallback` | Function passed as prop to a `React.memo`-wrapped child |
| `React.memo` | Component re-renders too often with same props |

**Anti-pattern:** Wrapping every value/function. Memoization has its own cost. **Profile first, memoize second.**

**Remember:** *"useMemo = remember the result. useCallback = remember the function. Both: only when slow."*

### Q: useRef?
- Access DOM: `const inputRef = useRef(); <input ref={inputRef} />; inputRef.current.focus()`
- Persist mutable value without re-rendering.

### Q: useContext?
Avoid prop drilling. SkillSync uses it for `AuthContext` — `useAuth()` hook returns `{user, isAuthenticated, login, logout}` anywhere in tree.

### Q: Custom hooks?
Extract reusable logic. SkillSync: `useToast()` returns `{push, success, error}`.

### Q: Controlled vs Uncontrolled inputs?
- **Controlled**: Value is bound to state. `<input value={name} onChange={e => setName(e.target.value)}/>`. Preferred.
- **Uncontrolled**: DOM holds value, read via ref.

### Q: Virtual DOM?
React maintains in-memory tree. On state change, diffs new vs old tree → computes minimal real DOM updates. Makes React fast.

### Q: Key in list — why?
```jsx
{users.map(u => <Row key={u.id} {...u} />)}
```
Helps React identify items across re-renders. Never use array index as key if order changes.

### Q: React performance tips?
- `React.memo(Component)` — skip re-render if props unchanged.
- `useMemo` / `useCallback` for expensive calcs / stable refs.
- Code splitting: `const Lazy = React.lazy(() => import('./X'))` + `<Suspense>`.
- Virtualization for long lists (react-window).
- Avoid inline objects/functions in props (cause re-render).

### Q: State management?
- Local: `useState` / `useReducer`.
- Shared: `useContext` (small apps).
- Large: Redux Toolkit, Zustand, Jotai, TanStack Query (for server state).
- SkillSync uses Context + local state — no Redux needed.

### Q: Error Boundaries?
Class component that catches errors in children's lifecycle/render. Prevents whole app crash.
```jsx
class ErrorBoundary extends React.Component {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error, info) { logToService(error, info); }
  render() { return this.state.hasError ? <Fallback/> : this.props.children; }
}
```
Note: Hooks can't replace this yet — must be a class.

### Q: forwardRef?
Pass refs through components. Useful when wrapping native inputs.
```jsx
const Input = forwardRef((props, ref) => <input ref={ref} {...props} />);
```

### Q: Portals?
Render a child outside parent DOM hierarchy (modals, toasts, tooltips):
```jsx
ReactDOM.createPortal(<Modal/>, document.body);
```

### Q: Suspense + lazy?
Code-split components, show fallback while loading:
```jsx
const Admin = lazy(() => import('./Admin'));
<Suspense fallback={<Spinner/>}><Admin/></Suspense>
```

### Q: Higher-Order Component (HOC)?
Function taking a component and returning a new one with added behavior. Mostly replaced by hooks now.
```jsx
const withAuth = Wrapped => props => isAuthed() ? <Wrapped {...props}/> : <Login/>;
```

### Q: React.memo?
Memoize a component — skip re-render if props (shallow compare) unchanged.
```jsx
const Row = React.memo(function Row({user}) { return <li>{user.name}</li>; });
```

### Q: Reconciliation algorithm ("Fiber")?
- Old (stack reconciler): synchronous, blocks main thread for big trees.
- **Fiber** (React 16+): work split into units, can pause/resume/abort. Enables Concurrent features (Suspense, Transitions).

### Q: Synthetic Events?
React wraps native DOM events into `SyntheticEvent` for cross-browser consistency. Pooled in older versions; in React 17+ no longer pooled.

### Q: Why is `key` important and why not array index?
React uses `key` to track list items across renders. If you use index, reordering/removing items causes wrong components to be reused → bugs (e.g., wrong input value persists).

### Q: useCallback vs useMemo vs React.memo — when to use which?
- `useMemo`: cache an expensive calculated **value**.
- `useCallback`: cache a **function reference** (so referential equality holds).
- `React.memo`: cache a **component's render** when props haven't changed.
Don't over-memoize — adds overhead. Use only after profiling.

---

## State Management

### Q: When do you need a state library?
- Multi-component shared state.
- Server cache (data from API).
- Form state with cross-field deps.
- Time-travel debugging / persistence needed.

### Q: Context API — pros / cons?
**Pros**: Built-in, zero deps, simple API.
**Cons**: Every consumer re-renders when context value changes; no built-in selector / partial subscription. Don't put rapidly-changing state (like cursor position) in context.

### Q: Redux Toolkit (RTK) — modern Redux
```js
// slice
const counterSlice = createSlice({
  name: 'counter',
  initialState: { value: 0 },
  reducers: {
    increment: (s) => { s.value++ },     // immer makes this OK
    setTo: (s, a) => { s.value = a.payload }
  }
});
export const { increment, setTo } = counterSlice.actions;

// store
const store = configureStore({ reducer: { counter: counterSlice.reducer } });

// component
const value = useSelector(s => s.counter.value);
const dispatch = useDispatch();
dispatch(increment());
```
- **Async** with `createAsyncThunk` or RTK Query (built-in data fetching).

### Q: Redux Thunk vs Saga?
- **Thunk**: Action creator returns a function `(dispatch, getState) => ...`. Simpler, most common.
- **Saga**: Generators (`yield`), declarative side-effect management. Powerful but steep curve.

### Q: Zustand — lightweight alternative
```js
const useStore = create(set => ({
  count: 0,
  inc: () => set(s => ({ count: s.count + 1 })),
}));
const count = useStore(s => s.count);
```
No provider boilerplate. Selector-based — only re-renders when slice changes.

### Q: TanStack Query (React Query) — for server state
```js
const { data, isLoading, error } = useQuery({
  queryKey: ['users'],
  queryFn: () => fetch('/api/users').then(r => r.json())
});
```
Handles caching, refetch, retry, dedup, background updates. **Prefer it over Redux for server state**.

---

## Forms & Validation

### Q: Controlled forms in React?
```jsx
const [email, setEmail] = useState('');
<input value={email} onChange={e => setEmail(e.target.value)} />
```

### Q: React Hook Form (most popular today)?
```jsx
const { register, handleSubmit, formState: { errors } } = useForm();
<form onSubmit={handleSubmit(onSubmit)}>
  <input {...register('email', { required: 'Required' })} />
  {errors.email && <span>{errors.email.message}</span>}
</form>
```
- **Uncontrolled-by-default** → less re-renders, faster than Formik.
- Integrates with Zod / Yup for schema validation.

### Q: Schema validation (Zod)?
```ts
import { z } from 'zod';
const schema = z.object({
  email: z.string().email(),
  age: z.number().min(18),
});
schema.parse(data); // throws on invalid; or .safeParse() for non-throwing
```

### Q: HTML5 native validation?
`<input type="email" required minlength="3" pattern="[a-z]+">` — browser shows error tooltips. Style with `:invalid`, `:valid`.

---

## Browser & Web APIs

### Q: localStorage vs sessionStorage vs cookies?
| | Capacity | Lifetime | Sent with requests | Accessible from JS |
|---|---|---|---|---|
| localStorage | ~5–10MB | Until cleared | No | Yes |
| sessionStorage | ~5MB | Tab session | No | Yes |
| Cookies | ~4KB | Configurable | Yes (auto) | Yes (unless `httpOnly`) |

**Token storage**: `httpOnly` cookies are safest (XSS can't read). localStorage is simpler but XSS-vulnerable. SkillSync uses localStorage today — would migrate to httpOnly cookies in production.

### Q: fetch vs XMLHttpRequest vs Axios?
- **XHR**: Old, callback-based.
- **fetch**: Modern, promise-based, built-in. Doesn't reject on 4xx/5xx (need to check `res.ok`).
- **Axios**: Library. Auto-JSON, interceptors, timeouts, request cancel. SkillSync uses it via `apiClient.js`.

### Q: CORS — quick recap
Browser blocks cross-origin requests unless server sends `Access-Control-Allow-Origin`. For non-simple requests (PUT, custom headers), browser sends a **preflight OPTIONS** request first. Server must respond with allowed methods/headers.

### Q: WebSockets vs HTTP?
- HTTP: Request-response, stateless.
- WebSocket: Full-duplex persistent connection. Use for chat, live notifications, collaborative editing.

### Q: Service Worker?
Background script that intercepts network requests. Enables offline support, push notifications, PWA install. Activates after first visit + reload.

### Q: Web Worker?
Run JS in a background thread (no DOM access). Use for CPU-heavy tasks (image processing, parsing). Communicate via `postMessage`.

### Q: How does browser render a page?
1. Parse HTML → DOM tree.
2. Parse CSS → CSSOM.
3. Combine → Render tree.
4. Layout (compute positions/sizes).
5. Paint (rasterize).
6. Composite layers.

Reflow (layout) is expensive. Avoid changing geometric properties in animations — prefer `transform` and `opacity` (composite-only).

---

## Frontend Performance

### Q: Core Web Vitals?
- **LCP** (Largest Contentful Paint): < 2.5s. Hero image/text loaded.
- **FID / INP** (Input Delay / Interaction to Next Paint): < 200ms. UI responsiveness.
- **CLS** (Cumulative Layout Shift): < 0.1. Visual stability.

### Q: How to optimize a slow React app?
1. **Profile** with React DevTools Profiler — find unnecessary re-renders.
2. `React.memo` for pure presentational components.
3. `useMemo` / `useCallback` for expensive calcs / stable refs.
4. **Code-split** routes with `React.lazy` + `<Suspense>`.
5. **Virtualize** long lists (`react-window`).
6. **Defer** non-critical work: `useTransition`, `useDeferredValue`.
7. Avoid passing **inline objects/functions** as props (breaks `memo`).
8. Move state down — closer to where it's used.
9. **Image optimization**: `<img loading="lazy">`, `srcSet`, modern formats (WebP/AVIF).
10. **Remove unused libs** — check bundle with `vite-bundle-visualizer` or `webpack-bundle-analyzer`.

### Q: Critical rendering path optimizations?
- Inline critical CSS, defer rest.
- `<link rel="preload">` for fonts.
- `<link rel="preconnect">` for third-party origins.
- Use HTTP/2, gzip/brotli.
- Minify + hash assets (long cache + cache-busting).

### Q: Tree shaking?
Dead code elimination — bundlers (Vite/Webpack) remove unused exports. Only works with **ES modules** (static imports). Avoid `import * as x` and side-effectful imports.

### Q: Lazy loading images?
```html
<img src="thumb.jpg" loading="lazy" alt="...">
```
Or use `IntersectionObserver` for advanced control.

---

## Frontend Security

### Q: XSS (Cross-Site Scripting)?
Attacker injects `<script>` into a page that another user views. Steals cookies/tokens.
- **React protection**: JSX auto-escapes text content. `{userInput}` is safe.
- **Danger**: `dangerouslySetInnerHTML={{__html: userInput}}` — sanitize first with **DOMPurify**.
- **CSP** (Content-Security-Policy header): Whitelist script sources.

### Q: CSRF (Cross-Site Request Forgery)?
Attacker tricks browser into sending authenticated request to your site (cookies auto-sent).
- **Defense 1**: SameSite cookies (`SameSite=Strict` or `Lax`).
- **Defense 2**: CSRF tokens (synchronizer token pattern).
- **Defense 3**: Use `Authorization: Bearer` header (not cookies) → no CSRF.

### Q: How does SkillSync prevent these?
- **XSS**: React auto-escaping, no `dangerouslySetInnerHTML` for user content.
- **CSRF**: JWT in `Authorization` header (not cookie) → CSRF doesn't apply.
- **Clickjacking**: `X-Frame-Options: DENY` would be added in production.
- **HTTPS** in production (Let's Encrypt).
- **Helmet** middleware in API gateway adds security headers.

### Q: What's a CSP?
HTTP header telling browser which sources are allowed for scripts/styles/images. Defense-in-depth against XSS.
```
Content-Security-Policy: default-src 'self'; script-src 'self' https://apis.example.com
```

---

## Testing (Frontend & Backend)

### Q: Testing pyramid?
- **Unit** (most): Test single function/component in isolation. Fast.
- **Integration**: Multiple modules together (e.g., service + repo with embedded DB).
- **E2E** (fewest): Full app via real browser (Cypress, Playwright). Slow but realistic.

### Q: Backend — JUnit + Mockito basics
```java
@ExtendWith(MockitoExtension.class)
class AuthServiceTest {
  @Mock AuthUserRepository repo;
  @Mock PasswordEncoder encoder;
  @InjectMocks AuthService service;

  @Test
  void login_validUser_returnsToken() {
    when(repo.findByEmail("a@b")).thenReturn(Optional.of(user));
    when(encoder.matches(anyString(), anyString())).thenReturn(true);
    var resp = service.login(new LoginRequest("a@b", "pwd"));
    assertNotNull(resp.getAccessToken());
    verify(repo).findByEmail("a@b");
  }
}
```

### Q: Spring Boot integration testing?
- `@SpringBootTest` — full app context.
- `@WebMvcTest(Controller.class)` — only MVC slice (mocks services).
- `@DataJpaTest` — only repo slice with embedded DB.
- `MockMvc` — simulate HTTP requests without real server.
- **Testcontainers** — spin up real MySQL/RabbitMQ in Docker for tests.

### Q: React Testing Library (RTL) basics
```jsx
import { render, screen, fireEvent } from '@testing-library/react';

test('clicking increments', () => {
  render(<Counter />);
  const btn = screen.getByRole('button', { name: /increment/i });
  fireEvent.click(btn);
  expect(screen.getByText('1')).toBeInTheDocument();
});
```
- **Philosophy**: Test what users see/do, not implementation.
- Query priority: `getByRole` > `getByLabelText` > `getByText` > `getByTestId`.

### Q: Mock fetch / API in RTL?
- **MSW (Mock Service Worker)** — intercept network at the worker level. Works for unit + e2e.
```js
server.use(rest.get('/users', (req,res,ctx) => res(ctx.json([{id:1}]))));
```

### Q: Cypress vs Playwright?
Both are E2E test runners. Playwright is newer, faster, supports multi-browser/multi-tab. Cypress has better debugging UI.

---

## Build Tools (Vite, Webpack)

### Q: Vite — why so fast?
- Dev: Native ES modules in browser. No bundling on save → instant HMR.
- Prod: Uses Rollup (smaller bundles than Webpack).
- esbuild for transpilation (Go-based, ~100x faster than Babel).

### Q: Webpack basics
- Entry → Loaders (transform files) → Plugins (broader hooks) → Output.
- Concepts: chunks, code splitting (`import()`), tree shaking, source maps.

### Q: HMR (Hot Module Replacement)?
Replace updated module without full reload, **preserving state**. Vite's HMR via ES modules is much faster than Webpack's.

### Q: Babel vs SWC vs esbuild?
All transpile newer JS/TS to older JS for browser support.
- **Babel**: Plugin ecosystem, slow.
- **SWC**: Rust-based, ~20x faster.
- **esbuild**: Go-based, fastest.

---

## Accessibility (a11y)

### Q: Why a11y?
Legal compliance (ADA, EU Accessibility Act), broader audience, better SEO.

### Q: Quick wins
- **Semantic HTML** (`<button>`, `<nav>`, `<main>`) > `<div onClick>`.
- **Labels**: `<label htmlFor="email">` linked to input.
- **alt** on every meaningful image. `alt=""` for decorative.
- **Focus ring**: don't `outline: none` without alternative.
- **Color contrast** ≥ 4.5:1 for text.
- **Keyboard navigable**: Tab order makes sense, Esc closes modals.
- **ARIA only when HTML can't express it**. Wrong ARIA is worse than none.

### Q: ARIA basics
- `role="button"` (only if not using `<button>`).
- `aria-label="Close"` for icon-only buttons.
- `aria-live="polite"` for toasts/announcements.
- `aria-expanded`, `aria-haspopup` for dropdowns/menus.

### Q: How to test?
- **axe DevTools** Chrome extension.
- **Lighthouse** a11y audit.
- Try navigating with **only keyboard** (Tab, Enter, Esc, arrows).
- Screen reader: VoiceOver (Mac), NVDA (Windows free).

---

## React Router

### Q: React Router basics?
```jsx
<BrowserRouter>
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/users/:id" element={<UserPage />} />
    <Route path="*" element={<NotFound />} />
  </Routes>
</BrowserRouter>

// Hooks
const { id } = useParams();
const navigate = useNavigate();
const location = useLocation();
```

---

## SQL

### Q: Joins?

**Visual mental model:**
```
INNER JOIN     LEFT JOIN      RIGHT JOIN     FULL OUTER
  A ∩ B         A + (A∩B)     B + (A∩B)      A ∪ B
  ●●             ●●○○           ○○●●           ●●●●
```

| Type | Returns |
|---|---|
| `INNER JOIN` | Only rows matching in **both** |
| `LEFT JOIN` | All from left + matches; right side NULL if no match |
| `RIGHT JOIN` | All from right + matches |
| `FULL OUTER JOIN` | All rows from both (NULLs where no match) |
| `CROSS JOIN` | Cartesian product (every left × every right) |
| `SELF JOIN` | Table joined to itself (e.g., employee → manager hierarchy) |

**Example:**
```sql
SELECT u.name, o.id
FROM users u
LEFT JOIN orders o ON o.user_id = u.id;   -- includes users with no orders
```

**Performance tip:** Always join on **indexed columns**. Foreign keys typically have one already.

**Remember:** *"INNER = intersection. LEFT = keep all left. RIGHT = keep all right. FULL = keep all."*

### Q: Indexes?
Speed up reads at cost of writes. `CREATE INDEX idx_email ON users(email);`. B-tree is default. Use when column is frequently filtered/sorted on.

### Q: Primary key vs Unique key?
- **PK**: One per table. NOT NULL + UNIQUE. Creates clustered index (MySQL InnoDB).
- **Unique**: Multiple allowed. Can be NULL (once).

### Q: Normalization?
- **1NF**: Atomic values, no repeating groups.
- **2NF**: 1NF + no partial dependencies on composite PK.
- **3NF**: 2NF + no transitive dependencies.
- Denormalize for read-heavy systems (trade space for speed).

### Q: Transactions — ACID?

| Letter | Means | Real example (bank transfer) |
|---|---|---|
| **A**tomicity | All-or-nothing | If debit succeeds but credit fails → BOTH rolled back. |
| **C**onsistency | Valid → valid state | Constraints (FK, CHECK) never violated. Total money in bank unchanged. |
| **I**solation | Concurrent tx don't interfere | Two simultaneous transfers don't see each other's half-done state. |
| **D**urability | Committed data survives crash | Once `COMMIT` returns, even if server crashes, data is safe (WAL/redo log). |

**Mnemonic:** *"A Crash Is Drama-free."*

### Q: Common query patterns:
```sql
-- Top N per group
SELECT * FROM (
  SELECT *, ROW_NUMBER() OVER (PARTITION BY category ORDER BY score DESC) rn
  FROM products
) x WHERE rn <= 3;

-- Pagination
SELECT * FROM users ORDER BY id LIMIT 20 OFFSET 40;

-- Group by + having
SELECT role, COUNT(*) FROM users GROUP BY role HAVING COUNT(*) > 5;

-- Exists
SELECT * FROM users u WHERE EXISTS (
  SELECT 1 FROM orders o WHERE o.user_id = u.id
);
```

---

## SkillSync Project Viva

> ⭐ **Rehearse this section OUT LOUD before the interview.** Interviewers love project depth.

### Tech Stack Decisions — "Why X and not Y?" ⭐

> Interviewers love this. Be ready to defend every tech choice.

#### **Why Spring Boot (not plain Spring / Quarkus / Micronaut)?**
- Spring Boot: opinionated, embedded server, auto-config, huge ecosystem.
- Plain Spring: tons of XML/Java config boilerplate.
- Quarkus / Micronaut: faster startup (great for serverless) but smaller ecosystem and less hiring familiarity.
- **Verdict**: Spring Boot is the industry default for Java enterprise apps. Largest community = fastest unblocking.

#### **Why Microservices (not Monolith)?**
- Honest answer for an interview: "For a project this size, a modular monolith would have been simpler. I chose microservices to **learn the distributed systems patterns** — service discovery, gateway, distributed tracing, async messaging — that I'd encounter in real production environments."
- Trade-off: complexity (network, eventual consistency, observability) vs independent deploy/scale.

#### **Why MySQL (not PostgreSQL / MongoDB)?**
- **MySQL**: Familiar, ubiquitous in Indian product companies, strong tooling.
- **PostgreSQL**: Better for advanced features (JSONB, CTEs, window functions). Would be my pick for greenfield enterprise today.
- **MongoDB**: Document store — wrong choice here because user/session data is highly relational (joins between users, sessions, mentor profiles).
- **Verdict**: SkillSync data is relational → SQL. MySQL for ecosystem familiarity.

#### **Why JWT (not Sessions)?**
- Microservices need to be **stateless**. Sessions require a shared session store (Redis) which becomes a bottleneck and SPOF.
- JWT = self-contained, signed token. Any service can verify offline using the public key (or shared secret here).
- **Trade-off**: Hard to revoke before expiry. Mitigated by short-lived access tokens (15 min) + refresh tokens.

#### **Why BCrypt (not SHA-256 / MD5 / PBKDF2 / Argon2)?**
- **MD5 / SHA-256**: Designed to be **fast** → a GPU can crack billions/sec. **NEVER** use for passwords.
- **PBKDF2**: Configurable rounds. Standardized but no built-in salt management.
- **BCrypt**: Adaptive cost factor (`2^n` rounds). Includes salt automatically. Battle-tested since 1999.
- **Argon2**: Winner of 2015 password hashing competition. Memory-hard (resists GPU). Best in class but library support in Java is newer.
- **Verdict**: BCrypt is the Spring Security default. Strength 10 (`2^10` = 1024 rounds) takes ~100ms — fast enough for users, slow enough to defeat brute-force.

#### **Why RabbitMQ (not Kafka / ActiveMQ / Redis Pub/Sub)?**
- **RabbitMQ**: Smart broker, complex routing (topic/fanout/direct exchanges), per-message ack, easy retry/DLQ. Best for **task queues** (notifications, emails).
- **Kafka**: Dumb broker, smart consumers. Distributed log for **streaming** (analytics, event sourcing). Overkill for SkillSync's notification volume.
- **ActiveMQ**: Older, JMS-compliant. Less performant than RabbitMQ.
- **Redis Pub/Sub**: Fire-and-forget, no persistence. Loses messages if no consumer is up.
- **Verdict**: RabbitMQ fits SkillSync's pattern — reliable email/notification delivery with retry, dead-letter queues, and per-message ack.

#### **Why Eureka (not Consul / Zookeeper / Kubernetes service discovery)?**
- **Eureka**: Built for Spring Cloud. AP (availability over consistency) — fits microservices where stale data is OK briefly.
- **Consul**: Multi-datacenter, includes KV store + health checks. CP (consistency over availability).
- **Zookeeper**: Strong consistency but heavy, designed for distributed coordination, not service discovery.
- **Kubernetes**: If on K8s, use built-in service discovery (DNS-based). No need for Eureka.
- **Verdict**: Spring Cloud + Eureka = zero-config integration. Would switch to K8s service discovery if deploying on K8s.

#### **Why Spring Cloud Gateway (not Zuul 1 / Nginx / Kong)?**
- **Spring Cloud Gateway**: Reactive (Netty), non-blocking, integrates seamlessly with Spring Cloud (Eureka, Config).
- **Zuul 1**: Servlet-based, blocking IO — worse throughput. Officially deprecated by Netflix.
- **Nginx**: Excellent reverse proxy but custom logic (JWT validation) needs Lua or external auth subrequests.
- **Kong / Tyk**: Production-grade API gateways with plugins. Overkill for this scope.
- **Verdict**: Spring Cloud Gateway is the natural choice for a Spring Boot microservices stack — unified config, dynamic routing, easy filter chain.

#### **Why Vite (not Create React App / Webpack / Next.js)?**
- **CRA**: Officially deprecated. Slow dev startup (10s+), slow HMR.
- **Webpack alone**: Powerful but lots of config.
- **Vite**: Native ESM in dev (instant), Rollup in prod (smaller bundles), esbuild for transpile (~100x faster).
- **Next.js**: SSR/SSG framework. Overkill for an authenticated SPA — SkillSync content is behind login, no SEO benefit.
- **Verdict**: Vite for speed; SPA over SSR because no SEO requirement.

#### **Why React (not Angular / Vue / Svelte)?**
- **React**: Largest ecosystem, library-first (pick your own router/state), most jobs.
- **Angular**: Full framework, opinionated, TypeScript-first, steeper curve. Better for large enterprise teams with strict structure.
- **Vue**: Easier curve, similar perf. Smaller ecosystem outside Asia.
- **Svelte**: No virtual DOM, smaller bundles. Newer, smaller community.
- **Verdict**: React for hiring familiarity and ecosystem. Angular would be my pick for a 50+ person team.

#### **Why Context API (not Redux / Zustand / TanStack Query)?**
- SkillSync only needs auth + theme as global state. **Context is enough**.
- **Redux Toolkit**: Better for complex client state with time-travel debugging. Boilerplate not justified here.
- **Zustand**: Lighter than Redux, would be a fine alternative.
- **TanStack Query**: For server state (caching, refetch). Would adopt if app grew — currently we manage with simple Axios calls.
- **Verdict**: YAGNI — don't introduce a state library until you need it.

#### **Why Axios (not native fetch)?**
- **Axios pros**: Auto-JSON, interceptors (perfect for attaching JWT), timeouts, request cancellation, better error handling (rejects on 4xx/5xx).
- **fetch**: Built-in, but doesn't reject on HTTP errors — you must `if (!res.ok)` everywhere.
- **Verdict**: Axios interceptor lets us add `Authorization` header in **one place**. Cleaner.

#### **Why Docker Compose (not Kubernetes / bare-metal)?**
- **Docker Compose**: Single-host orchestration. Perfect for **local dev** and small deployments.
- **Kubernetes**: Multi-host, auto-scaling, self-healing. Overkill for dev. Production would use K8s.
- **Verdict**: Compose for dev simplicity. Production roadmap: containerize → push to ECR → deploy on EKS/ECS.

#### **Why BCrypt strength 10 (not 12 / 14)?**
- Strength `n` = `2^n` rounds.
- `10` = ~100ms per hash on modern hardware.
- `12` = ~400ms (login feels slow).
- `14` = ~1.6s (DoS risk on login spike).
- **Verdict**: 10 balances security and login UX. Production banking might use 12.

#### **Why TypeScript would have been better (honest weakness)?**
- SkillSync frontend uses plain JS. With TS, props/state shapes are checked at compile time — catches whole classes of bugs.
- I'd migrate to TS if continuing the project. Vite supports it out of the box.

---

### The 60-second pitch
> "SkillSync is a peer-to-peer skill-exchange platform where learners book sessions with mentors. I built it as a **Spring Boot microservices backend** with a **React frontend**. There are 7 microservices — auth, user, mentor, skill, session, notification, and an API gateway — all registered with Eureka, configured via Spring Cloud Config, and containerized with Docker Compose. I implemented JWT-based auth with BCrypt, role-based access control, RabbitMQ for async email notifications, and full observability via Prometheus, Grafana, Loki, and Zipkin. The frontend is Vite + React with React Router, Context API for auth state, and a reusable component system with theming (light/dark)."

### Architecture diagram (draw this on paper during interview)
```
                  ┌──────────────┐
                  │  React SPA   │ (Vite, Nginx)
                  └──────┬───────┘
                         │ HTTPS
                  ┌──────▼──────────┐
                  │  API Gateway    │ (Spring Cloud Gateway, JWT validation)
                  │  (port 8888)    │──────────┐
                  └──────┬──────────┘          │
                         │                     │ Register/discover
                   routes│                ┌────▼─────┐
                         │                │  Eureka  │
         ┌───────────────┼───────────────┤  Server  │
         │       │       │       │       └──────────┘
    ┌────▼─┐ ┌───▼──┐ ┌──▼──┐ ┌──▼───┐
    │ Auth │ │ User │ │Ment.│ │Skill │ ... etc.
    └───┬──┘ └──┬───┘ └──┬──┘ └───┬──┘
        │       │        │        │
        └───────┴────────┴────────┘
                    │
              ┌─────▼─────┐   ┌──────────┐
              │   MySQL   │   │ RabbitMQ │
              └───────────┘   └──────────┘
```

### Q: Why microservices? Why not monolith?
"I went with microservices to **learn the industry standard** for distributed systems and to isolate concerns — auth is security-critical, notifications are async, sessions are transactional. Each service has its own database schema (in the same MySQL instance for dev simplicity), so they can evolve independently. The trade-off is added complexity — service discovery, distributed tracing, eventual consistency — which I managed with Eureka, Zipkin, and idempotent REST endpoints."

### Q: Walk me through what happens when a user logs in.
1. Frontend `LoginPage.jsx` POSTs `{email, password}` to `/auth/login`.
2. Request hits **API Gateway**. Since `/auth/login` is in the `OPEN_ENDPOINTS` list of `JwtAuthenticationFilter`, gateway skips JWT validation.
3. Gateway routes to `skillsync-auth-service` via Eureka (`lb://SKILLSYNC-AUTH-SERVICE`).
4. `AuthController.login()` → `AuthService.login()` → `authenticationManager.authenticate(...)` → triggers `CustomUserDetailsService.loadUserByUsername()` → queries DB → `BCryptPasswordEncoder.matches()` compares password hash.
5. On success: `JwtService.generateToken(user)` creates HS256 JWT with `sub=userId, role=ROLE_X, email=...`, 15-min expiry. Refresh token with 7-day expiry.
6. Response: `{ accessToken, refreshToken, role, email, userId }`.
7. Frontend stores in memory/localStorage. Axios interceptor attaches `Authorization: Bearer ...` on every outgoing request.
8. **Developer account special-case**: If email matches the configured developer email, don't issue tokens immediately — issue a 6-digit OTP via email, return `{otpRequired: true}`. Frontend redirects to OTP screen, user submits to `/auth/verify-otp`, real tokens returned.

### Q: How is role-based access enforced?
1. Gateway validates JWT → injects `X-User-Id`, `X-User-Role`, `X-User-Email` headers.
2. Downstream services have `ServiceJwtFilter` (from `skillsync-common`) that reads those headers and populates `SecurityContextHolder` with a `UsernamePasswordAuthenticationToken(userId, null, [role])`.
3. Controller methods use `@PreAuthorize("hasRole('ADMIN')")` — Spring Security checks the authority. `@EnableMethodSecurity(prePostEnabled = true)` enables this.

### Q: Why did you put `ServiceJwtFilter` in `skillsync-common`?
"DRY. Six downstream services all need the same logic — read headers from gateway, populate security context. Putting it in a shared lib means one place to maintain. I also put `GlobalExceptionHandler` and shared DTOs (`ErrorResponse`) there."

### Q: What happens if gateway is down?
"The frontend gets a connection refused. In production I'd run multiple gateway instances behind an AWS ALB or use the sidecar pattern with Istio. For now, Eureka self-preservation keeps the last known registry, so downstream services still know about each other — but without the gateway, no external traffic flows."

### Q: How did you handle the "user sees empty list" bug?
*(The bug we fixed this session)*

"In `adminListUsers`, the endpoint was throwing a 500 because `AuthUser.enabled` was a `boolean` primitive with `@Column(nullable=false)`, but some seed rows had `enabled=NULL` in the DB. Hibernate tried to unbox null → NullPointerException → 500. The frontend's `.catch(() => [])` silently swallowed it, so the admin saw 'No users yet'.

**Fix**: 
1. Updated DB to set `enabled=1` for all rows.
2. Fixed `GlobalExceptionHandler` to turn `BadCredentialsException` into 401 instead of falling through to generic 500.
3. Changed the frontend catch to surface errors via a toast, so silent failures can't happen again.
4. Fixed the users table in `AdminConsole.jsx` to use the actual response shape (`userId, email, fullName, role, enabled`) instead of guessed fields."

### Q: How does the chatbot widget work?
"`ChatbotWidget.jsx` is a floating drawer component mounted at the app root. It checks `useAuth()` — only renders when authenticated. It also checks `useLocation()` to hide on `/auth/*` routes, because `isAuthenticated` can be true on the login page (stale token before redirect). The chatbot itself calls a notification-service endpoint that forwards to an LLM — there are two personas: Nikki (general helper) and Elaichi (bookings specialist)."

### Q: Why Vite and not Create React App?
"CRA is deprecated. Vite is faster — native ES modules in dev, Rollup for prod builds. Dev server starts in ~200ms vs CRA's 10+ seconds. HMR is near-instant. Also smaller bundles."

### Q: How do you structure your React code?
"Feature-first structure, not type-first:
```
src/
  core/        # auth context, API client, services
  features/
    admin/AdminConsole.jsx
    mentor/
    chatbot/
    landing/
  shared/
    components/ # Card, Button, Toast, Avatar
    layouts/    # Shell, AuthLayout
```
Shared components go in `shared/`. Feature-specific pages + logic stay co-located. Services (API wrappers) in `core/services/*.js`."

### Q: How does your theming work?
"CSS variables defined at `:root` and `[data-theme="dark"]` in `index.css`. Components use `var(--brand-600)`, `var(--text-primary)`, etc. A `ThemeContext` toggles the `data-theme` attribute on `document.documentElement`. Persisted to localStorage. Light theme is 'EdCare' (teal primary, white surfaces), dark is 'Flacto' (navy/cyan glow)."

### Q: What was the hardest bug you fixed?
"Probably the admin users list. The symptom was 'empty list' but the real cause was a chain of three issues: (1) NULL `enabled` column causing NPE in the entity, (2) `BadCredentialsException` falling through to a 500 generic handler so login also failed, (3) the frontend silently swallowing errors with `.catch(() => [])`. I traced it by testing the backend endpoint directly with curl, reading the docker logs for the real exception, then fixing upstream in the entity + exception handler, and downstream in the frontend error handling."

### Q: Would you do anything differently?
- "Use UUIDs instead of auto-increment IDs — safer for distributed systems."
- "Add per-service databases, not shared MySQL."
- "Add OpenAPI specs + consumer-driven contract testing (Pact)."
- "Switch frontend localStorage JWT to httpOnly cookies for XSS protection."
- "Add a proper refresh-token rotation flow."
- "Kubernetes for orchestration, not Docker Compose."

### Q: What's `docker-compose.full.yml`?
"It's the full local dev stack — 15 containers: 7 microservices, gateway, MySQL, RabbitMQ, Eureka, Config Server, Prometheus, Grafana, Loki, Zipkin, and the frontend on Nginx. One command (`docker compose up`) brings the whole platform up. Each service has a healthcheck and `depends_on` so they start in order."

### Q: How do you handle service-to-service auth?
"Internal calls trust gateway-injected headers. A service calling another service within the mesh attaches the same `X-User-Id` / `X-User-Role` — no re-validation. If a service needs to call another **without** a user context (e.g., background job), I'd use a signed internal token or mTLS between services. For now, the services aren't exposed publicly — only via the gateway — so internal trust is safe in the docker network."

---

## System Design Lite

### Q: How would you scale SkillSync to 1M users?
1. **Horizontal scale** each stateless service behind an ELB.
2. **DB**: Move to per-service databases. Add read replicas for heavy-read services (mentor search). Consider sharding by region.
3. **Caching**: Redis in front of hot endpoints (mentor list, skill catalog).
4. **CDN**: CloudFront in front of frontend static assets + API for cacheable GETs.
5. **Async**: Offload non-critical work (email, push notifs) to RabbitMQ/SQS.
6. **Search**: Elasticsearch for mentor/skill search instead of LIKE queries.
7. **Rate limiting**: Gateway-level.
8. **Observability**: Distributed tracing (already have Zipkin) + APM.
9. **CI/CD**: Blue-green deploys via Kubernetes.

### Q: How would you design a URL shortener?
- API: `POST /shorten` → returns `short`. `GET /{short}` → 301 redirect.
- DB: `(short_code VARCHAR(7) PRIMARY KEY, long_url TEXT, created_at, expires_at, clicks BIGINT)`.
- `short_code` = base62-encoded counter, or hash truncation with collision retry.
- Cache recent redirects in Redis (TTL = remaining expiry).
- Analytics: fire event to Kafka for async click tracking.

---

## Tricky Interview Qs

### Q: Can you explain the difference between `@SpringBootApplication` and `@EnableAutoConfiguration`?
`@SpringBootApplication` = `@Configuration` + `@EnableAutoConfiguration` + `@ComponentScan`. It's a convenience meta-annotation.

### Q: What is a Spring BeanPostProcessor?
Intercepts bean initialization. Two hooks: `postProcessBeforeInitialization` and `postProcessAfterInitialization`. Used internally for `@Autowired` injection, AOP proxying, etc.

### Q: How does `@Transactional` propagation work?
- `REQUIRED` (default): Join existing tx or create new.
- `REQUIRES_NEW`: Always start new tx; pause existing.
- `NESTED`: Nested savepoint within existing.
- `SUPPORTS`: Join if exists, else non-transactional.
- `NOT_SUPPORTED`: Pause existing.
- `NEVER`: Throw if tx exists.
- `MANDATORY`: Throw if no tx.

### Q: React — why are hooks called at top level only?
React tracks hook calls by order. Putting a hook inside a conditional changes call order across renders → state gets misaligned. Rule of Hooks enforces this via ESLint.

### Q: What is hydration in React?
When SSR-rendered HTML is served, the client React "hydrates" it — attaches event listeners and state without re-rendering DOM. Saves work vs full client render.

### Q: Why might `useState` setter not update immediately?
State updates are **batched and async**. `setCount(count+1); setCount(count+1);` only increments once. Use functional form: `setCount(c => c+1)`.

### Q: What happens if you don't clean up `useEffect`?
Memory leaks, duplicate listeners, setInterval running forever. Always return cleanup function for subscriptions/timers/fetches.

### Q: JVM memory model?
- **Heap**: All objects (Young Gen = Eden + S0 + S1, Old Gen, Metaspace).
- **Stack**: Per-thread. Method frames, local vars.
- **Metaspace**: Class metadata (replaced PermGen in Java 8).
- **GC**: G1 (default 9+), Parallel, CMS (deprecated), ZGC/Shenandoah (low-pause).

### Q: Difference between `ArrayList.remove(int)` and `ArrayList.remove(Object)`?
`remove(int index)` removes by index. `remove(Object o)` removes first occurrence. For `List<Integer>`, `list.remove(1)` is ambiguous and calls `remove(int)` — autoboxing doesn't happen. Use `list.remove(Integer.valueOf(1))` to remove by value.

### Q: What is a Deadlock? Livelock? Starvation?
- **Deadlock**: 2+ threads waiting on each other's locks forever.
- **Livelock**: Threads keep changing state in response to each other without progress.
- **Starvation**: Low-priority thread never gets CPU / lock.

### Q: HTTP vs HTTPS?
HTTPS = HTTP over TLS. Encryption + server identity (cert). Required for modern auth / PWA / service workers.

### Q: What is CORS?
Cross-Origin Resource Sharing. Browser security: blocks requests to a different origin unless the server sends `Access-Control-Allow-Origin`. Handled in Spring via `@CrossOrigin` or global `CorsConfigurationSource`.

---

## HR / Behavioral

### "Tell me about yourself."
> "I'm a Java full-stack developer focused on Spring Boot and React. Most recently I've been building SkillSync — a peer learning platform with 7 microservices, JWT auth, RabbitMQ, and a Vite + React frontend. I like working across the stack — I enjoy the challenge of chasing a bug from the database through the service layer up to the UI. I'm most interested in roles where I can work on real product features and learn from senior engineers."

### "What's your biggest strength?"
> "I debug methodically. Instead of guessing, I read logs, reproduce, isolate, and fix upstream. Recently I fixed an admin-users bug that was silently failing — I traced it from a 500 in the backend logs down to a NULL `enabled` column and a swallowed frontend catch block, and fixed all three layers."

### "Weakness?"
> "I sometimes spend too long polishing details when moving on would be better. I've been balancing this by timeboxing — set 30 min, and if not done, merge and create a follow-up ticket."

### "Why us?"
> Research the company. Pick 2 specific things — their stack, a product you admire, engineering culture posts. Generic answers are forgettable.

### "Where do you see yourself in 5 years?"
> "Senior/staff level. Owning architecture for a major feature area, mentoring juniors, and still writing code every day. Full-stack capability is a long-term advantage I want to keep sharpening."

### "Tell me about a conflict."
> Pick a real situation. Structure: **Situation → Action → Result**. Focus on what **you** did, not blaming others.

### "Any questions for us?" (ALWAYS ask 2–3)
- "What does success look like in the first 90 days?"
- "What's the team's biggest technical challenge right now?"
- "How do you balance feature delivery with technical debt?"
- "What's the code review / deploy cadence?"
- "What's one thing you'd change about the team's engineering practices?"

---

## Last-minute checklist (morning of interview)

- [ ] Read the [SkillSync Project Viva](#skillsync-project-viva) section aloud twice
- [ ] Re-skim the JWT flow, microservice communication, and React hooks
- [ ] Have 3 strong STAR stories ready (challenge, learning, teamwork)
- [ ] Have 3 thoughtful questions for them
- [ ] Sleep well, eat before, water nearby
- [ ] If whiteboarding: draw the architecture diagram first, talk through it
- [ ] If coding: explain out loud, ask clarifying questions, write tests

**Good luck!** 🚀
