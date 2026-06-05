<div class="cover">

# Interview Q&A — Asked Questions

<div class="divider"></div>

<div class="subtitle">Complete answers with code examples<br/>From real interview questions</div>

<div class="divider"></div>

<div class="author">Java · Spring Boot · React · SQL · JWT</div>

</div>

# Part 1: Java Questions

## Q1. What are Java Streams?

**Definition:** Streams API (Java 8+) processes collections in a functional, declarative style. A stream is a sequence of elements supporting sequential and parallel aggregate operations.

**Key Properties:**
- **Lazy** — intermediate operations don't execute until terminal op called
- **Single-use** — can only be consumed once
- **No mutation** — doesn't modify the source

**Pipeline:** Source → Intermediate ops → Terminal op

```java
List<String> activeNames = users.stream()                    // SOURCE
    .filter(u -> u.isActive())                              // intermediate (lazy)
    .map(User::getName)                                      // intermediate (lazy)
    .sorted()                                                // intermediate (lazy)
    .collect(Collectors.toList());                          // TERMINAL (executes)
```

## Q2. Streams — Sorting and Filtering

```java
List<Employee> employees = List.of(
    new Employee(1, "Renu", "Developer", 50000),
    new Employee(2, "Amit", "Manager", 80000),
    new Employee(3, "Priya", "Developer", 60000)
);

// FILTERING
List<Employee> developers = employees.stream()
    .filter(e -> e.getDesignation().equals("Developer"))
    .collect(Collectors.toList());

// SORTING ascending
List<Employee> bySalary = employees.stream()
    .sorted(Comparator.comparing(Employee::getSalary))
    .collect(Collectors.toList());

// SORTING descending
List<Employee> bySalaryDesc = employees.stream()
    .sorted(Comparator.comparing(Employee::getSalary).reversed())
    .collect(Collectors.toList());

// FILTER + SORT + MAP combined
List<String> topDevNames = employees.stream()
    .filter(e -> e.getDesignation().equals("Developer"))
    .sorted(Comparator.comparing(Employee::getSalary).reversed())
    .map(Employee::getName)
    .collect(Collectors.toList());

// GROUPING
Map<String, List<Employee>> byDesignation = employees.stream()
    .collect(Collectors.groupingBy(Employee::getDesignation));

// AVERAGE salary by designation
Map<String, Double> avgByDesignation = employees.stream()
    .collect(Collectors.groupingBy(
        Employee::getDesignation,
        Collectors.averagingDouble(Employee::getSalary)
    ));
```

## Q3. Reverse a String in Java — All Ways

```java
// Method 1: StringBuilder (best for production)
public String reverse1(String s) {
    return new StringBuilder(s).reverse().toString();
}

// Method 2: char array swap (in-place)
public String reverse2(String s) {
    char[] chars = s.toCharArray();
    int left = 0, right = chars.length - 1;
    while (left < right) {
        char tmp = chars[left];
        chars[left++] = chars[right];
        chars[right--] = tmp;
    }
    return new String(chars);
}

// Method 3: Recursion
public String reverse3(String s) {
    if (s.isEmpty()) return s;
    return reverse3(s.substring(1)) + s.charAt(0);
}

// Method 4: Stream API
public String reverse4(String s) {
    return s.chars()
        .mapToObj(c -> String.valueOf((char) c))
        .reduce("", (a, b) -> b + a);
}

// Method 5: Loop backwards
public String reverse5(String s) {
    StringBuilder sb = new StringBuilder();
    for (int i = s.length() - 1; i >= 0; i--) {
        sb.append(s.charAt(i));
    }
    return sb.toString();
}
```

> **Interview answer:** "Use `new StringBuilder(s).reverse().toString()` — clean, fast, idiomatic. If asked to do it manually, use the two-pointer char array swap."

## Q4. Binary Search in Java

```java
// Iterative
public int binarySearch(int[] arr, int target) {
    int left = 0, right = arr.length - 1;
    while (left <= right) {
        int mid = left + (right - left) / 2;  // avoids overflow
        if (arr[mid] == target) return mid;
        else if (arr[mid] < target) left = mid + 1;
        else right = mid - 1;
    }
    return -1;
}

// Recursive
public int binarySearchRec(int[] arr, int target, int left, int right) {
    if (left > right) return -1;
    int mid = left + (right - left) / 2;
    if (arr[mid] == target) return mid;
    if (arr[mid] < target) return binarySearchRec(arr, target, mid + 1, right);
    return binarySearchRec(arr, target, left, mid - 1);
}

// Built-in (Java 7+)
int[] arr = {1, 3, 5, 7, 9, 11};
int index = Arrays.binarySearch(arr, 7);  // returns 3

// For collections
List<Integer> list = List.of(1, 3, 5, 7, 9);
int idx = Collections.binarySearch(list, 5);  // returns 2
```

**Complexity:** O(log n) time, O(1) iterative / O(log n) recursive space.
**Prerequisite:** Array MUST be sorted.

## Q5. Predicate, Function, and Functional Interfaces

A **functional interface** has exactly **one abstract method** (SAM = Single Abstract Method).

| Interface | Method | Returns | Use For |
|---|---|---|---|
| `Predicate<T>` | `test(T)` | boolean | Filtering |
| `Function<T,R>` | `apply(T)` | R | Transformation |
| `Consumer<T>` | `accept(T)` | void | Side effect |
| `Supplier<T>` | `get()` | T | Provide value |
| `BiFunction<T,U,R>` | `apply(T,U)` | R | Two-input transform |
| `UnaryOperator<T>` | `apply(T)` | T | Same-type transform |
| `BinaryOperator<T>` | `apply(T,T)` | T | Reduce |

