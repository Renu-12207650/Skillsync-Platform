<div class="cover">

# SkillSync Interview Quick Reference

<div class="divider"></div>

<div class="subtitle">Memory Cards · Comparison Tables · Visual Cheat Sheets</div>

<div class="author">JWT Anatomy · Trap Questions · One-Page Summaries</div>

</div>

# 1. JWT Anatomy — The Three Parts

## JWT Structure Visual

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9
.
eyJzdWIiOiIxMjMiLCJuYW1lIjoiUmVudSJ9
.
SflKxwRJSMeKKF2QT4fwpMe...

[HEADER] . [PAYLOAD] . [SIGNATURE]
  Base64Url   Base64Url    Base64Url
```

## The Three Parts Table

| Aspect | HEADER | PAYLOAD | SIGNATURE |
|---|---|---|---|
| **Position** | 1st (before first dot) | 2nd (between dots) | 3rd (after second dot) |
| **Content** | Algorithm + Type | Claims (data) | Verification hash |
| **Example** | `{"alg":"HS256","typ":"JWT"}` | `{"sub":"123","role":"ADMIN"}` | HMACSHA256(header.payload, secret) |
| **Readable?** | ✅ Yes | ✅ Yes | ❌ Needs secret |
| **Changeable?** | ❌ Breaks signature | ❌ Breaks signature | N/A (this IS security) |
| **Interview Trap** | alg=none attack | Don't put secrets here | Min 256-bit secret |

## JWT Algorithms

| Algo | Type | Use When |
|---|---|---|
| HS256 | Shared secret | Microservices sharing secret |
| HS512 | Shared secret | Higher security (SkillSync default) |
| RS256 | Key pair | Third parties need public key |

## JWT vs Session

| Aspect | Session | JWT |
|---|---|---|
| Storage | Server (Redis) | Client (localStorage) |
| Scaling | Sticky sessions | Any server validates |
| Logout | Instant delete | Wait for expiry/blacklist |
| CSRF | Vulnerable | Safe (header, not cookie) |
| XSS | Safe (httpOnly) | Vulnerable (localStorage) |
| Size | 32 bytes | ~500 bytes |
| Best For | Monoliths | Microservices |

---

# 2. Java Core — Memory Cards

## == vs .equals() vs hashCode()

| | == | .equals() | hashCode() |
|---|---|---|---|
| Compares | Reference (address) | Content | Integer for buckets |
| Primitives | Value | N/A | N/A |
| Objects | Identity | Content (if overridden) | Hash bucket finder |
| String Pool | "abc"=="abc" true | Always use this! | Equal content → equal hash |

**THE CONTRACT:** If `a.equals(b)` → then `a.hashCode()==b.hashCode()`

## final vs finally vs finalize()

| | final | finally | finalize() |
|---|---|---|---|
| What | Keyword | Block | Method (deprecated) |
| Purpose | Lock/unchangeable | Always runs cleanup | Pre-GC hook |
| Remember | "Locked forever" | "Always runs" | "Final farewell" |

## Checked vs Unchecked

| | Checked | Unchecked |
|---|---|---|
| Extends | Exception (not Runtime) | RuntimeException |
| Examples | IOException, SQLException | NullPointerException |
| Compiler | Forces catch/declare | Optional |
| Means | Recoverable | Bug in code |

---

# 3. Collections Quick Ref

## List Comparison

| | ArrayList | LinkedList | Vector |
|---|---|---|---|
| Get index | O(1) | O(n) | O(1) |
| Add end | O(1)* | O(1) | O(1)* |
| Add middle | O(n) | O(1) | O(n) |
| Thread-safe | ❌ | ❌ | ✅ |
| Use when | Random access | Frequent insert/delete | Legacy only |

## Map Comparison

| | HashMap | LinkedHashMap | TreeMap | ConcurrentHashMap |
|---|---|---|---|---|
| Order | None | Insertion | Sorted | None |
| Null key | 1 | 1 | ❌ | ❌ |
| Thread-safe | ❌ | ❌ | ❌ | ✅ |
| Performance | O(1) | O(1) | O(log n) | O(1) |
| Lock level | N/A | N/A | N/A | Bucket-level |

**HashMap Internals:** 16 buckets, 0.75 load factor, chain→tree at 8 items

## String vs StringBuilder vs StringBuffer

| | String | StringBuilder | StringBuffer |
|---|---|---|---|
| Mutable | ❌ No | ✅ Yes | ✅ Yes |
| Thread-safe | ✅ (immutable) | ❌ No | ✅ Yes |
| Speed | N/A | Fast | Slower |
| Use for | Constants | Single-thread concat | Multi-thread concat |

---

# 4. Spring Boot Quick Ref

## Bean Scopes

| Scope | Instances | Use For |
|---|---|---|
| singleton | 1 per container | Most services |
| prototype | New each request | Stateful objects |
| request | 1 per HTTP request | Per-request data |
| session | 1 per user session | User-scoped data |

## DI Types

| Type | Pros | Cons | Use When |
|---|---|---|---|
| Constructor | Immutable, testable | Verbose | **Default** |
| Setter | Optional | Mutable, forgettable | Optional deps |
| Field | Less code | Hard to test | Avoid |

## Key Annotations

| Annotation | Combines | Purpose |
|---|---|---|
| @SpringBootApplication | @Configuration + @EnableAutoConfiguration + @ComponentScan | App entry |
| @RestController | @Controller + @ResponseBody | JSON API |
| @Service | @Component | Business logic |
| @Repository | @Component + exception translation | Data access |

## @Transactional Gotchas

1. **Self-invocation bypasses proxy** — split to another bean
2. **Checked exceptions don't rollback** — use `rollbackFor=Exception.class`
3. **Private methods not transactional** — must be public
4. **Propagation:** REQUIRED (default), REQUIRES_NEW, NESTED

---

# 5. SQL Visual Guide

## Joins Diagram

```
INNER JOIN (A ∩ B)     LEFT JOIN (A + match)     RIGHT JOIN (B + match)
    ●●●                  ●●●○○                    ○○●●●

