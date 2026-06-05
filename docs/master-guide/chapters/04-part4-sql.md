<div class="part-divider">
<div class="part-label">Part IV</div>
<div class="part-title">SQL</div>
<div class="part-desc">Relational databases power most of the world's data. This part covers everything from basic SELECT to window functions and query optimization — the skills that separate CRUD developers from engineers who can handle millions of rows efficiently.</div>
</div>

# 21. The Relational Model

<span class="chapter-label">Chapter 21</span>

## 21.1 Core concepts

| Term | Definition |
|---|---|
| **Table/Relation** | A collection of rows with the same structure |
| **Row/Tuple** | A single record |
| **Column/Attribute** | A named piece of data in each row |
| **Schema** | The structure (tables, columns, types, constraints) |
| **Key** | Column(s) that uniquely identify rows |
| **Foreign Key** | Column referencing primary key of another table |

## 21.2 SQL command categories

| Category | Commands | Purpose |
|---|---|---|
| **DDL** (Data Definition) | `CREATE`, `ALTER`, `DROP`, `TRUNCATE` | Define schema |
| **DML** (Data Manipulation) | `INSERT`, `UPDATE`, `DELETE` | Modify data |
| **DQL** (Data Query) | `SELECT` | Retrieve data |
| **DCL** (Data Control) | `GRANT`, `REVOKE` | Permissions |
| **TCL** (Transaction) | `COMMIT`, `ROLLBACK`, `SAVEPOINT` | Transaction control |

## 21.3 Data types comparison

| MySQL | PostgreSQL | Java | Use for |
|---|---|---|---|
| `INT` | `INTEGER` | `int/Integer` | Whole numbers |
| `BIGINT` | `BIGINT` | `long/Long` | Large numbers (IDs) |
| `VARCHAR(n)` | `VARCHAR(n)` | `String` | Variable text |
| `TEXT` | `TEXT` | `String` | Large text |
| `DECIMAL(p,s)` | `NUMERIC(p,s)` | `BigDecimal` | Exact decimals (money) |
| `DATETIME` | `TIMESTAMP` | `LocalDateTime` | Date and time |
| `DATE` | `DATE` | `LocalDate` | Date only |
| `BOOLEAN` | `BOOLEAN` | `boolean` | True/false |
| `BLOB` | `BYTEA` | `byte[]` | Binary data |
| `JSON` | `JSONB` | `String/Object` | JSON documents |

---

# 22. Keys & Constraints

<span class="chapter-label">Chapter 22</span>

## 22.1 Types of keys

| Key Type | Purpose | Null allowed? | Count per table |
|---|---|---|---|
| **Primary Key** | Unique identifier | ❌ No | 1 |
| **Unique Key** | Alternate identifier | ✅ Yes (one null) | Many |
| **Foreign Key** | Referential integrity | Depends | Many |
| **Composite Key** | Multi-column identifier | No | 1 per combination |

## 22.2 Constraints

```sql
CREATE TABLE users (
    user_id         BIGINT PRIMARY KEY AUTO_INCREMENT,
    email           VARCHAR(255) NOT NULL UNIQUE,
    full_name       VARCHAR(100) NOT NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    age             INT CHECK (age >= 18),           -- check constraint
    mentor_id       BIGINT REFERENCES mentors(id),   -- foreign key
    status          VARCHAR(20) DEFAULT 'ACTIVE'
);
```

## 22.3 Referential integrity actions

```sql
CREATE TABLE sessions (
    learner_id BIGINT,
    FOREIGN KEY (learner_id) 
        REFERENCES users(user_id)
        ON DELETE CASCADE      -- delete sessions when user deleted
        ON UPDATE CASCADE      -- update if user_id changes
);
```

| Action | Behavior |
|---|---|
| `CASCADE` | Delete/update child rows |
| `SET NULL` | Set FK to NULL |
| `SET DEFAULT` | Set FK to default |
| `RESTRICT` | Reject parent delete/update |
| `NO ACTION` | Same as RESTRICT (checked at end of statement) |