```java
// PREDICATE — boolean test
Predicate<Integer> isEven = n -> n % 2 == 0;
Predicate<Integer> isPositive = n -> n > 0;
Predicate<Integer> isEvenAndPositive = isEven.and(isPositive);
Predicate<Integer> isOddOrPositive = isEven.negate().or(isPositive);

System.out.println(isEven.test(4));  // true
System.out.println(isEvenAndPositive.test(6));  // true

// FUNCTION — transform
Function<String, Integer> length = String::length;
Function<Integer, Integer> doubled = n -> n * 2;
Function<String, Integer> lengthDoubled = length.andThen(doubled);
System.out.println(lengthDoubled.apply("Hello"));  // 10

// CONSUMER — side effect
Consumer<String> printer = System.out::println;
printer.accept("Hello");

// SUPPLIER — provides value
Supplier<List<String>> listSupplier = ArrayList::new;

// CUSTOM functional interface
@FunctionalInterface
interface Validator<T> {
    boolean validate(T input);
    
    default Validator<T> and(Validator<T> other) {
        return input -> this.validate(input) && other.validate(input);
    }
}
```

## Q6. Default and Static Methods in Interfaces (Java 8+)

```java
public interface PaymentProcessor {
    
    // Abstract method (must be implemented)
    void processPayment(double amount);
    
    // DEFAULT method — has body, can be overridden
    default void logTransaction(double amount) {
        System.out.println("Processing payment of: " + amount);
    }
    
    // STATIC method — belongs to interface, not instance
    static PaymentProcessor getDefault() {
        return amount -> System.out.println("Default processing: " + amount);
    }
    
    // PRIVATE method (Java 9+) — helper for default methods
    private String formatAmount(double amount) {
        return String.format("$%.2f", amount);
    }
}

class CreditCardProcessor implements PaymentProcessor {
    @Override
    public void processPayment(double amount) {
        logTransaction(amount);  // uses default method
        System.out.println("Charged credit card: " + amount);
    }
}

// Usage
PaymentProcessor processor = PaymentProcessor.getDefault();  // static call
processor.processPayment(100.0);
```

**Why default methods?** Add methods to interfaces without breaking existing implementations (interface evolution).

**Why static methods?** Utility methods related to the interface (like `Comparator.comparing()`).

---

# Part 2: SQL Questions

## Q7. SQL — Display Employee Designation and ID

```sql
-- Basic query
SELECT employee_id, designation 
FROM employees;

-- With employee name
SELECT employee_id, full_name, designation 
FROM employees
ORDER BY designation, employee_id;

-- Group by designation with count
SELECT designation, COUNT(*) AS total_employees
FROM employees
GROUP BY designation
ORDER BY total_employees DESC;

-- With filter (active only)
SELECT employee_id, designation
FROM employees
WHERE status = 'ACTIVE'
ORDER BY designation;

-- Using JOIN if designations are in another table
SELECT e.employee_id, d.designation_name
FROM employees e
INNER JOIN designations d ON e.designation_id = d.id
ORDER BY d.designation_name, e.employee_id;
```

## Q8. SQL Self Join

A **self join** is when a table is joined with itself — useful for hierarchical data.

```sql
-- Employees table with manager_id pointing to same table
CREATE TABLE employees (
    id INT PRIMARY KEY,
    name VARCHAR(50),
    manager_id INT,
    FOREIGN KEY (manager_id) REFERENCES employees(id)
);

-- Find each employee with their manager's name
SELECT 
    e.id AS employee_id,
    e.name AS employee_name,
    m.name AS manager_name
FROM employees e
LEFT JOIN employees m ON e.manager_id = m.id;

-- Find employees who earn more than their managers
SELECT 
    e.name AS employee,
    e.salary AS emp_salary,
    m.name AS manager,
    m.salary AS mgr_salary
FROM employees e
INNER JOIN employees m ON e.manager_id = m.id
WHERE e.salary > m.salary;

-- Find pairs of employees in same department
SELECT 
    e1.name AS employee1,
    e2.name AS employee2,
    e1.department
FROM employees e1
INNER JOIN employees e2 
    ON e1.department = e2.department 
    AND e1.id < e2.id;  -- avoid duplicates and self-pairs
```

> **Why `e1.id < e2.id`?** To avoid duplicates like (Alice, Bob) AND (Bob, Alice), and to exclude self-pairs (Alice, Alice).

---

# Part 3: Spring Boot Questions

## Q9. What is a Bean? Types of Beans

**Bean** = An object that is **instantiated, assembled, and managed by the Spring IoC container**.

**Bean Scopes (5 types):**

| Scope | Lifespan | Example Use |
|---|---|---|
| `singleton` (default) | One per container | Stateless services |
| `prototype` | New per injection | Stateful objects |
| `request` | Per HTTP request | Per-request data |
| `session` | Per HTTP session | User session data |
| `application` | Per ServletContext | App-wide config |

**Bean Stereotypes:**

| Annotation | Layer | Adds |
|---|---|---|
| `@Component` | Generic | Base bean |
| `@Service` | Business logic | Semantic clarity |
| `@Repository` | Data access | Exception translation |
| `@Controller` | Web layer | View resolution |
| `@RestController` | REST API | + `@ResponseBody` |
| `@Configuration` | Config | Allows `@Bean` methods |

