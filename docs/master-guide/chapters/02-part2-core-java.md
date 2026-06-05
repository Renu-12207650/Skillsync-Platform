<div class="part-divider">
<div class="part-label">Part II</div>
<div class="part-title">Core Java</div>
<div class="part-desc">Java is the foundation of the SkillSync backend. This part covers everything from the JVM architecture to the subtleties of equals() and hashCode(). We assume you know what variables and loops are; we teach you how Java actually works under the hood.</div>
</div>

# 4. The Java Platform (JVM, JRE, JDK)

<span class="chapter-label">Chapter 4</span>

## 4.1 The three pillars

| Component | What it is | Contains |
|---|---|---|
| **JDK** (Java Development Kit) | The full toolkit for developers | JRE + compiler (`javac`) + debugger + tools |
| **JRE** (Java Runtime Environment) | What's needed to RUN Java | JVM + standard libraries (`rt.jar`) |
| **JVM** (Java Virtual Machine) | The engine that executes bytecode | Class loader, bytecode verifier, interpreter, JIT compiler, GC |

**Rule:** To develop, install JDK. To deploy, JRE is enough (though modern practice often ships the JVM with the app via jlink or containers).

## 4.2 Write once, run anywhere

Java source (`.java`) → `javac` → **bytecode** (`.class`) → JVM interprets/JIT-compiles → native machine code.

The JVM is platform-specific (Windows JVM ≠ Linux JVM ≠ macOS JVM), but your `.class` files are universal. This is the "write once, run anywhere" promise.

## 4.3 The JVM memory model (simplified)

```
┌─────────────────────────────────────────┐
│           JVM Memory                    │
├─────────────────────────────────────────┤
│  Heap          │  Stack (per thread)    │
│  - Objects     │  - Local variables       │
│  - Arrays      │  - Method calls          │
│  - Shared      │  - Primitive values      │
│                │  - Object references     │
├────────────────┼─────────────────────────┤
│  Metaspace     │  (was PermGen pre-Java8)│
│  - Class info  │                         │
│  - Static vars │                         │
├────────────────┴─────────────────────────┤
│  Code Cache (JIT compiled native code)   │
└─────────────────────────────────────────┘
```

- **Heap**: Where all objects live. Garbage collected. Divided into Young (Eden, Survivor) and Old generations.
- **Stack**: Each thread gets its own stack. Method calls push frames; returns pop them. Very fast allocation/deallocation.
- **Metaspace**: Class metadata. Grows automatically (unlike the fixed PermGen in old Java).

> Remember: "Heap = objects, shared. Stack = local vars, per-thread."

## 4.4 The JIT compiler

The JVM starts by **interpreting** bytecode (slow). It profiles which methods run hot and **JIT-compiles** them to native machine code (fast). The compiled code lives in the Code Cache. This is why Java can approach C++ performance for long-running services.

---

# 5. Data Types, Variables & Operators

<span class="chapter-label">Chapter 5</span>

## 5.1 Primitive types

| Type | Size | Default | Range | Wrapper |
|---|---|---|---|---|
| `byte` | 8-bit | 0 | -128 to 127 | `Byte` |
| `short` | 16-bit | 0 | -32,768 to 32,767 | `Short` |
| `int` | 32-bit | 0 | ~±2 billion | `Integer` |
| `long` | 64-bit | 0L | ~±9 quintillion | `Long` |
| `float` | 32-bit | 0.0f | IEEE 754 | `Float` |
| `double` | 64-bit | 0.0d | IEEE 754 | `Double` |
| `char` | 16-bit | '\u0000' | 0 to 65,535 (Unicode) | `Character` |
| `boolean` | JVM-dependent | `false` | `true` or `false` | `Boolean` |

**Why so many integer types?** Memory efficiency. A `byte[]` uses 8x less memory than `int[]` for the same logical data. In SkillSync's JWT handling, we use `byte[]` for the secret key.

## 5.2 Reference types

Everything that's not a primitive is a **reference type**: classes, interfaces, arrays, enums, annotations.

