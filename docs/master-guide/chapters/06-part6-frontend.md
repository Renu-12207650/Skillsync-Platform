<div class="part-divider">
<div class="part-label">Part VI–VIII</div>
<div class="part-title">HTML, CSS & JavaScript</div>
<div class="part-desc">The frontend trilogy. HTML for structure, CSS for presentation, JavaScript for behavior. These three layers, properly separated, create the user experiences that make SkillSync feel responsive and modern.</div>
</div>

# 42–48. HTML & CSS Fundamentals

<span class="chapter-label">Chapters 42–48</span>

## 42.1 HTML document structure

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="SkillSync - Peer-to-peer skill exchange">
    <title>SkillSync</title>
    <link rel="stylesheet" href="/styles.css">
</head>
<body>
    <header>...</header>
    <main>...</main>
    <footer>...</footer>
    <script src="/app.js"></script>
</body>
</html>
```

## 42.2 Semantic HTML5 tags

| Tag | Purpose |
|---|---|
| `<header>` | Introductory content, nav |
| `<nav>` | Navigation links |
| `<main>` | Primary content (one per page) |
| `<article>` | Self-contained composition |
| `<section>` | Thematic grouping |
| `<aside>` | Sidebar, tangential content |
| `<footer>` | Footer info |
| `<figure>` / `<figcaption>` | Image with caption |
| `<time>` | Datetime |
| `<mark>` | Highlighted text |

> Why semantic? Accessibility (screen readers), SEO (search engines understand structure), maintainability.

## 43.1 Form inputs and validation

```html
<form>
    <label for="email">Email</label>
    <input type="email" id="email" name="email" required 
           pattern="[^@]+@[^@]+\.[^@]+" placeholder="you@example.com">
    
    <label for="age">Age</label>
    <input type="number" id="age" name="age" min="18" max="120">
    
    <label for="role">Role</label>
    <select id="role" name="role" required>
        <option value="">Select...</option>
        <option value="learner">Learner</option>
        <option value="mentor">Mentor</option>
    </select>
    
    <button type="submit">Register</button>
</form>
```

## 44.1 Accessibility (a11y) essentials

- Use semantic elements
- Add `alt` text to images
- Ensure keyboard navigation (Tab order)
- Color contrast ≥ 4.5:1 for text
- Associate labels with inputs (`for` + `id`)
- Use `aria-label` for icon-only buttons
- Test with screen readers (NVDA, VoiceOver)

## 45.1 CSS Selectors & Specificity

```css
/* Element */
p { color: black; }

/* Class */
.highlight { background: yellow; }

/* ID */
#header { height: 60px; }

/* Attribute */
input[type="email"] { border: 2px solid blue; }

/* Pseudo-class */
button:hover { background: darkblue; }
input:focus { outline: 2px solid orange; }
li:first-child { font-weight: bold; }

/* Pseudo-element */
p::first-line { font-weight: bold; }
p::before { content: "→ "; }
```

**Specificity hierarchy** (higher wins, ties broken by order):

| Type | Weight | Example |
|---|---|---|
| Inline style | 1000 | `style="color:red"` |
| ID | 100 | `#header` |
| Class, attribute, pseudo-class | 10 | `.active`, `[type="text"]` |
| Element, pseudo-element | 1 | `div`, `::before` |

## 46.1 The Box Model

```
┌─────────────────────────────────────┐
│              Margin                 │  ← Outside spacing
│  ┌───────────────────────────────┐  │
│  │           Border              │  │  ← Visible edge
│  │  ┌─────────────────────────┐  │  │
│  │  │        Padding          │  │  │  ← Inside spacing
│  │  │  ┌─────────────────┐    │  │  │
│  │  │  │     Content     │    │  │  │  ← Actual content
│  │  │  │  (width/height) │    │  │  │
│  │  │  └─────────────────┘    │  │  │
│  │  └─────────────────────────┘  │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

```css
/* Content-box (default): width = content only */
.box { width: 300px; padding: 20px; }  /* Total: 340px */