```java
// Example of all bean types
@Configuration
public class AppConfig {
    
    @Bean  // Manual bean definition
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }
    
    @Bean
    @Scope("prototype")  // New instance each time
    public ReportGenerator reportGenerator() {
        return new ReportGenerator();
    }
}

@Service  // Singleton by default
public class AuthService { }

@Repository
public interface UserRepository extends JpaRepository<User, Long> { }

@RestController
public class AuthController { }
```

## Q10. Bean Lifecycle

```
1. Container started
2. Bean instantiated (constructor)
3. Dependencies injected (@Autowired)
4. @PostConstruct called
5. InitializingBean.afterPropertiesSet()
6. Custom init-method called
7. Bean ready for use
   ... bean used by application ...
8. Container shutting down
9. @PreDestroy called
10. DisposableBean.destroy()
11. Custom destroy-method called
```

```java
@Component
public class LifecycleBean {
    
    public LifecycleBean() {
        System.out.println("1. Constructor");
    }
    
    @Autowired
    public void setDependency(SomeDep dep) {
        System.out.println("2. Dependency injected");
    }
    
    @PostConstruct
    public void init() {
        System.out.println("3. @PostConstruct — bean ready");
    }
    
    @PreDestroy
    public void cleanup() {
        System.out.println("4. @PreDestroy — bean shutting down");
    }
}
```

## Q11. @Autowired — How and Why

`@Autowired` tells Spring to **inject a dependency** automatically.

**3 ways to use:**

```java
@Service
public class AuthService {
    
    // 1. Field injection (NOT RECOMMENDED — hard to test)
    @Autowired
    private UserRepository userRepository;
    
    // 2. Setter injection (for optional deps)
    private EmailService emailService;
    
    @Autowired(required = false)  // optional
    public void setEmailService(EmailService emailService) {
        this.emailService = emailService;
    }
    
    // 3. Constructor injection (RECOMMENDED — best practice)
    private final JwtService jwtService;
    
    @Autowired  // optional since Spring 4.3 if only one constructor
    public AuthService(JwtService jwtService) {
        this.jwtService = jwtService;
    }
}

// Modern style with Lombok
@Service
@RequiredArgsConstructor  // generates constructor for final fields
public class AuthService {
    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
}
```

**When multiple beans match:**
```java
@Autowired
@Qualifier("bcryptEncoder")  // pick specific bean
private PasswordEncoder encoder;

// OR mark one as primary
@Bean
@Primary
public PasswordEncoder bcryptEncoder() { ... }
```

## Q12. Common Spring Boot Annotations

| Annotation | Purpose |
|---|---|
| `@SpringBootApplication` | Entry point (combines 3 annotations) |
| `@RestController` | REST controller, returns JSON |
| `@RequestMapping` | Map HTTP requests to methods |
| `@GetMapping` `@PostMapping` `@PutMapping` `@DeleteMapping` | HTTP method shortcuts |
| `@PathVariable` | Extract from URL path |
| `@RequestParam` | Extract query parameter |
| `@RequestBody` | Deserialize JSON body |
| `@Valid` | Trigger validation |
| `@Autowired` | Dependency injection |
| `@Qualifier` | Specify bean by name |
| `@Value` | Inject property value |
| `@ConfigurationProperties` | Bind property prefix to class |
| `@Transactional` | Wrap method in transaction |
| `@PreAuthorize` `@PostAuthorize` | Method security |
| `@ExceptionHandler` | Handle specific exception |
| `@RestControllerAdvice` | Global exception handler |
| `@EnableScheduling` | Enable @Scheduled |
| `@Scheduled` | Cron jobs |
| `@Async` | Run method in separate thread |

## Q13. Spring Boot Services Used in SkillSync

```java
// 1. AuthService — Authentication & JWT
@Service
@RequiredArgsConstructor
public class AuthService {
    private final AuthUserRepository repository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthEmailService emailService;
    
    public AuthResponse login(LoginRequest req) { ... }
    public void register(RegisterRequest req) { ... }
    public void verifyOtp(String email, String otp) { ... }
}

// 2. JwtService — Token generation/validation
@Service
public class JwtService {
    public String generateToken(User user) { ... }
    public Claims validateToken(String token) { ... }
}

// 3. UserService — Profile management
@Service
public class UserService { ... }

// 4. MentorService — Mentor profiles, availability
@Service
public class MentorService { ... }

// 5. SessionService — Booking, scheduling
@Service
public class SessionService { ... }

// 6. NotificationService — Email, push
@Service
public class NotificationService { ... }

// 7. SkillService — Skills catalog
@Service
public class SkillService { ... }
```

---

# Part 4: JPA Questions

## Q14. What is JpaRepository?

**JpaRepository** is a Spring Data interface that **provides built-in CRUD operations** without writing implementation code.

**Hierarchy:**
```
Repository (marker)
  └── CrudRepository (basic CRUD)
       └── PagingAndSortingRepository (pagination + sorting)
            └── JpaRepository (JPA-specific: flush, batch operations)
```

**What you get for free:**
```java
// All these methods work automatically:
repository.save(entity);
repository.saveAll(entities);
repository.findById(id);
repository.findAll();
repository.findAllById(ids);
repository.count();
repository.delete(entity);
repository.deleteById(id);
repository.deleteAll();
repository.existsById(id);
repository.flush();
repository.findAll(Pageable.ofSize(10));
repository.findAll(Sort.by("name"));
```