```java
String name = "Renu";           // reference to String object
int[] scores = {90, 85, 92};    // reference to array object
AuthUser user = new AuthUser(); // reference to AuthUser object
```

Variables hold either the primitive value directly, or a **reference** (memory address) to the object.

## 5.3 Type conversion

**Widening** (implicit, safe): `byte → short → int → long → float → double`

**Narrowing** (explicit, may lose data):
```java
long big = 100L;
int small = (int) big;  // cast required
```

**Autoboxing/Unboxing:** Automatic conversion between primitives and wrappers.
```java
Integer boxed = 42;     // autoboxing
int unboxed = boxed;    // unboxing
```

⚠️ Pitfall: `==` on wrappers compares references, not values. Always use `.equals()` for value comparison.

## 5.4 Operators

| Category | Operators |
|---|---|
| Arithmetic | `+ - * / % ++ --` |
| Relational | `== != < > <= >=` |
| Logical | `&& || !` |
| Bitwise | `& | ^ ~ << >> >>>` |
| Assignment | `= += -= *= /= %=` |
| Ternary | `?:` |
| Instanceof | `instanceof` |

**Short-circuit evaluation:**
```java
if (user != null && user.isActive())  // if user is null, second part never evaluated
if (list != null && !list.isEmpty())   // safe null check pattern
```

---

# 6. Control Flow

<span class="chapter-label">Chapter 6</span>

## 6.1 Conditionals

```java
if (score >= 90) {
    grade = 'A';
} else if (score >= 80) {
    grade = 'B';
} else {
    grade = 'C';
}

// Ternary
String result = (score >= 60) ? "Pass" : "Fail";

// Switch (Java 14+ enhanced switch)
String dayName = switch (dayNumber) {
    case 1 -> "Monday";
    case 2 -> "Tuesday";
    case 7 -> "Sunday";
    default -> throw new IllegalArgumentException("Invalid day");
};
```

## 6.2 Loops

```java
// For loop
for (int i = 0; i < 10; i++) {
    System.out.println(i);
}

// Enhanced for (foreach)
for (String name : names) {
    System.out.println(name);
}

// While
while (iterator.hasNext()) {
    process(iterator.next());
}

// Do-while (guarantees one execution)
do {
    input = scanner.nextLine();
} while (!input.equals("quit"));
```

## 6.3 Loop control

- `break` — exit the loop immediately
- `continue` — skip to next iteration
- Labeled breaks (rarely needed):
```java
outer: for (int i = 0; i < 3; i++) {
    for (int j = 0; j < 3; j++) {
        if (matrix[i][j] == target) {
            break outer;  // exits both loops
        }
    }
}
```

---

# 7. Object-Oriented Programming

<span class="chapter-label">Chapter 7</span>

## 7.1 The four pillars

| Pillar | What it means | Java mechanism | SkillSync example |
|---|---|---|---|
| **Encapsulation** | Hide internal state, expose controlled interface | Private fields + public getters/setters | `AuthUser` hides `passwordHash`, exposes `setPassword()` that hashes |
| **Inheritance** | Acquire behavior from parent class | `extends` | `class CustomUserDetails implements UserDetails` |
| **Polymorphism** | Same interface, different implementations | Method overriding, interfaces | `PasswordEncoder` interface — BCrypt, Argon2, PBKDF2 all implement |
| **Abstraction** | Hide complexity, show essentials | Abstract classes, interfaces | `JpaRepository<T, ID>` — you declare methods, Spring implements |

## 7.2 Classes and objects

```java
public class User {
    // Fields (state)
    private Long id;
    private String email;
    private String passwordHash;
    
    // Constructor
    public User(String email, String password) {
        this.email = email;
        this.setPassword(password);  // delegate to setter for validation
    }
    
    // Methods (behavior)
    public void setPassword(String plain) {
        this.passwordHash = BCrypt.hashpw(plain, BCrypt.gensalt());
    }
    
    public boolean checkPassword(String plain) {
        return BCrypt.checkpw(plain, this.passwordHash);
    }
}
```