/* Border-box: width = content + padding + border */
* { box-sizing: border-box; }
.box { width: 300px; padding: 20px; }  /* Total: 300px */
```

## 47.1 Positioning

| Value | Positioned relative to | Removed from flow? |
|---|---|---|
| `static` | Normal position | No |
| `relative` | Its normal position | No (space preserved) |
| `absolute` | Nearest positioned ancestor | Yes |
| `fixed` | Viewport | Yes |
| `sticky` | Scroll position (toggles) | No until threshold |

## 48.1 Flexbox

**One-dimensional** layout (row or column).

```css
.container {
    display: flex;
    flex-direction: row;        /* row | row-reverse | column | column-reverse */
    justify-content: center;      /* main axis: flex-start | center | space-between | space-around | space-evenly */
    align-items: center;          /* cross axis: stretch | center | flex-start | flex-end */
    flex-wrap: wrap;              /* nowrap | wrap | wrap-reverse */
    gap: 16px;                    /* row-gap + column-gap */
}

.item {
    flex: 1;                      /* grow shrink basis shorthand */
    align-self: flex-end;         /* override container align-items */
    order: 2;                     /* visual order (not DOM order) */
}
```

> Remember: "Justify = main axis. Align = cross axis." For `flex-direction: row`, justify is horizontal, align is vertical.

## 48.2 Grid

**Two-dimensional** layout (rows AND columns).

```css
.container {
    display: grid;
    grid-template-columns: repeat(3, 1fr);  /* 3 equal columns */
    grid-template-rows: 80px auto 60px;      /* header, content, footer */
    gap: 16px;
    
    /* Named areas */
    grid-template-areas:
        "header header header"
        "sidebar main main"
        "footer footer footer";
}

.header { grid-area: header; }
.sidebar { grid-area: sidebar; }
.main { grid-area: main; }
.footer { grid-area: footer; }
```

## 48.3 Responsive design

```css
/* Mobile-first: base styles, then enhance for larger */
.card { width: 100%; }

/* Tablet */
@media (min-width: 768px) {
    .card { width: 48%; }
}