## Q15. Methods in JpaRepository — All Patterns

```java
@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    // 1. Query Method — Spring generates from name
    Optional<User> findByEmail(String email);
    List<User> findByRole(Role role);
    List<User> findByRoleAndStatus(Role role, Status status);
    boolean existsByEmail(String email);
    long countByRole(Role role);
    
    // 2. Advanced query methods
    List<User> findByEmailContainingIgnoreCase(String keyword);
    List<User> findByCreatedAtBetween(Instant start, Instant end);
    List<User> findByAgeGreaterThan(Integer age);
    List<User> findByEmailStartingWith(String prefix);
    List<User> findTop10ByOrderByCreatedAtDesc();
    
    // 3. JPQL with @Query
    @Query("SELECT u FROM User u WHERE u.lastLogin > :since")
    List<User> findActiveUsers(@Param("since") LocalDateTime since);
    
    @Query("SELECT u FROM User u WHERE u.email = ?1 AND u.enabled = true")
    Optional<User> findActiveByEmail(String email);
    
    // 4. Native SQL
    @Query(value = "SELECT * FROM users WHERE created_at > :since", 
           nativeQuery = true)
    List<User> findRecentNative(@Param("since") LocalDateTime since);
    
    // 5. Modifying queries
    @Modifying
    @Transactional
    @Query("UPDATE User u SET u.enabled = false WHERE u.id = :id")
    int disableUser(@Param("id") Long id);
    
    @Modifying
    @Transactional
    @Query("DELETE FROM User u WHERE u.lastLogin < :date")
    int deleteInactiveUsers(@Param("date") LocalDateTime date);
    
    // 6. Pagination
    Page<User> findByRole(Role role, Pageable pageable);
    
    // 7. Projection (select specific fields)
    @Query("SELECT new com.example.UserDTO(u.id, u.email, u.role) FROM User u")
    List<UserDTO> findAllDTOs();
}
```

---

# Part 5: Pagination

## Q16. Pagination Code — Backend & Frontend

### Backend (Spring Boot)

```java
// Controller
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;
    
    @GetMapping
    public Page<UserDTO> getUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String direction) {
        
        Sort sort = direction.equalsIgnoreCase("desc") 
            ? Sort.by(sortBy).descending() 
            : Sort.by(sortBy).ascending();
        
        Pageable pageable = PageRequest.of(page, size, sort);
        return userService.getUsers(pageable);
    }
}

// Service
@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    
    public Page<UserDTO> getUsers(Pageable pageable) {
        Page<User> users = userRepository.findAll(pageable);
        return users.map(this::toDTO);
    }
    
    public Page<UserDTO> searchUsers(String keyword, Pageable pageable) {
        return userRepository
            .findByFullNameContainingIgnoreCase(keyword, pageable)
            .map(this::toDTO);
    }
    
    private UserDTO toDTO(User u) {
        return new UserDTO(u.getId(), u.getFullName(), u.getEmail());
    }
}

// Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Page<User> findByFullNameContainingIgnoreCase(String keyword, Pageable pageable);
}
```

**Response shape:**
```json
{
  "content": [...],
  "pageable": { "pageNumber": 0, "pageSize": 10 },
  "totalElements": 150,
  "totalPages": 15,
  "first": true,
  "last": false,
  "number": 0,
  "size": 10
}
```

### Frontend (React)

