<div class="part-divider">
<div class="part-label">Part III</div>
<div class="part-title">Advanced Java</div>
<div class="part-desc">Core Java got you the basics. Now we dive deep: the Collections Framework (the real power of Java), the Streams API for functional data processing, concurrency for performance, I/O for real-world file handling, JDBC for databases, and the JVM's memory and garbage collection internals that separate seniors from juniors.</div>
</div>

# 14. The Collections Framework

<span class="chapter-label">Chapter 14</span>

## 14.1 The big picture

```
Iterable
└── Collection
    ├── List (ordered, allows duplicates)
    │   ├── ArrayList (dynamic array)
    │   ├── LinkedList (doubly-linked)
    │   └── Vector (legacy, synchronized)
    ├── Set (no duplicates)
    │   ├── HashSet (hash table, unordered)
    │   ├── LinkedHashSet (insertion order)
    │   └── TreeSet (sorted, red-black tree)
    └── Queue (FIFO / priority)
        ├── LinkedList
        ├── PriorityQueue (heap)
        └── ArrayDeque (resizable array)

Map (not a Collection)
├── HashMap (hash table)
├── LinkedHashMap (insertion/access order)
├── TreeMap (sorted by key)
└── Hashtable (legacy, synchronized)
```

## 14.2 List implementations compared

| | ArrayList | LinkedList | Vector |
|---|---|---|---|
| Internal | Object[] | Doubly-linked nodes | Object[] |
| Get by index | O(1) | O(n) | O(1) |
| Add at end | O(1) amortized | O(1) | O(1) |
| Add at middle | O(n) | O(1) | O(n) |
| Memory | Less overhead | More (pointers) | Same as ArrayList |
| Thread-safe | ❌ | ❌ | ✅ (synchronized) |
| Use when | Random access needed | Frequent insert/delete middle | Legacy only |

## 14.3 Set implementations compared

| | HashSet | LinkedHashSet | TreeSet |
|---|---|---|---|
| Ordering | None | Insertion order | Sorted (natural/comparator) |
| Implementation | HashMap | LinkedHashMap | Red-black tree |
| Add/Remove | O(1) | O(1) | O(log n) |
| Memory | Least | More (links) | Most (tree nodes) |
| Allows null | Yes (one) | Yes | No (in default ordering) |

## 14.4 Map implementations compared

| | HashMap | LinkedHashMap | TreeMap | Hashtable |
|---|---|---|---|---|
| Ordering | None | Insertion or access order | Sorted by key | None |
| Null key | Yes (one) | Yes | No | No |
| Null values | Yes | Yes | Yes | No |
| Thread-safe | ❌ | ❌ | ❌ | ✅ |
| Performance | O(1) | O(1) | O(log n) | O(1) but slower |
| Era | Modern | Modern | Modern | Legacy (avoid) |

## 14.5 HashMap internal working (deep dive)

**The 4-step story:**

1. **Bucket array**: Internal `Node<K,V>[]` array, default size **16**, load factor **0.75**.

2. **`put(key, value)`**:
   - Compute `hash(key)` → bucket index = `(n - 1) & hash`
   - Empty bucket → insert. Collision → chain (linked list)
   - **Java 8+**: chain length > 8 → convert to **red-black tree** (O(log n) instead of O(n))

3. **`get(key)`**: compute hash → bucket → traverse list/tree, compare with `equals()`

4. **Resize**: When `size > capacity × 0.75` → double capacity, rehash all entries

**Why load factor 0.75?** Sweet spot between space (less = wasted) and time (more = collisions).

**Why initial size 16?** Power of 2 lets bucket index use fast bitwise `&` instead of `%`.

> Remember: "16 buckets, 0.75 load, chain → tree at 8."

## 14.6 HashMap vs ConcurrentHashMap vs Hashtable

| | HashMap | Hashtable | ConcurrentHashMap |
|---|---|---|---|
| Thread-safe | ❌ | ✅ (full lock) | ✅ (segment/bucket lock) |
| Performance | Fastest | Slowest | Fast |
| Null key/value | 1 key, many values | No | No |
| Use | Single thread | Legacy only | Multi-thread modern code |

