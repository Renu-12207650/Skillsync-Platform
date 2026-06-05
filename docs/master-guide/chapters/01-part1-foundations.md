<div class="part-divider">
<div class="part-label">Part I</div>
<div class="part-title">Foundations</div>
<div class="part-desc">Before we look at any single language or framework, we need a shared mental model of what "full-stack" actually means. Three short chapters: how the web moves bytes around, how a developer's day-to-day tools fit together, and what really happens when a user clicks a button in a React app that talks to a Spring Boot backend.</div>
</div>

# 1. How the Web Works

<span class="chapter-label">Chapter 1</span>

## 1.1 The client–server model

Every web interaction is a conversation between two programs:

- **Client** &mdash; the program that asks. Usually a browser running your React app. It can also be a mobile app, a `curl` command, or another backend service.
- **Server** &mdash; the program that answers. In SkillSync, these are our Spring Boot microservices.

The client sends a **request**; the server returns a **response**. This is the whole model. Everything else &mdash; REST, GraphQL, WebSockets &mdash; is a flavor on top of it.

<div class="diagram">
Browser  ──── request ────▶  Server
         ◀─── response ────
</div>

## 1.2 What is HTTP?

**HTTP** (HyperText Transfer Protocol) is the text-based protocol used to shape those requests and responses.

A raw HTTP request looks like this:

```
POST /auth/login HTTP/1.1
Host: api.skillsync.in
Content-Type: application/json
Authorization: Bearer eyJhbGciOi...

{"email":"renu@example.com","password":"secret"}
```

A response looks like this:

```
HTTP/1.1 200 OK
Content-Type: application/json
Content-Length: 120

{"accessToken":"eyJhbGciOi...","user":{"id":42,"name":"Renu"}}
```

Every request has **four parts**:

1. **Method** (verb) &mdash; what action to take: `GET`, `POST`, `PUT`, `PATCH`, `DELETE`.
2. **Path** &mdash; what resource you're addressing: `/auth/login`.
3. **Headers** &mdash; metadata (auth token, content type, cookies).
4. **Body** (optional) &mdash; payload, usually JSON in REST APIs.

Every response has:

1. **Status code** &mdash; a three-digit number indicating outcome.
2. **Headers** &mdash; metadata (content type, CORS, caching hints).
3. **Body** &mdash; the data (JSON, HTML, bytes).

### HTTP methods

| Method | Purpose | Idempotent? | Has body? |
|---|---|---|---|
| `GET` | Read a resource | Yes | No |
| `POST` | Create a new resource / submit data | No | Yes |
| `PUT` | Fully replace a resource | Yes | Yes |
| `PATCH` | Partially update a resource | No (usually) | Yes |
| `DELETE` | Remove a resource | Yes | No |

**Idempotent** = calling it N times has the same effect as calling it once. `DELETE /users/42` three times still leaves user 42 gone. `POST /users` three times creates three users.

### Status code families

| Range | Meaning | Examples |
|---|---|---|
| `1xx` | Informational | `101 Switching Protocols` |
| `2xx` | Success | `200 OK`, `201 Created`, `204 No Content` |
| `3xx` | Redirection | `301 Moved Permanently`, `304 Not Modified` |
| `4xx` | Client error | `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`, `409 Conflict`, `422 Unprocessable Entity`, `429 Too Many Requests` |
| `5xx` | Server error | `500 Internal Server Error`, `502 Bad Gateway`, `503 Service Unavailable` |

> TIP: Choose status codes carefully. Returning `200 OK` for an error just because you "handled it" is a common mistake. Let the status code carry meaning. SkillSync uses `404` for missing resources, `409` for duplicates, `401` for bad credentials, and `403` for "you're logged in but not allowed".

## 1.3 HTTP versions: 1.1 vs 2 vs 3

| | HTTP/1.1 | HTTP/2 | HTTP/3 |
|---|---|---|---|
| Transport | TCP | TCP | QUIC (over UDP) |
| Multiplexing | No (head-of-line blocking) | Yes, single connection | Yes, better loss recovery |
| Headers | Plain text | Binary + HPACK compression | Same, over QUIC |
| Server push | No | Yes (rarely used) | Yes |
| Availability | Universal | ~98% browsers | Growing, CDN-backed |

For SkillSync, we don't worry about this directly &mdash; nginx in front of the gateway handles protocol negotiation.

## 1.4 HTTPS = HTTP + TLS

**TLS** (Transport Layer Security) encrypts the bytes traveling over the wire. With HTTPS:

- Nobody on the network can read the body or headers (except the TLS-terminating endpoint).
- The server proves its identity via a certificate signed by a trusted authority (Let's Encrypt, DigiCert, etc.).
- Data integrity is guaranteed &mdash; tampering breaks the TLS session.

**Never** send JWTs or passwords over plain HTTP. In development this is OK on `localhost`; in production, HTTPS is non-negotiable.

## 1.5 DNS: how `api.skillsync.in` becomes an IP

When a browser sees `https://api.skillsync.in/auth/login`, it:

1. Asks the OS resolver for the IP address.
2. OS resolver asks your configured DNS server (often your ISP or `8.8.8.8`).
3. DNS server recursively walks: root `.` &rarr; `.in` TLD &rarr; `skillsync.in` authoritative server.
4. The IP comes back. Browser opens a TCP connection to it.

DNS results are cached at many layers (browser, OS, resolver). This is why DNS changes take time to propagate.

## 1.6 What the browser does (the 7-step pipeline)

1. **Parse the URL** into protocol, host, port, path, query.
2. **DNS lookup** to resolve host to IP.
3. **TCP + TLS handshake** to open a secure connection.
4. **Send HTTP request** with method, headers, body.
5. **Receive response** &mdash; status, headers, body.
6. **Parse HTML &rarr; DOM tree; CSS &rarr; CSSOM; combine into Render Tree.**
7. **Layout, paint, composite** &mdash; pixels appear on screen.

If the response is JSON (as in our `/auth/login`), step 6 is just "hand the bytes to JavaScript". If it's HTML, the render pipeline runs.

## 1.7 Cookies, storage, and session identity

Browsers keep three kinds of persistent storage:

| Storage | Sent to server? | Scoped by | Max size | Lifetime |
|---|---|---|---|---|
| Cookies | Automatically | Domain + path | ~4 KB each | Per `Expires` / `Max-Age` |
| `localStorage` | No | Origin | ~5&ndash;10 MB | Until cleared |
| `sessionStorage` | No | Origin + tab | ~5 MB | Tab closed |
| IndexedDB | No | Origin | Large (hundreds of MB) | Until cleared |

SkillSync stores the JWT in `localStorage` for simplicity, and attaches it manually via the `Authorization` header. An alternative is to store it in an **HttpOnly** cookie &mdash; more secure against XSS but requires CSRF protection.

## 1.8 CORS in one paragraph

Browsers enforce the **same-origin policy**: JavaScript running on `https://app.skillsync.in` cannot read responses from `https://api.skillsync.in` unless the server opts in. The opt-in is **CORS** (Cross-Origin Resource Sharing). The server sends headers like:

```
Access-Control-Allow-Origin: https://app.skillsync.in
Access-Control-Allow-Methods: GET, POST, PUT, DELETE
Access-Control-Allow-Headers: Authorization, Content-Type
Access-Control-Allow-Credentials: true
```

For "non-simple" requests (e.g., with a custom `Authorization` header), the browser first sends an `OPTIONS` **preflight** request to check permission. Spring Cloud Gateway in SkillSync handles CORS centrally so every service doesn't have to.

<div class="remember">Remember: CORS is enforced by the <strong>browser</strong>, not the server. A <code>curl</code> request never trips it. That's why CORS errors only appear in the browser console.</div>

---

# 2. The Developer Workflow

<span class="chapter-label">Chapter 2</span>

## 2.1 Version control with Git

Git is the universal language of code collaboration. You'll use it every day.

### The mental model

A Git repository has three "areas":

1. **Working directory** &mdash; the files on disk.
2. **Index / staging area** &mdash; what will be in the next commit.
3. **Local repository** &mdash; the history of commits.

And a fourth, when collaborating: the **remote** (typically GitHub/GitLab).

<div class="diagram">
  working dir  ── git add ──▶  staging  ── git commit ──▶  local repo  ── git push ──▶  remote
            ◀──────────────── git checkout / restore ──────────────────
</div>

### Essential commands

| Command | What it does |
|---|---|
| `git init` | Turn a folder into a repo |
| `git clone &lt;url&gt;` | Copy a remote repo locally |
| `git status` | Show what's changed |
| `git add &lt;file&gt;` | Stage a file |
| `git add -A` | Stage everything |
| `git commit -m "msg"` | Record a snapshot |
| `git log --oneline --graph` | Visual history |
| `git diff` | What's changed but not staged |
| `git branch feature-x` | Create a branch |
| `git switch feature-x` | Move to branch |
| `git merge feature-x` | Combine branches |
| `git rebase main` | Replay commits onto main |
| `git pull` | Fetch + merge from remote |
| `git push` | Send commits to remote |
| `git stash` | Temporarily save changes |
| `git reset --hard HEAD` | Discard all local changes (careful!) |

### Merge vs rebase

<div class="why-box">
<h4>Why merge OR rebase &mdash; what's the difference?</h4>

<strong>Merge</strong> preserves history as it happened. Creates a merge commit. Your history shows parallel branches rejoining.

<strong>Rebase</strong> rewrites your branch's commits on top of the target. History looks linear. But <em>never rebase shared branches</em> &mdash; it rewrites hashes and confuses teammates.

Rule of thumb: <em>rebase your feature branch onto main before merging, then merge with a merge commit (<code>--no-ff</code>).</em> You get both linear history and an explicit record of the feature.
</div>

## 2.2 Package managers

Every ecosystem has one:

| Ecosystem | Manager | Lock file |
|---|---|---|
| Java | Maven, Gradle | `pom.xml` (with resolved versions) |
| JavaScript | npm, pnpm, yarn | `package-lock.json`, `pnpm-lock.yaml` |
| Python | pip, poetry | `requirements.txt`, `poetry.lock` |

SkillSync uses **Maven** for backend and **npm** for frontend.

### Maven quickstart

```
mvn clean install       # build + run tests + install to local repo
mvn spring-boot:run     # run a Spring Boot app
mvn test                # run tests only
mvn package -DskipTests # build jar without tests
```

A Maven project is defined by `pom.xml`: project coordinates (`groupId`, `artifactId`, `version`), dependencies, build plugins.

### npm quickstart

```
npm install             # install everything in package.json
npm install axios       # add a dep
npm install -D vitest   # add a dev dep
npm run dev             # run a script defined in package.json
```

## 2.3 IDEs, linters, formatters

- **IDE** &mdash; IntelliJ IDEA for Java, VS Code / Cursor / Windsurf for React. Give yourself autocomplete, refactoring, inline errors, and debugging.
- **Linter** &mdash; catches likely bugs. ESLint for JS/TS.
- **Formatter** &mdash; enforces style. Prettier for JS, google-java-format for Java.
- **EditorConfig** (`.editorconfig`) &mdash; tab width, line endings &mdash; shared across IDEs.

<div class="remember">Remember: configure formatters to run on save. Never waste a code review on whitespace.</div>

## 2.4 Environments

| Environment | Purpose | Data | Deployment trigger |
|---|---|---|---|
| **local** | Your machine | Throwaway | `npm run dev` |
| **dev / staging** | Integration testing | Seeded / synthetic | Merge to `develop` |
| **production** | Real users | Real | Merge to `main`, tagged release |

Configuration that changes per environment (DB URL, JWT secret, email credentials) is injected via env vars or config servers &mdash; never hard-coded.

## 2.5 Testing, CI/CD in one page

- **Unit tests** &mdash; test one function / component in isolation.
- **Integration tests** &mdash; test a slice with real collaborators.
- **End-to-end (E2E)** &mdash; drive the real app through a browser.

**CI (Continuous Integration)**: every push runs tests in a pipeline (GitHub Actions, Jenkins).
**CD (Continuous Delivery/Deployment)**: green builds can be deployed automatically.

---

# 3. How a Full-Stack Request Flows End-to-End

<span class="chapter-label">Chapter 3</span>

Let's trace one click: the user submits the login form in the SkillSync React app. Here's what actually happens:

<div class="diagram">
[ User clicks "Login" ]
        │
        ▼
[ React: LoginPage onSubmit ]
        │  axios.post('/auth/login', {email, password})
        ▼
[ Axios interceptor ] attaches base URL, logs request
        │
        ▼
[ Browser network stack ] CORS preflight (OPTIONS) if needed
        │
        ▼
[ Spring Cloud Gateway :8888 ]  route matched: /auth/** → auth-service
        │
        ▼
[ Auth-Service :8081 ]
   - SecurityFilterChain: this path is permitted (public)
   - AuthController.login(LoginRequest)
   - AuthenticationManager authenticates via UserDetailsService + BCrypt
   - JwtService.generateToken(...)  → signs JWT with HS256 + secret
        │
        ▼
[ AuthResponse {accessToken, refreshToken, user} → JSON ]
        │
        ▲  ───────── response travels back ─────────
        │
[ Axios response interceptor ] captures token
        │
        ▼
[ AuthContext ]  localStorage.setItem('accessToken', token); setUser(user)
        │
        ▼
[ React Router ] navigate('/dashboard')
        │
        ▼
[ Dashboard mounts ]  sends GET /users/me with Authorization: Bearer &lt;token&gt;
        │
        ▼
[ Gateway → user-service ] validates JWT at gateway, forwards
        │
        ▼
[ user-service ]  JwtAuthenticationFilter extracts claims
   - SecurityContextHolder populated
   - UserController.me() returns DTO
        │
        ▲  JSON back to React → rendered on screen
</div>

We'll revisit every step of this in the relevant chapters, and in Part XI we'll open the actual SkillSync code for each one. For now, carry this picture with you: **every full-stack feature is some variation of this diagram.**

<div class="remember">Remember: "full-stack" is just two programs that trust each other enough to exchange JSON over HTTP. All the rest &mdash; frameworks, libraries, patterns &mdash; exists to make that exchange <em>pleasant, reliable, secure, and maintainable.</em></div>