FULL OUTER (A ∪ B)     CROSS JOIN (A × B)
    ●●●●●                Every row A × Every row B
```

## Join Types Table

| Join | Returns | Use When |
|---|---|---|
| INNER | Matching rows only | Only want complete data |
| LEFT | All left + matched right | Need all left, right optional |
| RIGHT | All right + matched left | Reverse of LEFT (rare) |
| FULL | All from both | Need complete set |
| CROSS | Cartesian product | Generate combinations |
| SELF | Table joined to itself | Hierarchies |

## ACID Properties

| Letter | Property | Example |
|---|---|---|
| A | Atomicity | Debit + credit both succeed or both fail |
| C | Consistency | Constraints never violated |
| I | Isolation | Concurrent transactions don't interfere |
| D | Durability | Committed data survives crash |

> Remember: "A Crash Is Drama-free"

## Isolation Levels

| Level | Dirty Read | Non-Repeatable | Phantom | Default |
|---|---|---|---|---|
| READ UNCOMMITTED | ❌ Allowed | ❌ Allowed | ❌ Allowed | Never |
| READ COMMITTED | ✅ Blocked | ❌ Allowed | ❌ Allowed | Oracle, PG |
| REPEATABLE READ | ✅ Blocked | ✅ Blocked | ❌ Allowed | MySQL |
| SERIALIZABLE | ✅ Blocked | ✅ Blocked | ✅ Blocked | Critical data |

---

# 6. JavaScript — The Weird Parts

## var vs let vs const

| | var | let | const |
|---|---|---|---|
| Scope | Function | Block | Block |
| Hoisting | Yes (undefined) | Yes (TDZ) | Yes (TDZ) |
| Redeclare | ✅ | ❌ | ❌ |
| Reassign | ✅ | ✅ | ❌ |
| Use | Never | When needed | **Default** |

## == vs ===

| | == | === |
|---|---|---|
| Name | Loose equality | Strict equality |
| Types | Coerces ("5" == 5) | Must match |
| Use | ❌ Never | ✅ Always |

## this Binding

| Context | this refers to |
|---|---|
| Global | window (undefined in strict) |
| Function call | window/undefined |
| Method call | The object |
| Constructor | New instance |
| Arrow function | Enclosing scope |
| call/apply/bind | First argument |

## Event Loop Order

```
1. Run call stack
2. Drain microtasks (Promises)
3. Run one macrotask (setTimeout)
4. Repeat
```

**Output:**
```js
console.log(1);
setTimeout(() => console.log(2), 0);
Promise.resolve().then(() => console.log(3));
console.log(4);
// 1, 4, 3, 2
```

---

# 7. React Hooks at a Glance

## All Built-in Hooks

| Hook | Purpose | Key Point |
|---|---|---|
| useState | Persistent state | Never mutate directly |
| useEffect | Side effects | Cleanup in return |
| useContext | Consume context | No prop drilling |
| useReducer | Complex state | Like Redux lite |
| useCallback | Memoized function | For child props |
| useMemo | Memoized value | Expensive calculations |
| useRef | Mutable reference | DOM access, prev value |
| useId | Stable unique ID | React 18+ |
| useTransition | Non-urgent updates | Keep UI responsive |
| useDeferredValue | Defer re-render | Stale value for slow children |

## useEffect Dependencies

| Deps | Runs When |
|---|---|
| Omitted | Every render |
| [] | Once on mount |
| [a, b] | On mount + when a or b changes |

## useMemo vs useCallback

```js
useMemo(() => computeExpensive(a), [a]);  // Cache result
useCallback(() => doSomething(a), [a]);   // Cache function
// Equivalent: useCallback(fn, deps) === useMemo(() => fn, deps)
```

---

# 8. System Design Decisions

## Tech Stack Choices

| Choice | Why This | Why Not Others |
|---|---|---|
| Spring Boot | Mature, huge ecosystem | Quarkus (less hiring) |
| JWT | Stateless microservices | Sessions (shared store bottleneck) |
| BCrypt | Adaptive, battle-tested | MD5/SHA (fast=crackable) |
| RabbitMQ | Smart broker, easy DLQ | Kafka (overkill), Redis (no persist) |
| React | Biggest ecosystem | Angular (steeper curve) |
| Vite | Fast HMR, modern | CRA (deprecated) |
| MySQL | Familiar, ubiquitous | PostgreSQL (better, but less familiar) |

## Monolith vs Microservices

| | Monolith | Microservices |
|---|---|---|
| Deploy | One artifact | Many |
| Scale | All or nothing | Per-service |
| Complexity | Code | Operational |
| Transactions | Easy (ACID) | Hard (Saga) |
| Teams | Single team | Multiple teams |
| Best for | Small teams | Large org |

---

# 9. Interview Trap Questions

## Trap 1: String Pool
```java
String a = "abc";
String b = "abc";
String c = new String("abc");
a == b;      // true (same pool reference)
a == c;      // false (new object)
a.equals(c); // true (content)
```
> Ask: "What's the output and why?"

## Trap 2: volatile ++
```java
volatile int count = 0;
count++;  // NOT thread-safe! Read-modify-write
// Use AtomicInteger instead
```

## Trap 3: HashMap equals only
```java
// Override equals but NOT hashCode
Set<User> set = new HashSet<>();
set.add(userA);
set.contains(userB);  // false even if equals true!
```

## Trap 4: this in inner class
```java
class Outer {
    void method() {
        Runnable r = () -> {
            // this refers to Outer! (lexical)
        };
        Runnable r2 = new Runnable() {
            public void run() {
                // this refers to anonymous Runnable
            }
        };
    }
}
```

## Trap 5: Promise order
```js
Promise.resolve(1)
  .then(x => { console.log(x); return x + 1; })
  .then(x => console.log(x));