/* Desktop */
@media (min-width: 1024px) {
    .card { width: 31%; }
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
    body { background: #1a1a1a; color: #f0f0f0; }
}

/* Reduced motion preference */
@media (prefers-reduced-motion: reduce) {
    * { animation: none !important; transition: none !important; }
}
```

## 48.4 CSS methodologies

| Methodology | Approach | Pros | Cons |
|---|---|---|---|
| **BEM** | Block__Element--Modifier naming | Clear, no cascade issues | Verbose |
| **SMACSS** | Categorize rules (base, layout, module, state, theme) | Organized | Learning curve |
| **OOCSS** | Separate structure from skin, container from content | Reusable | Can be abstract |
| **Utility-first (Tailwind)** | Atomic classes | Fast dev, consistent | HTML verbosity, learning curve |
| **CSS Modules** | Scoped by file | No naming conflicts | Build step |
| **CSS-in-JS** | Styles in JS | Dynamic, scoped | Runtime overhead |

SkillSync uses inline styles + CSS variables (pragmatic for small team).

---

# 49–63. JavaScript Fundamentals

<span class="chapter-label">Chapters 49–63</span>

## 49.1 Types and variables

```javascript
// Primitives
const name = "SkillSync";      // string
const count = 42;               // number (no int/float distinction)
const active = true;            // boolean
const nothing = null;           // null (intentional absence)
const missing = undefined;      // undefined (not assigned)
const sym = Symbol('id');       // symbol (unique key)
const big = 9007199254740991n; // bigint

// Reference types
const user = { name: "Renu" };           // object
const skills = ["Java", "React"];         // array (object)
const now = new Date();                   // date object

// Check type
typeof "text";       // "string"
typeof 42;           // "number"
typeof {};           // "object"
typeof [];           // "object" (arrays are objects)
typeof null;         // "object" (historic bug)
Array.isArray([]);   // true
```

## 50.1 var, let, const

| | `var` | `let` | `const` |
|---|---|---|---|
| Scope | Function | Block | Block |
| Hoisting | Yes (initialized undefined) | Yes (TDZ) | Yes (TDZ) |
| Redeclare | Yes | No | No |
| Reassign | Yes | Yes | No |

**Temporal Dead Zone (TDZ):**
```javascript
console.log(x);  // ReferenceError (TDZ for let)
let x = 5;

console.log(y);  // undefined (var hoisted)
var y = 5;
```

**Best practice:** Use `const` by default, `let` when reassign needed, never `var`.

## 51.1 Functions and closures

```javascript
// Function declaration (hoisted)
function greet(name) { return `Hello, ${name}`; }

// Function expression
const greet = function(name) { return `Hello, ${name}`; };

// Arrow function (lexical this)
const greet = (name) => `Hello, ${name}`;

// Default parameters
const greet = (name = "Guest") => `Hello, ${name}`;

// Rest parameters
const sum = (...numbers) => numbers.reduce((a, b) => a + b, 0);

// Destructuring parameters
const displayUser = ({ name, email }) => console.log(name, email);
```

## 51.2 Closures

A function that remembers variables from its enclosing scope:

```javascript
function createCounter() {
    let count = 0;                    // enclosed variable
    return {
        increment: () => ++count,
        decrement: () => --count,
        get: () => count
    };
}

const counter = createCounter();
counter.increment();  // 1
counter.increment();  // 2
counter.get();        // 2
// count is private, can't be accessed directly
```

Uses: data privacy, currying, factory functions, React hooks.

## 52.1 `this` binding

| Context | `this` refers to |
|---|---|
| Global | `window` (browser), `global` (Node) |
| Function call | `window` (non-strict) / `undefined` (strict) |
| Method call | Object the method belongs to |
| Constructor | New instance |
| `call`/`apply`/`bind` | First argument |
| Arrow function | `this` of enclosing scope (lexical) |

```javascript
const user = {
    name: "Renu",
    greet() { console.log(this.name); },  // "Renu"
    greetArrow: () => console.log(this.name)  // undefined (lexical this)
};

// Explicit binding
function greet() { console.log(this.name); }
greet.call({ name: "SkillSync" });  // "SkillSync"
const boundGreet = greet.bind({ name: "SkillSync" });
```

## 53.1 Prototypes and classes

```javascript
// ES6 Class (syntactic sugar over prototypes)
class Animal {
    constructor(name) {
        this.name = name;
    }
    speak() { console.log(`${this.name} makes noise`); }
}

class Dog extends Animal {
    speak() { console.log(`${this.name} barks`); }
}

const dog = new Dog("Rex");
dog.speak();  // "Rex barks"
```

**Prototype chain:** When you access a property, JavaScript walks up `__proto__` until found or null.

## 54.1 The Event Loop

JavaScript is single-threaded but non-blocking via the event loop:

```
┌─────────────────────────┐
│        Call Stack       │  ← Executes synchronous code
└───────────┬─────────────┘
            │
┌───────────▼─────────────┐
│   Web APIs (Browser)    │  ← setTimeout, fetch, DOM events
│   (Node: libuv)         │
└───────────┬─────────────┘
            │ Callbacks ready
┌───────────▼─────────────┐
│    Callback Queue       │  ← Macrotasks (setTimeout, I/O)
│    (Task Queue)         │
└───────────┬─────────────┘
            │
┌───────────▼─────────────┐
│     Microtask Queue     │  ← Promises, queueMicrotask
│    (Higher priority)    │
└─────────────────────────┘
```

**Order:** Run stack → Empty microtasks → One macrotask → Repeat.

```javascript
console.log("1");
setTimeout(() => console.log("2"), 0);
Promise.resolve().then(() => console.log("3"));
console.log("4");
// Output: 1, 4, 3, 2
```

## 55.1 Promises

```javascript
const promise = new Promise((resolve, reject) => {
    // Async operation
    if (success) resolve(value);
    else reject(error);
});

// Consuming
promise
    .then(value => console.log(value))
    .catch(error => console.error(error))
    .finally(() => console.log("Done"));
```

**Promise combinators:**
```javascript
Promise.all([p1, p2]);        // Wait for all, fail fast
Promise.allSettled([p1, p2]); // Wait for all, never reject
Promise.race([p1, p2]);       // First to settle wins
Promise.any([p1, p2]);        // First to fulfill wins
```

## 55.2 async/await

Syntactic sugar over promises:

```javascript
async function fetchUser(id) {
    try {
        const response = await fetch(`/api/users/${id}`);
        if (!response.ok) throw new Error("Failed");
        return await response.json();
    } catch (error) {
        console.error(error);
        throw error;
    }
}

// Parallel execution
const [user, orders] = await Promise.all([
    fetchUser(1),
    fetchOrders(1)
]);
```

> Remember: `async` functions always return promises. `await` pauses execution in that function only.

## 56.1 ES Modules

```javascript
// math.js
export const PI = 3.14159;
export function add(a, b) { return a + b; }
export default class Calculator { }

// app.js
import Calculator, { PI, add } from './math.js';
import * as math from './math.js';
```

**Module vs Script:**
| | Module | Script |
|---|---|---|
| Scope | File-level | Global |
| `this` at top | `undefined` | `window` |
| Strict mode | Always | Optional |
| Top-level `await` | Yes | No |
| Imports/Exports | Yes | No |

## 57.1 Array methods

```javascript
const nums = [1, 2, 3, 4, 5];

// Transformation
const doubled = nums.map(n => n * 2);        // [2,4,6,8,10]
const evens = nums.filter(n => n % 2 === 0); // [2,4]
const sum = nums.reduce((acc, n) => acc + n, 0); // 15

// Search
nums.find(n => n > 3);      // 4 (first match)
nums.findIndex(n => n > 3); // 3 (index of first match)
nums.some(n => n > 4);      // true (any match)
nums.every(n => n > 0);     // true (all match)
nums.includes(3);           // true

// Other
nums.forEach(n => console.log(n));
nums.sort((a, b) => b - a); // [5,4,3,2,1] (descending)
const flat = [[1,2],[3,4]].flat(); // [1,2,3,4]
```

## 58.1 Object manipulation

```javascript
const user = { name: "Renu", age: 25, city: "Bangalore" };

// Destructuring
const { name, age } = user;
const { name: fullName } = user;  // rename

// Spread (shallow copy)
const userCopy = { ...user, age: 26 };  // override age

// Object methods
Object.keys(user);    // ["name", "age", "city"]
Object.values(user);  // ["Renu", 25, "Bangalore"]
Object.entries(user); // [["name","Renu"], ...]

// Check property
"name" in user;           // true
user.hasOwnProperty("name"); // true (own prop, not inherited)
```

## 59.1 DOM and Browser APIs

```javascript
// Select elements
const el = document.getElementById("app");
const els = document.querySelectorAll(".card");
const first = document.querySelector(".card");

// Modify
el.textContent = "Hello";  // Text only
el.innerHTML = "<b>Hi</b>";  // Parses HTML (XSS risk!)
el.style.color = "red";
el.classList.add("active");
el.classList.toggle("hidden");

// Create
const div = document.createElement("div");
div.className = "new-element";
div.textContent = "New!";
parent.appendChild(div);

// Events
button.addEventListener("click", handler);
button.removeEventListener("click", handler);

// Event delegation
list.addEventListener("click", (e) => {
    if (e.target.matches("li")) {
        console.log("Clicked", e.target.textContent);
    }
});
```

## 60.1 Storage APIs

| | localStorage | sessionStorage | Cookies |
|---|---|---|---|
| Capacity | ~5-10 MB | ~5 MB | ~4 KB |
| Lifetime | Until cleared | Tab session | Configurable |
| Sent to server | No | No | Yes (auto) |
| Scope | Origin | Origin + tab | Domain + path |

```javascript
// localStorage
localStorage.setItem("token", jwt);
const token = localStorage.getItem("token");
localStorage.removeItem("token");

// Cookies
document.cookie = "name=value; expires=Fri, 31 Dec 2024 23:59:59 GMT; path=/; Secure; HttpOnly; SameSite=Strict";
```

## 61.1 Fetch API

```javascript
const response = await fetch('/api/users', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ name: 'Renu' })
});

if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
}

const data = await response.json();
```

> Gotcha: `fetch` doesn't reject on HTTP error status! Check `response.ok` manually.

## 62.1 Debounce and Throttle

```javascript
// Debounce: wait until N ms after last call
function debounce(fn, delay) {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => fn(...args), delay);
    };
}

// Throttle: at most once per N ms
function throttle(fn, limit) {
    let inThrottle;
    return (...args) => {
        if (!inThrottle) {
            fn(...args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Usage
input.addEventListener('input', debounce(handleSearch, 300));
window.addEventListener('scroll', throttle(handleScroll, 100));
```

Uses: search-as-you-type (debounce), scroll handlers (throttle).

## 63.1 Shallow vs Deep Copy

```javascript
const obj = { a: 1, nested: { b: 2 } };

// Shallow (nested still shared)
const shallow1 = { ...obj };
const shallow2 = Object.assign({}, obj);

// Deep (limited methods)
const deep1 = JSON.parse(JSON.stringify(obj));  // loses functions, dates, undefined
const deep2 = structuredClone(obj);  // modern, preserves more types

// Deep with library
import cloneDeep from 'lodash/cloneDeep';
const deep3 = cloneDeep(obj);
```