---

# 23. Querying with SELECT

<span class="chapter-label">Chapter 23</span>

## 23.1 The SELECT structure

```sql
SELECT DISTINCT column1, column2, ...      -- 5. Which columns
FROM table1                                -- 1. Which tables
JOIN table2 ON ...                         -- 1. More tables
WHERE condition                            -- 2. Row filtering
GROUP BY column1                           -- 3. Grouping
HAVING group_condition                     -- 4. Group filtering
ORDER BY column1 DESC                      -- 6. Sorting
LIMIT 10 OFFSET 20;                        -- 7. Pagination
```

**Execution order**: FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT

## 23.2 WHERE clause operators

| Operator | Meaning |
|---|---|
| `=`, `<>`, `!=` | Equal, not equal |
| `<`, `>`, `<=`, `>=` | Comparison |
| `BETWEEN a AND b` | Range inclusive |
| `IN (list)` | Match any in list |
| `LIKE 'pattern'` | Pattern match (% = any chars, _ = one char) |
| `IS NULL`, `IS NOT NULL` | Null check |
| `AND`, `OR`, `NOT` | Logical |
| `EXISTS (subquery)` | Subquery returns rows |

## 23.3 Aggregation functions

```sql
SELECT 
    COUNT(*) as total_users,
    COUNT(DISTINCT country) as countries,
    AVG(age) as avg_age,
    MIN(created_at) as first_signup,
    MAX(score) as high_score,
    SUM(amount) as total_revenue
FROM users;
```

---

# 24. Joins

<span class="chapter-label">Chapter 24</span>

## 24.1 Visual mental model

```
INNER JOIN     LEFT JOIN      RIGHT JOIN     FULL OUTER
  A ∩ B         A + (A∩B)     B + (A∩B)      A ∪ B
  ●●             ●●○○           ○○●●           ●●●●
```

## 24.2 Join types compared

| Join | Returns | Use when |
|---|---|---|
| `INNER JOIN` | Only matching rows in both | You only want complete matches |
| `LEFT JOIN` | All from left + matches from right (NULL if no match) | You need all left rows even without matches |
| `RIGHT JOIN` | All from right + matches from left | Rare; usually flip tables and use LEFT |
| `FULL OUTER JOIN` | All from both (NULLs where no match) | Need complete set from both |
| `CROSS JOIN` | Cartesian product (every combination) | Generating combinations |
| `SELF JOIN` | Table joined to itself | Hierarchies (employee→manager) |

## 24.3 Examples

```sql
-- Inner: only users with profiles
SELECT u.email, p.bio
FROM users u
INNER JOIN profiles p ON u.id = p.user_id;

-- Left: all users, with profile if exists
SELECT u.email, COALESCE(p.bio, 'No bio') as bio
FROM users u
LEFT JOIN profiles p ON u.id = p.user_id;

-- Multiple joins: sessions with learner and mentor names
SELECT 
    s.id,
    l.full_name as learner,
    m.full_name as mentor,
    s.scheduled_at
FROM sessions s
JOIN users l ON s.learner_id = l.id
JOIN users m ON s.mentor_id = m.id
WHERE s.status = 'CONFIRMED';
```

## 24.4 Join vs Subquery

Often interchangeable, but performance differs:

```sql
-- Subquery (correlated, potentially slow)
SELECT * FROM users u
WHERE EXISTS (SELECT 1 FROM orders o WHERE o.user_id = u.id);

-- Join (often faster with proper indexes)
SELECT DISTINCT u.* 
FROM users u
JOIN orders o ON u.id = o.user_id;
```

Modern optimizers often rewrite them to the same plan, but JOINs give the optimizer more flexibility.

---

# 25. Subqueries & CTEs

<span class="chapter-label">Chapter 25</span>

## 25.1 Subquery types