```jsx
import { useState, useEffect } from 'react';

function UsersList() {
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(0);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/users?page=${page}&size=${pageSize}`)
      .then(res => res.json())
      .then(data => {
        setUsers(data.content);
        setTotalPages(data.totalPages);
      })
      .finally(() => setLoading(false));
  }, [page, pageSize]);

  return (
    <div>
      {loading ? <p>Loading...</p> : (
        <>
          <table>
            <thead>
              <tr><th>ID</th><th>Name</th><th>Email</th></tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td>{u.fullName}</td>
                  <td>{u.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
          
          <div className="pagination">
            <button 
              onClick={() => setPage(p => Math.max(0, p - 1))} 
              disabled={page === 0}>
              Previous
            </button>
            <span>Page {page + 1} of {totalPages}</span>
            <button 
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} 
              disabled={page >= totalPages - 1}>
              Next
            </button>
          </div>
          
          {/* Numbered pagination */}
          <div className="page-numbers">
            {Array.from({length: totalPages}, (_, i) => (
              <button 
                key={i}
                onClick={() => setPage(i)}
                className={page === i ? 'active' : ''}>
                {i + 1}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
```

---

# Part 6: Validation

## Q17. What is Validation? Where in SkillSync?

**Validation** = ensuring incoming data meets business rules before processing.

**3 Layers in SkillSync:**

### Layer 1: Frontend (React) — Quick UX feedback
```jsx
const [errors, setErrors] = useState({});

const validateForm = () => {
  const newErrors = {};
  if (!form.email.includes('@')) newErrors.email = 'Invalid email';
  if (form.password.length < 8) newErrors.password = 'Min 8 characters';
  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};

const handleSubmit = (e) => {
  e.preventDefault();
  if (!validateForm()) return;
  // submit
};
```

### Layer 2: Backend DTO — Bean Validation (Jakarta)
```java
public class RegisterRequest {
    @NotBlank(message = "Email required")
    @Email(message = "Invalid email format")
    private String email;
    
    @NotBlank(message = "Password required")
    @Size(min = 8, max = 100, message = "Password must be 8-100 chars")
    @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).+$",
             message = "Must contain uppercase, lowercase, digit")
    private String password;
    
    @NotBlank
    @Size(min = 2, max = 100)
    private String fullName;
    
    @NotNull
    @Min(value = 18, message = "Must be 18+")
    @Max(150)
    private Integer age;
}

// Controller — @Valid triggers validation
@PostMapping("/register")
public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest req) {
    return ResponseEntity.ok(authService.register(req));
}

// Validation errors handled globally
@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<?> handleValidation(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(e ->
            errors.put(e.getField(), e.getDefaultMessage()));
        return ResponseEntity.badRequest().body(Map.of("errors", errors));
    }
}
```

### Layer 3: Database constraints
```sql
CREATE TABLE auth_users (
    user_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) NOT NULL UNIQUE,    -- DB-level uniqueness
    password VARCHAR(255) NOT NULL,
    age INT CHECK (age >= 18)               -- DB-level check
);
```

**Common Validation Annotations:**

| Annotation | Validates |
|---|---|
| `@NotNull` | Not null |
| `@NotBlank` | Not null and not whitespace-only (String) |
| `@NotEmpty` | Not null and not empty (String/Collection) |
| `@Size(min,max)` | Length within range |
| `@Min` `@Max` | Number range |
| `@Email` | Email format |
| `@Pattern(regex)` | Regex match |
| `@Past` `@Future` | Date in past/future |
| `@Valid` | Cascade validation |

---

# Part 7: HTML & CSS

## Q18. HTML Form Validations

```html
<form onsubmit="return validateForm()">
  <!-- HTML5 built-in validation -->
  <input 
    type="email" 
    name="email" 
    required 
    placeholder="you@example.com"
    pattern="[^@]+@[^@]+\.[^@]+"
    title="Enter a valid email">
  
  <input 
    type="password" 
    name="password" 
    required 
    minlength="8" 
    maxlength="100"
    pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$"
    title="Min 8 chars with upper, lower, digit">
  
  <input 
    type="number" 
    name="age" 
    required 
    min="18" 
    max="120">
  
  <input 
    type="tel" 
    name="phone" 
    pattern="[0-9]{10}" 
    title="10 digits">
  
  <input 
    type="url" 
    name="website" 
    placeholder="https://...">
  
  <input 
    type="date" 
    name="dob" 
    max="2007-01-01">
  
  <select name="role" required>
    <option value="">Select...</option>
    <option value="learner">Learner</option>
    <option value="mentor">Mentor</option>
  </select>
  
  <textarea 
    name="bio" 
    minlength="10" 
    maxlength="500"></textarea>
  
  <input type="checkbox" name="terms" required>
  <label>I accept terms</label>
  
  <button type="submit">Submit</button>
</form>
```

**HTML5 Validation Attributes:**

| Attribute | Purpose |
|---|---|
| `required` | Field must have value |
| `minlength` / `maxlength` | String length |
| `min` / `max` | Number/date range |
| `pattern` | Regex match |
| `type="email"` | Email format |
| `type="url"` | URL format |
| `type="tel"` | Telephone (with pattern) |
| `type="number"` | Numeric only |
| `step` | Number increment |

## Q19. CSS Selectors — Types Used

```css
/* 1. ELEMENT (tag) selector */
p { color: black; }
h1 { font-size: 2em; }

/* 2. CLASS selector */
.highlight { background: yellow; }
.btn-primary { background: blue; }

/* 3. ID selector */
#header { height: 60px; }
#main-content { padding: 20px; }

/* 4. UNIVERSAL selector */
* { box-sizing: border-box; margin: 0; }

/* 5. ATTRIBUTE selector */
input[type="email"] { border: 2px solid blue; }
a[href^="https"] { color: green; }     /* starts with */
a[href$=".pdf"] { color: red; }         /* ends with */
a[href*="example"] { color: purple; }   /* contains */

/* 6. PSEUDO-CLASS selector */
button:hover { background: darkblue; }
input:focus { outline: 2px solid orange; }
li:first-child { font-weight: bold; }
li:last-child { border-bottom: none; }
li:nth-child(odd) { background: #f0f0f0; }
li:nth-child(2n+1) { background: gray; }
a:visited { color: purple; }
input:disabled { opacity: 0.5; }
input:checked + label { color: green; }

/* 7. PSEUDO-ELEMENT selector */
p::first-line { font-weight: bold; }
p::first-letter { font-size: 2em; }
.tooltip::before { content: "→ "; }
.tooltip::after { content: " ←"; }
::selection { background: yellow; }
::placeholder { color: gray; }

/* 8. COMBINATOR selectors */
div p { color: red; }              /* descendant */
div > p { color: blue; }           /* direct child */
h1 + p { font-style: italic; }     /* adjacent sibling */
h1 ~ p { color: gray; }            /* general sibling */

/* 9. GROUPING selector */
h1, h2, h3 { font-family: 'Inter'; }

/* 10. CLASS combinations */
.btn.primary { background: blue; }    /* both classes */
.btn .icon { margin-right: 8px; }      /* descendant */
```

**Specificity (highest wins):**
- Inline style: 1000
- ID: 100
- Class/attribute/pseudo-class: 10
- Element/pseudo-element: 1

---

# Part 8: React Questions

## Q20. What are React Hooks? Types

**Hooks** are functions (Java 16.8+) that let you "hook into" React state and lifecycle features from function components.

**Rules:**
1. Only call hooks at the top level (not inside conditions/loops)
2. Only call hooks from React functions (components or custom hooks)

**Built-in Hooks (14 types):**

| Hook | Category | Purpose |
|---|---|---|
| `useState` | State | Local state |
| `useReducer` | State | Complex state logic |
| `useContext` | State | Consume context |
| `useEffect` | Effect | Side effects, lifecycle |
| `useLayoutEffect` | Effect | Sync DOM updates |
| `useInsertionEffect` | Effect | Insert styles |
| `useMemo` | Performance | Memoize value |
| `useCallback` | Performance | Memoize function |
| `useTransition` | Performance | Mark non-urgent updates |
| `useDeferredValue` | Performance | Defer slow re-render |
| `useRef` | Refs | Mutable ref / DOM access |
| `useImperativeHandle` | Refs | Expose imperative API |
| `useId` | Utility | Stable unique ID |
| `useDebugValue` | Debug | Custom hook label |

```jsx
// useState — most common
const [count, setCount] = useState(0);

// useEffect — side effects
useEffect(() => {
  fetchData();
  return () => cleanup();  // cleanup on unmount
}, [dependency]);

// useContext — consume context
const auth = useContext(AuthContext);

// useReducer — complex state
const [state, dispatch] = useReducer(reducer, initialState);

// useMemo — memoize expensive computation
const sorted = useMemo(() => 
  users.sort((a, b) => a.name.localeCompare(b.name)), 
  [users]
);

// useCallback — memoize function
const handleClick = useCallback(() => {
  doSomething(id);
}, [id]);

// useRef — DOM access or mutable value
const inputRef = useRef(null);
useEffect(() => inputRef.current.focus(), []);
```

## Q21. Props — Parent to Child Communication

```jsx
// PARENT component
function Parent() {
  const [count, setCount] = useState(0);
  const user = { name: 'Renu', age: 25 };
  
  const handleIncrement = () => setCount(c => c + 1);
  
  return (
    <div>
      <h1>Parent Count: {count}</h1>
      
      {/* Pass primitive */}
      <Child name="Renu" age={25} />
      
      {/* Pass object */}
      <Child user={user} />
      
      {/* Pass function (callback) */}
      <Child onIncrement={handleIncrement} count={count} />
      
      {/* Pass children */}
      <Child>
        <p>This is rendered as children prop</p>
      </Child>
    </div>
  );
}

// CHILD component
function Child({ name, age, user, onIncrement, count, children }) {
  return (
    <div>
      <p>Name: {name}, Age: {age}</p>
      {user && <p>User: {user.name}</p>}
      {children}
      <button onClick={onIncrement}>Increment ({count})</button>
    </div>
  );
}

// CHILD-TO-PARENT (via callback)
function ChildForm({ onSubmit }) {
  const [text, setText] = useState('');
  
  const handleSubmit = () => {
    onSubmit(text);  // ← calls parent's function with data
  };
  
  return (
    <>
      <input value={text} onChange={e => setText(e.target.value)} />
      <button onClick={handleSubmit}>Send to Parent</button>
    </>
  );
}

// Parent receives data
function ParentWithForm() {
  const [received, setReceived] = useState('');
  
  return (
    <>
      <ChildForm onSubmit={(data) => setReceived(data)} />
      <p>Received from child: {received}</p>
    </>
  );
}
```

**Communication Patterns:**

| Direction | Method |
|---|---|
| Parent → Child | Props |
| Child → Parent | Callback function passed as prop |
| Sibling → Sibling | Lift state to common parent |
| Deep nesting | Context API |
| Anywhere in tree | State management (Redux, Zustand) |

## Q22. Why TypeScript?

**TypeScript** = JavaScript with static types added.

**Benefits:**

| Benefit | Without TS | With TS |
|---|---|---|
| Catch errors | Runtime crashes | Compile-time errors |
| IDE support | Basic autocomplete | Full intellisense |
| Refactoring | Risky | Safe rename across files |
| Documentation | Comments | Types ARE documentation |
| Team scaling | Knowledge tribal | Self-documenting code |
| API contracts | Trust + tests | Compiler enforces |

```typescript
// Without TypeScript — bug at runtime
function calculateTotal(price, qty) {
  return price * qty;  // what if qty is "5"? → "55" string!
}

// With TypeScript — caught at compile time
function calculateTotal(price: number, qty: number): number {
  return price * qty;
}

// Interfaces for objects
interface User {
  id: number;
  email: string;
  role: 'LEARNER' | 'MENTOR' | 'ADMIN';
  enabled?: boolean;  // optional
}

const user: User = {
  id: 1,
  email: 'renu@example.com',
  role: 'LEARNER'
  // TS errors if you forget id or use wrong role!
};

// Generics
function getFirst<T>(arr: T[]): T | undefined {
  return arr[0];
}

const num = getFirst([1, 2, 3]);  // T = number
const str = getFirst(['a', 'b']); // T = string

// React with TypeScript
interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

const Button: React.FC<ButtonProps> = ({ label, onClick, variant = 'primary' }) => {
  return <button onClick={onClick} className={variant}>{label}</button>;
};
```

## Q23. What is Axios?

**Axios** = Promise-based HTTP client for browsers and Node.js.

**Why Axios over fetch?**

| | fetch (built-in) | Axios |
|---|---|---|
| Auto JSON parse | ❌ Manual `.json()` | ✅ Automatic |
| HTTP error handling | ❌ Doesn't reject on 4xx/5xx | ✅ Rejects automatically |
| Request/response interceptors | ❌ No | ✅ Yes |
| Request timeout | ❌ Manual (AbortController) | ✅ Built-in |
| Request cancellation | ❌ Verbose | ✅ Easy |
| XSRF protection | ❌ Manual | ✅ Built-in |
| Browser support | Modern only | All browsers |

```js
// Setup with interceptors (SkillSync style)
import axios from 'axios';

const apiClient = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' }
});