## 7.3 The constructor chain

```java
public class AuthUser {
    private final String email;
    private final String password;
    
    public AuthUser(String email, String password) {
        this.email = email;
        this.password = password;
    }
    
    // Delegating constructor
    public AuthUser(RegisterRequest req) {
        this(req.getEmail(), req.getPassword());  // calls above
    }
}
```

## 7.4 Static vs instance

```java
public class MathUtils {
    public static final double PI = 3.14159;           // one copy, shared
    
    public static double circleArea(double r) {         // no "this" reference
        return PI * r * r;
    }
    
    private double lastResult;                          // per-instance
    
    public double getLastResult() {                     // instance method
        return this.lastResult;
    }
}

// Usage:
double area = MathUtils.circleArea(5.0);  // no object needed
MathUtils utils = new MathUtils();
double result = utils.getLastResult();    // needs object
```

---

# 8. Access Modifiers & Packages

<span class="chapter-label">Chapter 8</span>

## 8.1 The four access levels

| Modifier | Same class | Same package | Subclass | Anywhere |
|---|---|---|---|---|
| `public` | ✅ | ✅ | ✅ | ✅ |
| `protected` | ✅ | ✅ | ✅ | ❌ |
| *(default/package-private)* | ✅ | ✅ | ❌ | ❌ |
| `private` | ✅ | ❌ | ❌ | ❌ |

## 8.2 Design principle: encapsulate

```java
public class BankAccount {
    private double balance;        // NOBODY touches this directly
    
    public void deposit(double amount) {
        if (amount <= 0) throw new IllegalArgumentException();
        this.balance += amount;
    }
    
    public void withdraw(double amount) {
        if (amount > balance) throw new InsufficientFundsException();
        this.balance -= amount;
    }
    
    public double getBalance() {     // read-only access
        return balance;
    }
}
```

This prevents invalid states. Direct field access (`account.balance = -1000`) would be a bug waiting to happen.

## 8.3 Packages and imports

```java
package in.skillsync.auth.service;  // declares package

import java.util.List;              // import single class
import java.util.*;                  // import whole package
import static java.lang.Math.PI;     // static import

public class AuthService {
    double circumference = 2 * PI * radius;  // uses static import
}
```

**Package naming convention:** Reverse domain name: `com.company.project.module`.

---

# 9. Strings, StringBuilder, StringBuffer

<span class="chapter-label">Chapter 9</span>

## 9.1 String immutability

```java
String s = "Hello";
s = s + " World";  // s now points to a NEW String object
```

The original "Hello" still exists in the String pool until GC'd. This is **immutable** — cannot change after creation.