| Type | Description | Example |
|---|---|---|
| **Scalar** | Returns single value | `SELECT * WHERE salary > (SELECT AVG(salary) FROM employees)` |
| **Row** | Returns single row | `WHERE (dept, title) = (SELECT dept, title FROM ...) ` |
| **Table** | Returns multiple rows | `FROM (SELECT ...) AS derived_table` |
| **Correlated** | References outer query | `WHERE EXISTS (SELECT 1 FROM orders o WHERE o.user_id = u.id)` |

## 25.2 Common Table Expressions (CTEs)

```sql
WITH 
-- Define reusable subqueries
active_users AS (
    SELECT id, email 
    FROM users 
    WHERE status = 'ACTIVE'
),
user_orders AS (
    SELECT user_id, COUNT(*) as order_count
    FROM orders
    GROUP BY user_id
)
-- Main query using CTEs
SELECT au.email, COALESCE(uo.order_count, 0) as orders
FROM active_users au
LEFT JOIN user_orders uo ON au.id = uo.user_id;
```

## 25.3 Recursive CTEs

```sql
-- Find all subordinates in org chart
WITH RECURSIVE subordinates AS (
    -- Anchor: direct reports
    SELECT id, name, manager_id, 1 as level
    FROM employees
    WHERE manager_id = 42
    
    UNION ALL
    
    -- Recursive: their reports
    SELECT e.id, e.name, e.manager_id, s.level + 1
    FROM employees e
    JOIN subordinates s ON e.manager_id = s.id
)
SELECT * FROM subordinates;
```

---

# 26. Window Functions

<span class="chapter-label">Chapter 26</span>

## 26.1 What they do

Perform calculations across a "window" of related rows without collapsing groups like GROUP BY.

## 26.2 Categories

| Category | Functions | Purpose |
|---|---|---|
| **Ranking** | `ROW_NUMBER()`, `RANK()`, `DENSE_RANK()`, `NTILE()` | Assign position |
| **Aggregate** | `SUM()`, `AVG()`, `COUNT()`, `MIN()`, `MAX()` | Running totals |
| **Value** | `LAG()`, `LEAD()`, `FIRST_VALUE()`, `LAST_VALUE()` | Access other rows |

## 26.3 Examples

```sql
-- Top 3 scores per category (no subquery needed!)
SELECT *
FROM (
    SELECT 
        product_name,
        category,
        score,
        ROW_NUMBER() OVER (PARTITION BY category ORDER BY score DESC) as rn
    FROM products
) ranked
WHERE rn <= 3;

-- Running total (cumulative revenue)
SELECT 
    date,
    daily_revenue,
    SUM(daily_revenue) OVER (ORDER BY date) as cumulative_revenue
FROM daily_sales;

-- Difference from previous row
SELECT 
    date,
    users,
    users - LAG(users) OVER (ORDER BY date) as day_over_day_change
FROM daily_active_users;

-- First and last in group
SELECT 
    user_id,
    order_date,
    FIRST_VALUE(order_total) OVER (
        PARTITION BY user_id 
        ORDER BY order_date 
        ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING
    ) as first_order
FROM orders;
```

---

# 27. Indexes & Query Performance

<span class="chapter-label">Chapter 27</span>

## 27.1 Types of indexes

| Type | Structure | Best for |
|---|---|---|
| **B-Tree** (default) | Balanced tree | Equality, range, sorting |
| **Hash** | Hash table | Exact equality only |
| **Full-text** | Inverted index | Text search |
| **Spatial** | R-tree | Geographic data |

## 27.2 Creating indexes

```sql
-- Single column
CREATE INDEX idx_users_email ON users(email);

-- Composite (order matters!)
CREATE INDEX idx_orders_user_date ON orders(user_id, order_date);

-- Unique
CREATE UNIQUE INDEX idx_users_email ON users(email);

-- Partial (filtered)
CREATE INDEX idx_active_users ON users(email) WHERE status = 'ACTIVE';
```

## 27.3 When indexes help (and don't)

**Indexes help:**
- `WHERE` clause columns
- `JOIN` conditions
- `ORDER BY` columns
- `GROUP BY` columns