**ConcurrentHashMap advantage**: Uses CAS + synchronized on individual buckets (Java 8+). 16 threads can write to 16 different buckets simultaneously. Hashtable locks the whole map.

> Remember: "HashMap = solo. Hashtable = traffic jam. ConcurrentHashMap = multi-lane highway."

## 14.7 Iterators: fail-fast vs fail-safe

- **Fail-fast** (`ArrayList`, `HashMap`): Throws `ConcurrentModificationException` if collection modified during iteration (modCount check).
- **Fail-safe** (`ConcurrentHashMap`, `CopyOnWriteArrayList`): Works on a copy/snapshot. No exception, but may not see concurrent changes.

---

# 15. The Streams API

<span class="chapter-label">Chapter 15</span>

## 15.1 The mental model

> "Source → intermediate operations (lazy) → terminal operation (triggers execution)."

```java
List<String> names = users.stream()           // SOURCE
    .filter(u -> u.isActive())               // intermediate (lazy)
    .map(User::getName)                      // intermediate (lazy)
    .sorted()                                // intermediate (lazy)
    .collect(Collectors.toList());         // TERMINAL (executes)
```

**Key principles:**
- **Lazy**: Intermediate ops don't run until terminal op is called
- **Single-use**: A stream can be consumed only once
- **No mutation**: Streams don't modify the source

## 15.2 Common operations

| Operation | Type | Description |
|---|---|---|
| `filter(Predicate)` | Intermediate | Keep elements matching condition |
| `map(Function)` | Intermediate | Transform each element |
| `flatMap(Function)` | Intermediate | 1→many, flatten nested |
| `sorted()` / `sorted(Comparator)` | Intermediate | Sort |
| `distinct()` | Intermediate | Remove duplicates |
| `limit(n)` / `skip(n)` | Intermediate | Truncate |
| `peek(Consumer)` | Intermediate | Side effect (debugging) |
| `forEach(Consumer)` | Terminal | Iterate |
| `collect(Collector)` | Terminal | Gather into collection |
| `reduce(BinaryOperator)` | Terminal | Combine into single value |
| `anyMatch/allMatch/noneMatch` | Terminal | Boolean tests |
| `findFirst/findAny` | Terminal | Return Optional |
| `count/min/max` | Terminal | Aggregates |

## 15.3 Collectors

```java
// To collection
List<String> list = stream.collect(Collectors.toList());
Set<String> set = stream.collect(Collectors.toSet());

// Joining
String joined = stream.collect(Collectors.joining(", "));

// Grouping
Map<Role, List<User>> byRole = users.stream()
    .collect(Collectors.groupingBy(User::getRole));

// Partitioning (two groups)
Map<Boolean, List<User>> partitioned = users.stream()
    .collect(Collectors.partitioningBy(User::isActive));

// Statistics
IntSummaryStatistics stats = numbers.stream()
    .collect(Collectors.summarizingInt(Integer::intValue));
// stats.getAverage(), getMax(), getMin(), getSum(), getCount()
```

## 15.4 Parallel streams

```java
long count = hugeList.parallelStream()
    .filter(x -> isPrime(x))
    .count();
```

**When to use:** Large dataset, CPU-bound operation, stateless, no I/O during stream.

**When NOT to use:** Small data, involves I/O, requires strict ordering, uses non-thread-safe external state.

---

# 16. Multithreading & Concurrency

<span class="chapter-label">Chapter 16</span>

## 16.1 Thread vs Runnable vs Callable

```java
// Option 1: Extend Thread (rarely done)
class MyThread extends Thread {
    public void run() { /* work */ }
}

// Option 2: Implement Runnable (preferred)
Runnable task = () -> { /* work */ };
new Thread(task).start();

// Option 3: Callable (returns result, can throw)
Callable<Integer> task = () -> { return 42; };
Future<Integer> future = executor.submit(task);
Integer result = future.get();  // blocks until done
```

## 16.2 The Executor framework

Don't create threads manually. Use `ExecutorService`:

```java
// Fixed pool
ExecutorService executor = Executors.newFixedThreadPool(4);

// Submit work
Future<?> future = executor.submit(() -> processOrder(order));

// Shutdown gracefully
executor.shutdown();
executor.awaitTermination(60, TimeUnit.SECONDS);
```

## 16.3 synchronized

```java
// Method-level: locks 'this'
public synchronized void increment() { count++; }

// Block-level: lock specific object (finer control)
synchronized(lockObj) { 
    // critical section 
}
```

Guarantees: mutual exclusion, visibility, happens-before ordering.

## 16.4 volatile vs synchronized

| | `volatile` | `synchronized` |
|---|---|---|
| Visibility | ✅ | ✅ |
| Atomicity | ❌ (single ops only) | ✅ |
| Mutual exclusion | ❌ | ✅ |
| Use case | Status flags | Compound operations |

**Classic mistake:**
```java
volatile int count;
count++;   // NOT thread-safe! (read-modify-write)
```

Use `AtomicInteger` for counters:
```java
AtomicInteger count = new AtomicInteger(0);
count.incrementAndGet();  // thread-safe
```

## 16.5 ThreadLocal

Each thread gets its own copy:
```java
private static final ThreadLocal<SimpleDateFormat> dateFormat = 
    ThreadLocal.withInitial(() -> new SimpleDateFormat("yyyy-MM-dd"));

// Usage: each thread has its own formatter (SimpleDateFormat is not thread-safe)
String formatted = dateFormat.get().format(date);
```

## 16.6 CompletableFuture (modern async)

```java
CompletableFuture.supplyAsync(() -> fetchUser(id))
    .thenApply(User::getName)
    .thenAccept(System.out::println)
    .exceptionally(ex -> { 
        log.error("Failed", ex); 
        return null; 
    });
```

Combining:
```java
CompletableFuture<User> userFuture = fetchUser(id);
CompletableFuture<Order> orderFuture = fetchOrder(id);

CompletableFuture<Void> both = CompletableFuture.allOf(userFuture, orderFuture);
both.thenRun(() -> {
    User u = userFuture.join();
    Order o = orderFuture.join();
    // process both
});
```

---

# 17. File I/O and NIO

<span class="chapter-label">Chapter 17</span>

## 17.1 Classic I/O (java.io)

```java
// Reading text
try (BufferedReader reader = new BufferedReader(new FileReader("file.txt"))) {
    String line;
    while ((line = reader.readLine()) != null) {
        process(line);
    }
}

// Writing text
try (BufferedWriter writer = new BufferedWriter(new FileWriter("out.txt"))) {
    writer.write("Hello");
    writer.newLine();
}
```

## 17.2 NIO.2 (java.nio, Java 7+)

```java
Path path = Paths.get("/data", "users.txt");

// Read all lines
List<String> lines = Files.readAllLines(path);

// Read as stream
Files.lines(path).forEach(this::process);

// Write
Files.write(path, "content".getBytes());

// Copy, move, delete
Files.copy(source, target, StandardCopyOption.REPLACE_EXISTING);
Files.move(source, target);
Files.deleteIfExists(path);

// Walk directory tree
Files.walk(Paths.get("/data"))
    .filter(p -> p.toString().endsWith(".java"))
    .forEach(System.out::println);
```

## 17.3 try-with-resources

Resources are auto-closed at end:
```java
try (InputStream in = new FileInputStream("in.txt");
     OutputStream out = new FileOutputStream("out.txt")) {
    // use streams
} catch (IOException e) {
    // handle
}
// both streams closed automatically
```

---

# 18. JDBC Fundamentals

<span class="chapter-label">Chapter 18</span>

## 18.1 The seven steps

1. Load driver (optional in modern JDBC)
2. Get connection
3. Create statement
4. Execute query/update
5. Process result set
6. Clean up
7. Handle exceptions

## 18.2 Basic pattern

```java
String url = "jdbc:mysql://localhost:3306/skillsync";
try (Connection conn = DriverManager.getConnection(url, "user", "pass");
     PreparedStatement ps = conn.prepareStatement(
         "SELECT * FROM users WHERE email = ?")) {
    
    ps.setString(1, "renu@example.com");
    
    try (ResultSet rs = ps.executeQuery()) {
        while (rs.next()) {
            Long id = rs.getLong("id");
            String name = rs.getString("full_name");
        }
    }
} catch (SQLException e) {
    throw new DataAccessException("Failed to load user", e);
}
```