**Why immutable?**
- Thread-safe (no synchronization needed)
- Hash codes can be cached (makes `HashMap<String, X>` fast)
- Security (can't alter a string after validation)

## 9.2 String pool

```java
String a = "Hello";              // created in pool
String b = "Hello";              // reuses pool reference
String c = new String("Hello");  // new object on heap

System.out.println(a == b);      // true (same reference)
System.out.println(a == c);      // false (different objects)
System.out.println(a.equals(c)); // true (same content)
```

> Remember: "`==` on Strings compares memory address. `.equals()` compares content." Use `.equals()` always for string comparison.

## 9.3 StringBuilder vs StringBuffer

| | StringBuilder | StringBuffer |
|---|---|---|
| Thread-safe | ❌ No | ✅ Yes (synchronized) |
| Speed | Fast | Slower |
| Use when | Single thread | Multiple threads modifying same builder |

```java
// In a tight loop, StringBuilder saves memory churn
StringBuilder sb = new StringBuilder();
for (String part : parts) {
    sb.append(part).append(" ");
}
String result = sb.toString();
```

Java compiler automatically converts `+` concatenation in loops to `StringBuilder` since Java 5, but explicit control is clearer.

---

# 10. Exception Handling

<span class="chapter-label">Chapter 10</span>

## 10.1 The exception hierarchy

```
Throwable
├── Error (unchecked, don't catch)
│   ├── OutOfMemoryError
│   ├── StackOverflowError
│   └── ...
└── Exception
    ├── RuntimeException (unchecked)
    │   ├── NullPointerException
    │   ├── IllegalArgumentException
    │   ├── IndexOutOfBoundsException
    │   └── ...
    └── *(other checked exceptions)*
        ├── IOException
        ├── SQLException
        └── ...
```

## 10.2 Checked vs Unchecked

| | Checked | Unchecked |
|---|---|---|
| Compile-time enforcement | ✅ Must catch or declare | ❌ Optional |
| Represents | Recoverable conditions | Programming bugs |
| Examples | `IOException`, `SQLException` | `NullPointerException`, `IllegalArgumentException` |

Spring philosophy: Wrap checked exceptions into runtime (`DataAccessException`, `CustomServiceException`). Cleaner code, no `throws` boilerplate.

## 10.3 The try-catch-finally structure

```java
try {
    // Code that might throw
    processFile(file);
} catch (FileNotFoundException e) {
    // Specific handler
    log.error("File not found: {}", file, e);
    throw new ServiceException("Cannot process", e);
} catch (IOException e) {
    // General handler
    log.error("IO error", e);
} finally {
    // Always executes (except System.exit or JVM crash)
    closeQuietly(stream);
}
```

## 10.4 Try-with-resources (Java 7+)

Auto-closes resources that implement `AutoCloseable`:

```java
try (Connection conn = dataSource.getConnection();
     PreparedStatement ps = conn.prepareStatement(SQL)) {
    // use conn and ps
} catch (SQLException e) {
    // both conn and ps auto-closed here
}
```

No `finally` block needed for cleanup.

## 10.5 Creating custom exceptions

```java
public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String resource, Long id) {
        super(String.format("%s with id %d not found", resource, id));
    }
}

// Usage
User user = repo.findById(id)
    .orElseThrow(() -> new ResourceNotFoundException("User", id));
```

SkillSync defines custom exceptions in `skillsync-common` for consistent error handling across all services.

---

# 11. Generics

<span class="chapter-label">Chapter 11</span>

## 11.1 The problem generics solve

Before generics:
```java
List names = new ArrayList();
names.add("Alice");
String name = (String) names.get(0);  // cast needed, unsafe
```

With generics:
```java
List<String> names = new ArrayList<>();
names.add("Alice");
String name = names.get(0);  // no cast, compile-time type safety
```

## 11.2 Generic classes

```java
public class ApiResponse<T> {
    private T data;
    private String error;
    
    public static <T> ApiResponse<T> success(T data) {
        ApiResponse<T> r = new ApiResponse<>();
        r.data = data;
        return r;
    }
}

// Usage
ApiResponse<User> userResp = ApiResponse.success(user);
ApiResponse<List<Skill>> skillsResp = ApiResponse.success(skills);
```

## 11.3 Generic methods

```java
public <T> T findById(Long id, Class<T> entityClass) {
    return em.find(entityClass, id);
}

// Usage
User u = findById(1L, User.class);
Skill s = findById(2L, Skill.class);
```

## 11.4 Bounds

```java
// Upper bound: T must be Number or subclass
public double sum(List<? extends Number> numbers) {
    return numbers.stream().mapToDouble(Number::doubleValue).sum();
}

// Lower bound: ? super Integer accepts Integer, Number, Object
public void addIntegers(List<? super Integer> list) {
    list.add(42);
}
```

## 11.5 Wildcards

| Wildcard | Meaning | Use case |
|---|---|---|
| `?` | Unknown type | When you don't care about the type |
| `? extends T` | Some subtype of T | Reading from collection |
| `? super T` | Some supertype of T | Writing to collection |

**PECS principle:** Producer Extends, Consumer Super.

---

# 12. Lambdas & Functional Interfaces

<span class="chapter-label">Chapter 12</span>

## 12.1 What is a functional interface?

An interface with exactly **one abstract method**.

```java
@FunctionalInterface
public interface Predicate<T> {
    boolean test(T t);  // single abstract method
}
```

Java provides many in `java.util.function`:

| Interface | Method | Use |
|---|---|---|
| `Predicate<T>` | `test(T)` → boolean | Filter |
| `Function<T,R>` | `apply(T)` → R | Transform |
| `Consumer<T>` | `accept(T)` → void | Side effect |
| `Supplier<T>` | `get()` → T | Provide value |
| `UnaryOperator<T>` | `apply(T)` → T | Transform same type |
| `BinaryOperator<T>` | `apply(T,T)` → T | Reduce two to one |

## 12.2 Lambda syntax

```java
// Full lambda
Predicate<String> isLong = (String s) -> { return s.length() > 10; };

// Type inference
Predicate<String> isLong = (s) -> { return s.length() > 10; };

// Single param: parens optional
Predicate<String> isLong = s -> { return s.length() > 10; };

// Single expression: return implicit, braces optional
Predicate<String> isLong = s -> s.length() > 10;

// Method reference (shorter)
Predicate<String> isEmpty = String::isEmpty;
```

## 12.3 Where lambdas shine: Collections

```java
List<String> names = users.stream()
    .filter(u -> u.isActive())           // Predicate
    .map(User::getName)                   // Function
    .sorted(Comparator.reverseOrder())    // Comparator (also functional)
    .collect(Collectors.toList());
```

## 12.4 Capturing variables

Lambdas can capture final or effectively final variables from the enclosing scope:

```java
String prefix = "User: ";
users.forEach(u -> System.out.println(prefix + u.getName()));
// prefix must not be reassigned after this
```

---

# 13. equals, hashCode, == — The Contract

<span class="chapter-label">Chapter 13</span>

## 13.1 == vs .equals()

| | `==` | `.equals()` |
|---|---|---|
| Compares | Reference (memory address) | Content |
| Primitives | Value | N/A |
| Objects | Identity | Equality (when overridden) |

```java
String a = new String("hi");
String b = new String("hi");

a == b;       // false (different objects)
a.equals(b);  // true (same content)
```

## 13.2 The equals-hashCode contract

**Rule:**
> If `a.equals(b)` is `true`, then `a.hashCode()` MUST equal `b.hashCode()`.

**Why it matters:**
Hash-based collections (`HashMap`, `HashSet`, `HashTable`) work in two steps:
1. Use `hashCode()` to find the bucket
2. Use `equals()` to find the exact match within that bucket

If you only override `equals()`, two "equal" objects land in **different buckets** → `set.contains(obj)` returns false. Bug city.

**Example of the bug:**
```java
public class User {
    private Long id;
    private String name;
    
    @Override
    public boolean equals(Object o) { /* compare id and name */ }
    // hashCode NOT overridden!
}

User a = new User(1L, "Renu");
User b = new User(1L, "Renu");
Set<User> set = new HashSet<>();
set.add(a);
set.contains(b);  // FALSE! Different hash codes → different buckets
```

## 13.3 Correct implementation

```java
@Override
public boolean equals(Object o) {
    if (this == o) return true;
    if (o == null || getClass() != o.getClass()) return false;
    User user = (User) o;
    return Objects.equals(id, user.id) && 
           Objects.equals(name, user.name);
}

@Override
public int hashCode() {
    return Objects.hash(id, name);
}
```

Or use Lombok: `@EqualsAndHashCode` generates both correctly.

## 13.4 Records (Java 14+)

Records automatically generate `equals`, `hashCode`, `toString`, getters, and the constructor:

```java
public record AuthResponse(
    String accessToken,
    String refreshToken,
    UserDTO user
) {}
```

Perfect for DTOs and immutable data carriers. Used extensively in SkillSync for API responses.

<div class="remember">Remember: "Override equals → override hashCode. Otherwise HashMap breaks silently. Lombok's @EqualsAndHashCode does both."</div>