// REQUEST interceptor — attach JWT
apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// RESPONSE interceptor — handle 401, refresh token
apiClient.interceptors.response.use(
  response => response,
  async (error) => {
    if (error.response?.status === 401) {
      // try refresh
      try {
        const { data } = await axios.post('/auth/refresh', {
          refreshToken: localStorage.getItem('refreshToken')
        });
        localStorage.setItem('accessToken', data.accessToken);
        // retry original request
        error.config.headers.Authorization = `Bearer ${data.accessToken}`;
        return apiClient(error.config);
      } catch {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Usage
const users = await apiClient.get('/users');
const created = await apiClient.post('/users', { name: 'Renu' });
const updated = await apiClient.put(`/users/${id}`, data);
await apiClient.delete(`/users/${id}`);
```

---

# Part 9: Testing

## Q24. Testing Code — Backend (JUnit + Mockito)

```java
// Service unit test
@ExtendWith(MockitoExtension.class)
class AuthServiceTest {
    
    @Mock
    private AuthUserRepository repository;
    
    @Mock
    private PasswordEncoder passwordEncoder;
    
    @Mock
    private JwtService jwtService;
    
    @InjectMocks
    private AuthService authService;
    
    @Test
    @DisplayName("Login with valid credentials returns token")
    void login_withValidCredentials_returnsToken() {
        // GIVEN
        String email = "renu@example.com";
        String rawPassword = "Password@123";
        String hashedPassword = "$2a$10$...";
        
        AuthUser user = AuthUser.builder()
            .userId(1L)
            .email(email)
            .password(hashedPassword)
            .enabled(true)
            .build();
        
        when(repository.findByEmail(email)).thenReturn(Optional.of(user));
        when(passwordEncoder.matches(rawPassword, hashedPassword)).thenReturn(true);
        when(jwtService.generateToken(user)).thenReturn("jwt.token.here");
        
        // WHEN
        AuthResponse response = authService.login(new LoginRequest(email, rawPassword));
        
        // THEN
        assertNotNull(response);
        assertEquals("jwt.token.here", response.getAccessToken());
        verify(repository, times(1)).findByEmail(email);
        verify(jwtService).generateToken(user);
    }
    
    @Test
    @DisplayName("Login with wrong password throws BadCredentialsException")
    void login_withWrongPassword_throws() {
        when(repository.findByEmail(anyString()))
            .thenReturn(Optional.of(new AuthUser()));
        when(passwordEncoder.matches(anyString(), anyString())).thenReturn(false);
        
        assertThrows(BadCredentialsException.class, () -> 
            authService.login(new LoginRequest("a@b.com", "wrong"))
        );
    }
    
    @Test
    @Disabled("Pending email service mock — will enable after EmailService refactor")
    void register_sendsVerificationEmail() {
        // This test is temporarily skipped
    }
    
    @ParameterizedTest
    @ValueSource(strings = {"", " ", "invalid", "no-at-sign.com"})
    @DisplayName("Login rejects invalid email formats")
    void login_rejectsInvalidEmails(String invalidEmail) {
        assertThrows(IllegalArgumentException.class, () ->
            authService.login(new LoginRequest(invalidEmail, "password"))
        );
    }
    
    @BeforeEach
    void setUp() {
        // Runs before each test
    }
    
    @AfterEach
    void tearDown() {
        // Runs after each test
    }
}

// Controller integration test
@SpringBootTest
@AutoConfigureMockMvc
class AuthControllerTest {
    
    @Autowired
    private MockMvc mockMvc;
    
    @Autowired
    private ObjectMapper objectMapper;
    
    @Test
    void register_validRequest_returns201() throws Exception {
        RegisterRequest req = RegisterRequest.builder()
            .email("new@example.com")
            .password("Password@123")
            .fullName("Test User")
            .build();
        
        mockMvc.perform(post("/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.email").value("new@example.com"));
    }
    
    @Test
    void register_invalidEmail_returns400() throws Exception {
        RegisterRequest req = RegisterRequest.builder()
            .email("not-an-email")
            .password("Password@123")
            .build();
        
        mockMvc.perform(post("/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.errors.email").exists());
    }
}
```

## Q25. JUnit @Disabled Annotation

`@Disabled` skips a test (with optional reason).

```java
class MyTests {
    
    @Test
    @Disabled("Bug #123: skipping until issue resolved")
    void brokenTest() {
        // not executed
    }
    
    @Disabled  // skip whole class
    @Test
    void allTestsInThisClassSkipped() { }
    
    // Conditional disable
    @Test
    @DisabledOnOs(OS.WINDOWS)
    void doesntRunOnWindows() { }
    
    @Test
    @DisabledOnJre(JRE.JAVA_8)
    void requiresJava11Plus() { }
    
    @Test
    @DisabledIfEnvironmentVariable(named = "CI", matches = "true")
    void onlyLocalDev() { }
}
```

**Key JUnit 5 annotations:**

| Annotation | Purpose |
|---|---|
| `@Test` | Mark test method |
| `@DisplayName` | Custom test name |
| `@BeforeEach` | Run before each test |
| `@AfterEach` | Run after each test |
| `@BeforeAll` | Run once before all tests (static) |
| `@AfterAll` | Run once after all tests (static) |
| `@Disabled` | Skip test |
| `@Tag` | Categorize tests |
| `@RepeatedTest` | Run multiple times |
| `@ParameterizedTest` | Run with different inputs |
| `@Nested` | Group related tests |
| `@Timeout` | Fail if exceeds time |

---

# Part 10: JWT Authentication & Authorization

## Q26. JWT Authentication vs Authorization

| | Authentication | Authorization |
|---|---|---|
| Question | Who are you? | What can you do? |
| When | Login | Every request |
| Result | Identity confirmed (JWT issued) | Access granted/denied |
| In JWT | `sub` claim (user ID) | `roles`/`scopes` claim |
| Spring | `AuthenticationManager` | `@PreAuthorize` |

## Q27. JWT Interview Questions & Answers

### Q: What is JWT?
**A:** JSON Web Token — a compact, URL-safe, self-contained token format for securely transmitting information. Three parts: Header.Payload.Signature, separated by dots.

### Q: How does JWT work?
**A:** 
1. User logs in with credentials
2. Server validates and generates JWT signed with secret
3. Client stores JWT (localStorage/cookie)
4. Client sends JWT in `Authorization: Bearer <token>` header
5. Server verifies signature on each request
6. If valid, processes request; if not, returns 401

### Q: How do you secure JWT?
**A:**
- Strong secret (256+ bits)
- Short expiration (15 min for access token)
- Use HTTPS only
- Use `httpOnly` cookies (prevents XSS)
- Implement refresh tokens
- Validate issuer (`iss`) and audience (`aud`)
- Don't store sensitive data in payload (it's base64, not encrypted!)

### Q: Why JWT over Sessions?
**A:** Stateless — works in microservices without shared session store. Each service can validate independently using the secret.

### Q: What are JWT vulnerabilities?
**A:**
- **alg=none attack:** attacker changes algo to "none" → no signature check
- **Weak secret:** brute force HMAC
- **XSS in localStorage:** steal token via JavaScript
- **Token replay:** until expiry, stolen token works
- **Information disclosure:** payload is base64, anyone can decode

### Q: Access Token vs Refresh Token?
**A:**

| | Access Token | Refresh Token |
|---|---|---|
| Lifespan | Short (15 min) | Long (7 days) |
| Sent on | Every API request | Only to /refresh endpoint |
| Storage | Memory or localStorage | HttpOnly cookie (best) |
| If stolen | Damage limited (short life) | Major issue |

### Q: How to logout with JWT?
**A:** Three approaches:
1. **Client-side only:** delete from localStorage (simple, but token still valid until expiry)
2. **Token blacklist:** maintain Redis set of revoked tokens, check on every request
3. **Short-lived tokens:** rely on expiry + revoke refresh token

### Q: Where to store JWT in browser?

| Option | XSS Safe | CSRF Safe | Use Case |
|---|---|---|---|
| localStorage | ❌ | ✅ | Easy, but XSS vulnerable |
| sessionStorage | ❌ | ✅ | Tab-scoped |
| HttpOnly Cookie | ✅ | ❌ (need CSRF token) | Best for production |
| Memory variable | ✅ | ✅ | Lost on refresh |

### Q: SkillSync's JWT implementation?
**A:** 
- Algorithm: HS512
- Access token expiry: 15 minutes
- Refresh token expiry: 7 days
- Storage: localStorage (acknowledged limitation)
- Validation: API Gateway validates and injects `X-User-Id`, `X-User-Role` headers
- Public endpoints: `/auth/login`, `/auth/register` skip validation
- Refresh flow: Axios interceptor on 401 → refresh → retry original request

```java
// JWT generation in SkillSync
public String generateToken(AuthUser user) {
    Map<String, Object> claims = Map.of(
        "userId", user.getUserId(),
        "email", user.getEmail(),
        "role", user.getRole().name()
    );
    
    return Jwts.builder()
        .setClaims(claims)
        .setSubject(user.getUserId().toString())
        .setIssuedAt(new Date())
        .setExpiration(new Date(System.currentTimeMillis() + 900_000)) // 15 min
        .signWith(SignatureAlgorithm.HS512, secret)
        .compact();
}

// JWT validation in API Gateway
public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
    String token = extractToken(exchange.getRequest());
    
    Claims claims = Jwts.parser()
        .setSigningKey(secret)
        .parseClaimsJws(token)
        .getBody();
    
    // Inject headers for downstream services
    ServerHttpRequest mutated = exchange.getRequest().mutate()
        .header("X-User-Id", claims.get("userId").toString())
        .header("X-User-Role", claims.get("role").toString())
        .build();
    
    return chain.filter(exchange.mutate().request(mutated).build());
}
```

---

<div class="remember" style="text-align: center; font-size: 12pt; padding: 15mm;">

**You have answers to every asked question.**

Read each Q out loud. Explain to a mirror. Trace each code example with your finger.

The interviewer wants confidence + clarity, not perfection.

</div>