// Output: 1, 2 (chaining works)
```

## Trap 6: useEffect with object deps
```js
useEffect(() => {}, [{id: 1}]);  // Runs every render!
// Object is new reference each time
```

---

# 10. One-Page Full-Stack Flow

## Login Request Journey

```
[Browser] Enter credentials
    ↓
[React] LoginForm onSubmit
    axios.post('/auth/login', {email, password})
    ↓
[Axios Interceptor] Attach base URL
    ↓
[Gateway :8888] Route to auth-service
    Skip JWT filter (public endpoint)
    ↓
[Auth Service :8081]
    AuthController.login()
    ↓
    AuthService.authenticate()
    ↓
    AuthenticationManager
    ↓
    UserDetailsService + BCrypt check
    ↓
    JwtService.generateToken()
    ↓
[Response] {accessToken, refreshToken, user}
    ↓
[Axios Interceptor] Store in localStorage
    ↓
[React AuthContext] setUser(), navigate('/dashboard')
    ↓
[Subsequent Requests]
    Authorization: Bearer <accessToken>
    ↓
[Gateway] Validate JWT signature
    Inject X-User-Id, X-User-Role headers
    ↓
[Target Service] Process with user context
```

---

<div class="remember" style="text-align: center; font-size: 12pt; padding: 15mm;">

**Quick Review Tips:**

1. Read tables aloud — hearing reinforces memory
2. Explain concepts to an imaginary interviewer
3. Trace through code with finger/pen
4. If stuck, think "What would break?"

You've prepared. Now execute.

</div>