**Always use PreparedStatement** — prevents SQL injection, enables query plan caching.

## 18.3 Statement vs PreparedStatement vs CallableStatement

| | Statement | PreparedStatement | CallableStatement |
|---|---|---|---|
| Use | Static SQL, no params | Parameterized queries | Stored procedures |
| Security | Vulnerable to SQL injection | Safe (escaped) | Safe |
| Performance | Recompiled every time | Compiled once, cached | Compiled |

## 18.4 Transaction control

```java
try (Connection conn = dataSource.getConnection()) {
    conn.setAutoCommit(false);  // start transaction
    
    try {
        insertOrder(conn, order);
        updateInventory(conn, items);
        conn.commit();
    } catch (SQLException e) {
        conn.rollback();
        throw e;
    }
}
```

Spring's `@Transactional` automates this — you rarely write manual JDBC transactions in Spring Boot.

---

# 19. Reflection & Annotations

<span class="chapter-label">Chapter 19</span>

## 19.1 Reflection basics

Inspect classes at runtime:
```java
Class<?> clazz = User.class;

// Get methods
Method[] methods = clazz.getDeclaredMethods();

// Get fields
Field field = clazz.getDeclaredField("email");
field.setAccessible(true);  // bypass private
String email = (String) field.get(userInstance);

// Invoke method
Method method = clazz.getMethod("setName", String.class);
method.invoke(userInstance, "New Name");
```

## 19.2 Annotations

Define:
```java
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.METHOD)
public @interface LogExecutionTime {
    String value() default "";
}
```

Use:
```java
@LogExecutionTime("auth")
public void login(String email, String password) { ... }
```

Process (AOP in Spring does this automatically):
```java
// Spring's AOP proxy detects @LogExecutionTime and weaves in timing logic
```

## 19.3 How Spring uses reflection

- `@Autowired`: Reflection to find and inject fields
- `@RequestMapping`: Reflection to map URLs to methods
- `@Entity`: Reflection to map class to table
- Lombok: Annotation processing at compile time to generate code

---

# 20. Memory Model & Garbage Collection

<span class="chapter-label">Chapter 20</span>

## 20.1 The heap structure

```
Heap
├── Young Generation
│   ├── Eden (new objects)
│   └── Survivor Spaces S0, S1 (objects that survived GC)
└── Old Generation (long-lived objects)
    └── Permanent Generation (replaced by Metaspace in Java 8)
```

## 20.2 GC process

1. **Minor GC**: When Eden fills, live objects copied to Survivor. Frequent, fast.
2. **Objects age**: After surviving N Minor GCs, promoted to Old Gen.
3. **Major GC** (Full GC): When Old Gen fills. STW (stop-the-world), slow.

## 20.3 Garbage collectors

| Collector | Use case | Characteristics |
|---|---|---|
| Serial | Single-threaded | Simple, low memory |
| Parallel | Throughput | Multi-threaded, pauses |
| CMS (deprecated) | Low latency | Concurrent, complex |
| G1 (default) | Balanced | Regions, predictable pauses |
| ZGC | Large heaps, low latency | Concurrent, scales to TB |

## 20.4 Memory leaks in Java

Common causes:
- Static collections holding references forever
- Listeners/observers not unregistered
- ThreadLocal not cleaned up
- Connection pools not releasing

Detection:
```bash
# Heap dump
jmap -dump:format=b,file=heap.hprof <pid>

# Analyze with VisualVM, Eclipse MAT, or IntelliJ profiler
```

## 20.5 JVM tuning basics

```bash
java -Xms512m -Xmx2g -XX:+UseG1GC -jar app.jar
```

- `-Xms`: Initial heap
- `-Xmx`: Maximum heap
- `-XX:+UseG1GC`: Use G1 collector
- `-XX:MaxMetaspaceSize`: Limit class metadata