**Indexes hurt:**
- Small tables (< 1000 rows, full scan is faster)
- Frequent writes (maintaining index adds overhead)
- Low-cardinality columns (boolean, status with few values)
- Leading wildcard `LIKE '%text'`

## 27.4 EXPLAIN basics

```sql
EXPLAIN SELECT * FROM users WHERE email = 'test@example.com';
```

Look for:
- `type=ALL` — full table scan (bad for big tables)
- `type=ref` or `eq_ref` — index lookup (good)
- `key=NULL` — no index used
- `rows` — estimate of rows examined (lower is better)

---

# 28. Transactions, ACID & Isolation

<span class="chapter-label">Chapter 28</span>

## 28.1 ACID properties

| Letter | Property | What it means | Example |
|---|---|---|---|
| **A** | Atomicity | All or nothing | Bank transfer: both debit and credit succeed, or neither |
| **C** | Consistency | Valid state → valid state | Constraints never violated, total money conserved |
| **I** | Isolation | Concurrent transactions don't interfere | Two simultaneous transfers don't see partial states |
| **D** | Durability | Committed data survives crashes | Once COMMIT returns, data is safe even if server crashes |

> Remember: "A Crash Is Drama-free."

## 28.2 Transaction control

```sql
START TRANSACTION;  -- or BEGIN
    UPDATE accounts SET balance = balance - 100 WHERE id = 1;
    UPDATE accounts SET balance = balance + 100 WHERE id = 2;
COMMIT;  -- or ROLLBACK if something failed
```

## 28.3 Isolation levels

| Level | Dirty Read | Non-Repeatable Read | Phantom Read | Use when |
|---|---|---|---|---|
| `READ UNCOMMITTED` | ❌ Allowed | ❌ Allowed | ❌ Allowed | Rarely, read-only analytics |
| `READ COMMITTED` | ✅ Prevented | ❌ Allowed | ❌ Allowed | Default in many DBs |
| `REPEATABLE READ` (MySQL default) | ✅ Prevented | ✅ Prevented | ❌ Allowed | Consistent reads |
| `SERIALIZABLE` | ✅ Prevented | ✅ Prevented | ✅ Prevented | Critical financial data |

**Phenomena explained:**
- **Dirty read**: See uncommitted changes from another transaction
- **Non-repeatable read**: Re-query same row, get different data (another tx committed)
- **Phantom read**: Re-query with same condition, get different set of rows (new rows inserted)

Spring's `@Transactional` lets you specify:
```java
@Transactional(isolation = Isolation.REPEATABLE_READ)
```

---

# 29. Normalization (1NF to BCNF)

<span class="chapter-label">Chapter 29</span>

## 29.1 The normal forms

| Form | Rule | Violation example |
|---|---|---|
| **1NF** | Atomic values, no repeating groups | `phones: "123,456"` → split to separate table |
| **2NF** | 1NF + no partial dependencies | PK is (order_id, product_id), but price depends only on product_id |
| **3NF** | 2NF + no transitive dependencies | User has `city_id` → city name stored in cities table, not users |
| **BCNF** | 3NF + every determinant is a candidate key | More strict version of 3NF |

## 29.2 Practical example

**Unnormalized:**
```
orders(order_id, customer_name, customer_email, product_names, quantities, total)
-- product_names is a list! violates 1NF
```

**1NF:** Split products to separate rows
```
order_items(order_id, product_name, quantity)
-- but product_name repeats, price not stored
```

**2NF + 3NF:** Separate products, customers
```
customers(customer_id, name, email)
products(product_id, name, price)
orders(order_id, customer_id, order_date)
order_items(order_id, product_id, quantity)
```

## 29.3 When to denormalize

Normalization optimizes for writes and consistency. **Denormalize** when reads are critical:
- Add `total_amount` to orders table (calculated from items)
- Add `comment_count` to posts table
- Use materialized views for reports

Trade space for speed. Keep source data normalized, create denormalized read models.
