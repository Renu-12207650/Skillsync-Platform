# SkillSync — Project Guide & Interview Kit

> A peer-to-peer skill exchange platform built as a 9-service Spring Cloud
> microservice system with a Vite + React frontend, Docker-orchestrated,
> observability-instrumented, and AI-augmented (Nikki + Elaichi chatbots).

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [High-Level Architecture](#2-high-level-architecture)
3. [Technology Stack — Why Each Piece](#3-technology-stack--why-each-piece)
4. [Service Catalog](#4-service-catalog)
5. [Cross-Cutting Concerns](#5-cross-cutting-concerns)
6. [Data Model](#6-data-model)
7. [Frontend Architecture](#7-frontend-architecture)
8. [End-to-End Workflows](#8-end-to-end-workflows)
9. [AI Sub-System (Nikki + Elaichi)](#9-ai-sub-system-nikki--elaichi)
10. [DevOps & Deployment](#10-devops--deployment)
11. [Observability Stack](#11-observability-stack)
12. [Security Model](#12-security-model)
13. [Trade-offs & Design Decisions](#13-trade-offs--design-decisions)
14. [Interview Q&A Bank](#14-interview-qa-bank)
15. [Glossary](#15-glossary)

---

## 1. Executive Summary

**SkillSync** is a learning marketplace where users exchange skills peer-to-peer
instead of consuming pre-recorded courses. Each user can act as a **Learner**
(books sessions with mentors) or a **Mentor** (teaches what they know). An
**Admin** governs the platform, and a single **Developer** super-admin
(`renudhankhar8559@gmail.com`) bootstraps everything.

**Key product features**

| Feature | Where it lives |
|---|---|
| Two-step registration (basic → role-specific profile) | auth-service + user-service + frontend `/onboarding` |
| Email OTP login for the developer (2FA) | auth-service `/auth/login` + `/auth/verify-otp` |
| 6-digit password reset code over email | auth-service `/auth/forgot-password` |
| Skill catalog (admin-curated) | skill-service |
| Mentor matching + 1-on-1 session booking | mentor-service + session-service |
| Real-time notifications (event-driven) | notification-service + RabbitMQ |
| In-app helper bot **Nikki** (FAQ + admin ticket forwarding) | notification-service `/support` + frontend widget |
| General AI bot **Elaichi** (Groq LLM proxy) | notification-service `/chatbot` |
| Aggregated Swagger UI | api-gateway `/swagger-ui.html` |

---

## 2. High-Level Architecture

### 2.1 System Topology

```
                                 ┌────────────────────────────┐
                                 │     Browser (React SPA)    │
                                 │  http://localhost:8080     │
                                 │  http://localhost:5173 dev │
                                 └─────────────┬──────────────┘
                                               │ HTTPS / HTTP
                                               ▼
                              ┌────────────────────────────────────┐
                              │      Spring Cloud Gateway (9080)   │
                              │  • JWT validation                  │
                              │  • Header injection (X-User-*)     │
                              │  • Routing by path predicate       │
                              │  • Swagger aggregation             │
                              └────────────┬───────────────────────┘
                                           │ load-balanced via Eureka
              ┌────────────┬───────────────┼───────────────┬─────────────┐
              ▼            ▼               ▼               ▼             ▼
         ┌─────────┐  ┌──────────┐    ┌────────┐    ┌──────────┐   ┌─────────────┐
         │  Auth   │  │   User   │    │ Mentor │    │  Skill   │   │  Session    │
         │  9081   │  │   9082   │    │  9083  │    │   9084   │   │   9085      │
         └────┬────┘  └────┬─────┘    └───┬────┘    └─────┬────┘   └──────┬──────┘
              │            │              │               │               │
              ▼            ▼              ▼               ▼               ▼
         ╔══════════════════════════════════════════════════════════════════╗
         ║          MySQL 8.0  (port 3307, one schema per service)          ║
         ║  skillsync_auth_db • skillsync_user_db • skillsync_mentor_db     ║
         ║  skillsync_skill_db • skillsync_session_db • _notification_db    ║
         ╚══════════════════════════════════════════════════════════════════╝
                                           ▲
                                           │ events (session created, etc)
                                           │
                                  ┌────────┴───────┐
                                  │    RabbitMQ    │ (5672)
                                  └────────┬───────┘
                                           │
                                  ┌────────▼─────────┐
                                  │   Notification   │
                                  │      9088        │
                                  │   • DB-backed    │
                                  │   • SMTP (Gmail) │
                                  │   • Chatbot      │
                                  │   • Support      │
                                  └──────────────────┘

       ┌─────────────────── Service-discovery & config ───────────────────┐
       │     Eureka Server (9761)         Config Server (9888)            │
       └──────────────────────────────────────────────────────────────────┘

       ┌──────────────────────── Observability ───────────────────────────┐
       │  Zipkin (9411)  •  Prometheus (9090)  •  Loki (3100)  •  Grafana (3000)  │
       └──────────────────────────────────────────────────────────────────┘
```

### 2.2 Folder Hierarchy

```
SprintSkillSync/                             ← repo root
│
├── skillsync-parent/                        ← Maven BOM (versions for everything)
├── skillsync-common/                        ← shared lib (JWT helper, ServiceJwtFilter,
│                                              GlobalExceptionHandler, SwaggerConfig)
│
├── skillsync-eureka-server/                 ← service registry           [port 9761]
├── skillsync-config-server/                 ← centralised yaml config    [port 9888]
├── skillsync-api-gateway/                   ← edge router + JWT filter   [port 9080]
│
├── skillsync-auth-service/                  ← register/login/JWT/OTP     [port 9081]
├── skillsync-user-service/                  ← user profiles              [port 9082]
├── skillsync-mentor-service/                ← mentor application + listing [9083]
├── skillsync-skill-service/                 ← skill catalogue            [port 9084]
├── skillsync-session-service/               ← bookings + lifecycle       [port 9085]
├── skillsync-notification-service/          ← email + RabbitMQ + Nikki + Elaichi [9088]
│
├── skillsync-frontend/                      ← Vite + React 18 SPA
│   ├── src/
│   │   ├── core/         (api client, auth context, services)
│   │   ├── features/     (auth, dashboard, mentors, sessions, profile, admin, chatbot, onboarding, landing)
│   │   ├── layout/       (Shell, Sidebar, Topbar)
│   │   ├── shared/       (Button, Input, Card, Avatar, Toast…)
│   │   └── styles/index.css      ← aurora theme tokens
│   ├── nginx.conf                ← reverse-proxies API to gateway
│   └── Dockerfile                ← multi-stage: node build → nginx serve
│
├── docker-compose.yml             ← canonical stack
├── docker-compose.dev.yml         ← bind-mount overlay (fast iteration)
├── .env                           ← runtime secrets (Groq key, SMTP, dev email)
│
├── skillsync.ps1                  ← one-shot launcher
├── update.ps1                     ← incremental rebuild + restart
├── dev.ps1                        ← hot mode (mvn spring-boot:run on host)
├── test-everything.ps1            ← full beta test suite
├── tune-eureka.ps1                ← aggressive Eureka tuning patcher
└── seed-skills.ps1                ← seeds 35 starter skills
```

---

## 3. Technology Stack — Why Each Piece

### 3.1 Backend

| Layer | Technology | Why this and not alternatives |
|---|---|---|
| **Language / runtime** | Java 17 (Eclipse Temurin) | LTS; sealed classes, records, switch patterns; massive Spring ecosystem; team familiarity |
| **Framework** | Spring Boot 3.x | Convention-over-config; embedded server; first-class Spring Cloud + Cloud Gateway; instant production-readiness via Actuator |
| **Build** | Maven (multi-module + parent BOM) | Stable, declarative; parent pom = single place to bump versions across all 9 services |
| **Service registry** | Spring Cloud Netflix Eureka | Self-hostable, simple AP-style registry. Alternative: Consul (more features but extra ops cost), Kubernetes Services (only viable on K8s) |
| **Centralised config** | Spring Cloud Config Server | Single source of truth for app config. Could be replaced by Kubernetes ConfigMaps if migrating to K8s |
| **API gateway** | Spring Cloud Gateway (reactive WebFlux) | Reactive = better tail-latency under load than Zuul; native integration with Eureka load balancer; `GlobalFilter` for JWT validation |
| **Auth** | Spring Security 6 + JWT (jjwt) | Stateless tokens → no sticky sessions, services scale horizontally; JWT carries claims (`role`, `email`) → downstream services don't need to call auth-service for every request |
| **Persistence** | Spring Data JPA + Hibernate | Reduces boilerplate; one repo interface per aggregate; easy to swap impl |
| **Database** | MySQL 8.0 | Mature, free, good ops story. **One DB schema per service** (database-per-service pattern) — keeps services from coupling on shared tables |
| **Inter-service HTTP** | Spring Cloud OpenFeign | Declarative HTTP clients; integrates with Eureka for load balancing; example: notification-service → auth-service for email lookup |
| **Async messaging** | RabbitMQ | Durable + retry-able events; ideal for "session created → send email" type flows. Kafka would be overkill for this volume |
| **Email** | Spring Mail + Gmail SMTP | Built into Spring; low friction. Gmail app-passwords are sufficient for dev; production would swap to SendGrid / Postmark |
| **API docs** | Springdoc OpenAPI | Auto-generates Swagger UI per service; gateway aggregates into one dropdown. WebFlux variant for the gateway, MVC variant for services |
| **Observability — tracing** | Zipkin (via Micrometer Tracing Brave bridge) | Each request gets a trace ID propagated through gateway → service → service. One pane of glass for distributed debugging |
| **Observability — metrics** | Prometheus + Micrometer | `/actuator/prometheus` on every service, scraped by Prometheus, visualized in Grafana |
| **Observability — logs** | Loki + loki-logback-appender | Structured logs streamed to Loki; queryable in Grafana with the same labels (trace ID) used by Zipkin |
| **Boilerplate reduction** | Lombok | `@Data`, `@Builder`, `@RequiredArgsConstructor` — keeps DTOs tidy |
| **Validation** | Jakarta Bean Validation (`@Valid`, `@NotBlank`, etc.) | Annotations enforce contract at the controller boundary |

### 3.2 Frontend

| Layer | Technology | Why |
|---|---|---|
| **Library** | React 18 | Hooks, Suspense, large hiring pool; pairs naturally with the SPA + API gateway pattern |
| **Bundler / dev server** | Vite | Sub-second hot reload, ESM-native, no webpack config; built-in proxy for `/auth`, `/users`, etc. |
| **Routing** | React Router DOM v6 | Nested routes match the layout (Shell wraps protected pages); `useSearchParams` for ?token=…, etc. |
| **State** | React Context (`AuthContext`) + local state | Avoids the Redux/Zustand overhead — auth + user is the only true global; everything else is page-local |
| **HTTP** | Axios + interceptors | Token attached automatically; central place for 401 → redirect logic; per-call `_skipAuthRedirect` flag |
| **Styling** | Hand-rolled CSS variables (no Tailwind, no CSS-in-JS) | Theme tokens (`--brand-500`, `--text-primary`) live in one file; light + dark themes via `[data-theme=…]`; avoids runtime style cost |
| **Typography** | Inter (UI) + Fraunces (display) | Display serif gives the "magazine-y" feel of skill-swap sites; Inter handles body/UI |
| **Testing** | Vitest + Testing Library | Same DX as Jest, faster, native ESM |
| **Lint** | ESLint with React + hooks plugins | Catches dependency-array bugs and accessibility issues at PR time |
| **Build target (prod)** | Static `dist/` served by **Nginx** in Docker | Zero JS server; Nginx proxies `/auth`, `/users`, `/chatbot`, `/support`, etc. to the gateway |

---

## 4. Service Catalog

### 4.1 Hierarchy

```
Infrastructure layer
├── eureka-server          (registry)
└── config-server          (config)

Edge layer
└── api-gateway            (JWT filter + routing)

Domain services (each owns its DB)
├── auth-service           ─ auth_users · password_reset_tokens · login_otps
├── user-service           ─ user_profiles
├── mentor-service         ─ mentor_profiles
├── skill-service          ─ skills
├── session-service        ─ sessions
└── notification-service   ─ notifications · support_messages
                            (also hosts /chatbot/ask + RabbitMQ consumers)
```

### 4.2 Per-service responsibilities

| Service | Path prefix at gateway | Owns | Key endpoints |
|---|---|---|---|
| `auth-service` | `/auth/**` | identity, JWT, password reset, OTP | POST `/register`, `/login`, `/verify-otp`, `/forgot-password`, `/reset-password`, `/admin/users` (CRUD), GET `/me/is-developer`, `/internal/email/{userId}` |
| `user-service` | `/users/**` | user profile (bio, links, image) | POST `/`, GET `/me`, PUT `/me`, GET `/{authUserId}`, GET `/` (admin) |
| `mentor-service` | `/mentors/**` | mentor application + status | POST `/apply`, GET `/`, GET `/pending`, GET `/{id}`, PUT `/{id}/approve`, PUT `/{id}/reject` |
| `skill-service` | `/skills/**` | skill catalog | GET `/`, GET `/{id}`, GET `/category/{c}`, POST/PUT/DELETE (admin) |
| `session-service` | `/sessions/**` | bookings, accept/reject, schedule | POST `/`, GET `/my`, PUT `/{id}/accept`, PUT `/{id}/reject`, PUT `/{id}/cancel` |
| `notification-service` | `/notifications/**`, `/support/**`, `/chatbot/**` | in-app notifications, email, support tickets, AI bot proxy | GET `/notifications/my`, POST `/support/messages`, GET `/support/messages` (admin), POST `/chatbot/ask` |
| `api-gateway` | (everything) | JWT validation, routing, header injection, swagger aggregation | every public route maps here |
| `eureka-server` | n/a | service registry dashboard at `:9761` | n/a |
| `config-server` | n/a | serves YAML over HTTP | `GET /{app}/{profile}` |

---

## 5. Cross-Cutting Concerns

### 5.1 Authentication flow (JWT)

```
                         ┌─────────────────────┐
   1. POST /auth/login   │  Browser            │
   ◀─────────────────────┤                     │
   2. {accessToken,      │  stores in          │
      refreshToken}      │  localStorage       │
                         └─────────┬───────────┘
                                   │ axios interceptor adds
                                   │   Authorization: Bearer <jwt>
                                   ▼
                         ┌─────────────────────┐
                         │   API Gateway       │
                         │ JwtAuthenticationFilter
                         │ • parses JWT
                         │ • validates HS256 signature
                         │ • injects headers:
                         │     X-User-Id   = sub
                         │     X-User-Role = role claim
                         │     X-User-Email = email claim
                         └─────────┬───────────┘
                                   ▼
                         ┌─────────────────────┐
                         │   Downstream svc    │
                         │  ServiceJwtFilter   │
                         │  reads X-User-Id   │
                         │  populates Spring   │
                         │  SecurityContext    │
                         │  for @PreAuthorize  │
                         └─────────────────────┘
```

**Why this design**

- **Stateless** — no session store, services scale horizontally
- **Single validation point** — only the gateway holds the JWT secret; downstream services trust the gateway's headers (this is fine because the network is private)
- **`@PreAuthorize("hasRole('ROLE_ADMIN')")` works** because `ServiceJwtFilter` reconstructs an `Authentication` object from the X-User-Role header

### 5.2 Open vs. protected endpoints (gateway whitelist)

```java
private static final List<String> OPEN_ENDPOINTS = List.of(
    "/auth/register",
    "/auth/login",
    "/auth/verify-otp",
    "/auth/refresh",
    "/auth/forgot-password",
    "/auth/reset-password",
    "/v3/api-docs",
    "/swagger-ui",
    "/actuator"
);
```

Anything else without a valid `Authorization: Bearer …` returns 401.

### 5.3 OTP login (developer 2FA)

```
   POST /auth/login {email, password}
              │
              ▼
   email == DEVELOPER_EMAIL ?
              │ yes
              ▼
   • generate 6-digit code
   • store in login_otps with 10-min expiry
   • email it
   • return {otpRequired: true, email}      ← no tokens yet
              │
              ▼
   POST /auth/verify-otp {email, code}
              │
              ▼
   • find code in login_otps
   • check unused + not expired
   • mark used
   • issue tokens                            ← real login completes
```

### 5.4 Password reset

```
POST /auth/forgot-password {email}
   │
   ▼ generate 6-digit token, save to password_reset_tokens
   ▼ EMAIL the code (subject: "Reset your SkillSync password")
   ▼ return {message: "Reset code sent to …"}

User submits  email + 6-digit code  +  new password
   │
   ▼ POST /auth/reset-password {token: "<email>:<code>", newPassword}
   ▼ split into email and code
   ▼ look up token, verify not used + not expired
   ▼ bcrypt-encode the new password, save user
   ▼ mark token used
```

---

## 6. Data Model

### 6.1 One database per service

Each service owns its own MySQL schema. Cross-service joins are *forbidden*;
when one service needs another's data it goes via HTTP (Feign) or events
(RabbitMQ). This is the **Database-per-Service** pattern from microservice
canon.

### 6.2 Key tables (abridged)

```
auth_users                   user_profiles                mentor_profiles
─────────────                 ─────────────                ───────────────
 id (PK)                       id (PK)                      id (PK)
 full_name                     auth_user_id (FK*)           auth_user_id (FK*)
 email (UNIQUE)                full_name                    bio
 password (bcrypt)             bio                          years_of_experience
 role (enum)                   profile_image_url            hourly_rate
 enabled                       linkedin_url                 status (PENDING / ACTIVE / REJECTED)
 created_at                    github_url                   skill_ids (CSV)
                               created_at                   languages
                                                            created_at

skills                        sessions                     notifications
──────                         ────────                     ─────────────
 id (PK)                       id (PK)                      id (PK)
 name (UNIQUE)                 mentor_id                    user_id
 category                      learner_id                   type
 description                   skill_id                     title
 created_at                    session_date_time            message
                               duration_minutes             read
                               topic                        created_at
                               status (REQUESTED/ACCEPTED/COMPLETED/CANCELLED)
                               created_at

password_reset_tokens         login_otps                   support_messages
─────────────────────          ──────────                   ────────────────
 id (PK)                       id (PK)                      id (PK)
 token (6-digit, UNIQUE)       email                        user_id
 user_id                       code (6-digit)               user_email
 expires_at (now + 30m)        expires_at (now + 10m)       user_full_name
 used (bool)                   used (bool)                  subject, message
                                                            status (OPEN / RESOLVED)
                                                            created_at, resolved_at
                                                            admin_note
```

> **(FK\*)** — logical foreign key. There is **no actual** FK constraint
> across schemas; it would couple service deployments. Integrity is enforced
> at the application layer.

---

## 7. Frontend Architecture

### 7.1 Folder layout (with intent)

```
src/
├── core/
│   ├── api/
│   │   └── client.js            ← single axios instance; interceptors
│   ├── auth/
│   │   ├── AuthContext.jsx      ← user state, login/register/logout, OTP completion
│   │   ├── guards.jsx           ← <ProtectedRoute roles=…>, <PublicOnly>
│   │   └── tokenStorage.js      ← localStorage helpers
│   └── services/                ← thin wrappers; each owns one path prefix
│       ├── authService.js
│       ├── userService.js
│       ├── mentorService.js
│       ├── skillService.js
│       ├── sessionService.js
│       ├── notificationService.js
│       ├── supportService.js
│       └── chatbotService.js
│
├── features/
│   ├── landing/                  ← public marketing page
│   ├── auth/                     ← Login, Register, ForgotPassword, ResetPassword, AuthLayout
│   ├── onboarding/               ← post-register profile completion
│   ├── dashboard/                ← role-aware DashboardRouter + Learner/Mentor/AdminDashboard
│   ├── mentors/                  ← Browse, Profile, MentorApply
│   ├── sessions/                 ← Sessions list, BookSessionModal
│   ├── profile/                  ← editable user profile
│   ├── notifications/
│   ├── admin/                    ← AdminConsole (overview, mentors, users, skills, support, invite)
│   └── chatbot/                  ← ChatbotWidget, NikkiBot, ElaichiBot, faqs.js
│
├── layout/                       ← Shell (sidebar + topbar + outlet)
├── shared/components/            ← Button, Input, Card, Avatar, Spinner, Toast, Modal, Badge, EmptyState
└── styles/index.css              ← all design tokens
```

### 7.2 Routing tree

```
/                              ← LandingPage      (public)
/auth/login                    ← LoginPage        (PublicOnly)
/auth/register                 ← RegisterPage     (PublicOnly)
/auth/forgot-password          ← ForgotPassword   (PublicOnly)
/auth/reset-password           ← ResetPassword    (PublicOnly)
/onboarding                    ← OnboardingPage   (Protected)
   ┌─ Shell wrapper (sidebar + topbar) ────────────────┐
   │  /dashboard                ← DashboardRouter      │  (role-aware)
   │  /dashboard/learner        ← LearnerDashboard     │
   │  /dashboard/mentor         ← MentorDashboard      │
   │  /dashboard/admin          ← AdminDashboard       │
   │  /mentors                  ← MentorBrowse         │
   │  /mentors/apply            ← MentorApplyPage      │
   │  /mentors/:id              ← MentorProfilePage    │
   │  /sessions                 ← SessionsPage         │
   │  /profile                  ← ProfilePage          │
   │  /notifications            ← NotificationsPage    │
   │  /admin                    ← AdminConsole         │  (role=ROLE_ADMIN)
   └────────────────────────────────────────────────────┘
*                              ← NotFoundPage
```

### 7.3 Axios client (the most-touched piece)

```javascript
// src/core/api/client.js  (sketch)
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',  // empty → vite proxy in dev
  timeout: 20_000,
  headers: { 'Content-Type': 'application/json' }
});

apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error?.response?.status;
    if (status === 401 && !error.config?._skipAuthRedirect) {
      clearAccessToken();
      window.dispatchEvent(new CustomEvent('skillsync:unauthorized'));
    }
    error.userMessage = error?.response?.data?.message || error.message;
    return Promise.reject(error);
  }
);
```

`AuthContext` listens for `skillsync:unauthorized` and navigates to `/auth/login`
unless the user is already on a public auth page (so an unauthenticated `/skills`
prefetch on `/auth/register` doesn't kick the user out).

### 7.4 Vite proxy gotcha (we hit and fixed)

The dev proxy by default catches **every** GET starting with `/auth/*` —
including direct browser navigations to `/auth/login`. That broke React Router
on hard reload. Fix: a `bypass(req)` callback that returns `'/index.html'` when
`req.headers.accept` is `text/html`, so HTML navigations fall through to the
SPA shell while XHR/fetch calls proxy through to the gateway.

---

## 8. End-to-End Workflows

### 8.1 New learner sign-up

```
Browser                         Gateway        Auth-svc       User-svc      Skill-svc       Mailbox
   │   POST /auth/register {role: ROLE_LEARNER}
   ├──────────────────────────▶│ open endpoint   │
   │                          ├──────────────▶│
   │                          │              │ insert auth_users
   │                          │              │ issue JWT
   │   {accessToken, role: ROLE_LEARNER}
   │◀──────────────────────────┤
   │
   │ navigate /onboarding
   │   GET /skills (with token)
   ├──────────────────────────▶│  validate JWT  │              │
   │                          ├────────────────────────────▶│
   │ (skill chips)            │                              │
   │◀──────────────────────────┤
   │
   │   POST /users (bio, links, image)
   ├──────────────────────────▶│              │
   │                          ├──────────────────────────────▶│
   │                          │              │            insert user_profiles
   │ navigate /dashboard
```

### 8.2 Mentor application + admin approval

```
Mentor (after onboarding)     Mentor-svc    Admin       Mentor-svc      Notification-svc
   │  POST /mentors/apply
   ├────────────────────────▶│
   │                        │ status = PENDING
   │                        │
                           Admin opens /admin → Mentor approvals
                                       │
                                       │ PUT /mentors/{id}/approve
                                       ├────────────▶│
                                       │             │ status = ACTIVE
                                       │             │ publish RabbitMQ event
                                       │                              │
                                       │                              ├─ create Notification
                                       │                              ├─ send email
```

### 8.3 Booking a session (end-to-end)

```
Learner                   Gateway   Session-svc   Mentor-svc   RabbitMQ   Notification-svc   Mentor (recipient)
  │ POST /sessions {mentorId, …}
  ├──────────────────────▶│
  │                       ├──────▶│
  │                       │       │ insert sessions (status=REQUESTED)
  │                       │       │ Feign: GET /mentors/{id}        ← validates mentor is ACTIVE
  │                       │       ├────────▶│
  │                       │       │◀────────┤
  │                       │       │ publish "session.requested" event
  │                       │       │                  │
  │                       │       │                  ├──────────────▶│ consume
  │                       │       │                  │              │ insert notification
  │                       │       │                  │              │ send email
  │                       │       │                                                        ──email──▶
  │ {sessionId, status: REQUESTED}
  │◀──────────────────────┤
```

### 8.4 Developer login with email OTP

```
Browser                            Auth-svc                                Gmail
  │ POST /auth/login {dev-email, password}
  ├──────────────────────────────▶│
  │                              │ developer email detected
  │                              │ generate 6-digit OTP
  │                              │ persist to login_otps
  │                              │ async send via SMTP ───────────▶
  │ {otpRequired: true, email}
  │◀──────────────────────────────┤
  │ user enters code from email
  │ POST /auth/verify-otp {email, code}
  ├──────────────────────────────▶│
  │                              │ verify code, mark used
  │ {accessToken, refreshToken, role: ROLE_ADMIN}
  │◀──────────────────────────────┤
```

### 8.5 Forgot-password email flow (6-digit code)

```
ForgotPasswordPage                  Auth-svc                          Gmail
  │ POST /auth/forgot-password
  ├──────────────────────────────▶│
  │                              │ generate 6-digit code (with retry on collision)
  │                              │ insert password_reset_tokens
  │                              │ async send via SMTP ──────────▶
  │ {message: "Reset code sent to …"}
  │◀──────────────────────────────┤

User checks email, gets 6-digit code.
ForgotPasswordPage step 2 lets them type the code → navigate to /reset-password?email=…&code=…

ResetPasswordPage
  │ POST /auth/reset-password {token: "<email>:<code>", newPassword}
  ├──────────────────────────────▶│
  │                              │ split, validate code, bcrypt-encode pw
  │ 200 OK
  │◀──────────────────────────────┤
```

---

## 9. AI Sub-System (Nikki + Elaichi)

Both bots live in `notification-service` because that service already owns
the email + support pipeline.

### 9.1 Nikki — in-app helper

```
Nikki UI (frontend)
   │ matches user input against FAQs[] (pure client-side, no backend)
   │ shows answer + related questions
   │
   │ "Contact admins" button →
   │ POST /support/messages {subject, message}
   ├──────────▶ notification-service
                  │ persist support_messages row (OPEN)
                  │ async email admin@... ────────▶ inbox
                  │
                  │ Admin Console → Support inbox tab → Mark resolved
                  │ PUT /support/messages/{id}/resolve
```

### 9.2 Elaichi — general AI

```
Elaichi UI
   │ POST /chatbot/ask {message, history}
   ├──────────▶ notification-service ChatbotService
                  │ if OPENAI_API_KEY empty → demoReply()  (canned)
                  │ else → POST {OPENAI_BASE_URL}/chat/completions
                  │        Authorization: Bearer {apiKey}
                  │        body: {model, messages: [system + history + user]}
                  │
                  │ Configurable for OpenAI OR Groq:
                  │   OPENAI_BASE_URL=https://api.groq.com/openai/v1
                  │   OPENAI_MODEL=llama-3.3-70b-versatile
                  │   OPENAI_API_KEY=gsk_…
   │ {reply, model, demoMode}
   │◀──────────┤
```

**Why one OpenAI-compatible base URL?** OpenAI's chat-completions schema is
the de-facto standard — Groq, Together, Anyscale, Fireworks all expose the
exact same shape. By making `base-url` configurable, we can swap the model
provider without touching code.

---

## 10. DevOps & Deployment

### 10.1 Three iteration speeds

```
┌────────────────┬──────────────────────────────┬──────────────────┐
│   Speed tier   │            Command           │      When        │
├────────────────┼──────────────────────────────┼──────────────────┤
│ 1. Cold start  │  .\skillsync.ps1             │ first time, OR   │
│  (~8 min)      │  (full mvn package +         │ skillsync-common │
│                │   docker compose --build)    │ changed          │
├────────────────┼──────────────────────────────┼──────────────────┤
│ 2. Reuse JARs  │  .\skillsync.ps1 -SkipBuild  │ no Java changes  │
│  (~30s)        │                              │                  │
├────────────────┼──────────────────────────────┼──────────────────┤
│ 3. Fast mode   │  .\skillsync.ps1 -Fast       │ everyday         │
│  (~10s after   │  (uses docker-compose.dev.yml│ iteration —      │
│   first run)   │   bind-mount overlay)        │ build images     │
│                │                              │ ONCE, reuse fwd  │
├────────────────┼──────────────────────────────┼──────────────────┤
│ Incremental    │  .\update.ps1 auth-service   │ changed one      │
│ patch          │  (mvn -T 4 -o + restart)     │ file in one svc  │
└────────────────┴──────────────────────────────┴──────────────────┘
```

### 10.2 Why bind-mounts beat image rebuilds

The Dockerfile is single-stage:
```dockerfile
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY target/skillsync-auth-service-1.0.0.jar app.jar
ENTRYPOINT ["java", "-jar", "app.jar"]
```

In `docker-compose.dev.yml` we add:
```yaml
auth-service:
  volumes:
    - ./skillsync-auth-service/target/skillsync-auth-service-1.0.0.jar:/app/app.jar:ro
```

Every restart re-runs the entrypoint, picking up whatever JAR is on disk
*right now*. No image rebuild, no docker layer churn → minutes saved per cycle,
gigabytes of disk saved per week.

### 10.3 Eureka tuning (already applied)

| Knob | Default | Tuned | Why |
|---|---|---|---|
| `lease-renewal-interval-in-seconds` (client) | 30 | 5 | Heartbeat 6× more often |
| `lease-expiration-duration-in-seconds` | 90 | 10 | Drop dead instances 9× faster |
| `registry-fetch-interval-seconds` (client) | 30 | 5 | Clients see new services in 5s |
| `eviction-interval-timer-in-ms` (server) | 60 000 | 5 000 | Server eviction sweep |
| `response-cache-update-interval-ms` (server) | 30 000 | 5 000 | Registry view refresh |

End-to-end registration time: **~100s → ~15s**.

### 10.4 Environment / secrets

A `.env` at repo root, consumed by docker-compose:

```
OPENAI_API_KEY=gsk_…              ← Groq Cloud
OPENAI_BASE_URL=https://api.groq.com/openai/v1
OPENAI_MODEL=llama-3.3-70b-versatile
ADMIN_EMAIL=renudhankhar8559@gmail.com
DEVELOPER_EMAIL=renudhankhar8559@gmail.com
MAIL_USERNAME=renudhankhar8559@gmail.com
MAIL_PASSWORD=<gmail-app-password>
```

`.gitignore` excludes `.env` so secrets never land in git.

---

## 11. Observability Stack

```
                    Application code (every service)
                              │
            ┌─────────────────┼─────────────────────┐
            │                 │                     │
            ▼                 ▼                     ▼
     SLF4J + Logback     Micrometer            Brave Tracing
            │             metrics                  │
            │                 │                     │
            ▼                 ▼                     ▼
       Loki appender   /actuator/prometheus   POST /api/v2/spans
            │                 │                     │
            ▼                 ▼                     ▼
         Loki             Prometheus              Zipkin
                              │
                              └─────────┐
                                        ▼
                                    Grafana  ← single pane of glass
                                    (dashboards over Loki, Prometheus, Tempo/Zipkin)
```

- **Why Zipkin over Jaeger?** Lighter, single binary, easier to demo. Both
  speak the same OpenTelemetry-compatible format via Brave.
- **Why Loki over ELK?** Loki indexes labels not log content — much smaller
  storage footprint; queryable in the same Grafana UI as metrics + traces.
- **Trace ID continuity** — Brave injects `X-B3-TraceId` headers automatically
  so a trace ID emitted by gateway propagates through Feign calls.

---

## 12. Security Model

```
┌────────────────────────────────────────────────────────────────────┐
│                        Trust boundary                              │
│  ┌──────────┐                                                      │
│  │ Browser  │ ◀── only sees JWT, not the secret                   │
│  └────┬─────┘                                                      │
│       │ HTTPS in prod                                              │
└───────┼────────────────────────────────────────────────────────────┘
        ▼
┌────────────────────────────────────────────────────────────────────┐
│                      Internal docker network                       │
│                                                                    │
│  Gateway ── HMAC-SHA256 verifies JWT, injects X-User-* headers     │
│     │                                                              │
│     ▼ (no JWT to pass on; downstream trusts headers)               │
│  Service                                                           │
│                                                                    │
│  Roles: ROLE_LEARNER, ROLE_MENTOR, ROLE_ADMIN                     │
│  Method security: @PreAuthorize("hasRole('ROLE_ADMIN')")          │
│                                                                    │
│  Special: developer email = renudhankhar8559@gmail.com             │
│           - auto-promoted to ROLE_ADMIN on register                │
│           - login requires email OTP (2FA)                         │
│           - cannot be deleted by anyone                            │
└────────────────────────────────────────────────────────────────────┘
```

### Hardening checklist (what's in / what's missing)

| Concern | Status |
|---|---|
| Passwords bcrypt-encoded | ✓ |
| JWT signed with HS256 + secret | ✓ |
| Stateless sessions (no cookie store) | ✓ |
| CSRF disabled (we use bearer tokens) | ✓ |
| OTP for high-privilege login | ✓ |
| Public ROLE_ADMIN registration blocked | ✓ |
| Reset tokens single-use + 30-min expiry | ✓ |
| Self-deletion blocked, developer undeletable | ✓ |
| HTTPS termination | (would be at the load balancer in prod) |
| Rate limiting | (not implemented — would add at gateway) |
| Refresh token rotation | (not implemented — possible follow-up) |
| Secrets in .env file | (would move to Vault/Secrets Manager in prod) |

---

## 13. Trade-offs & Design Decisions

### 13.1 Why microservices for a small product?

This was a deliberate learning project. For a real ~5-feature product the
"right" answer would be a modular monolith. We accepted the operational cost
of 9 services to demonstrate competence with Spring Cloud. The line we
defended: **one service per bounded context that has independent persistence
and lifecycle**.

### 13.2 Why a separate Eureka + Config Server (not Consul/K8s)?

Local-first dev: Eureka + Config Server run as plain Java processes via
docker-compose. No Kubernetes cluster required. If we deployed to K8s, both
would be replaced by native Service + ConfigMap.

### 13.3 Database-per-service vs. shared DB?

Each service owns its own MySQL **schema** (not a separate MySQL instance —
that would multiply infra cost). They use the same MySQL container with
distinct schemas, which keeps deployments simple while preserving the contract
that "no service touches another's tables".

### 13.4 Why JWT (vs. opaque session tokens)?

- **Pros**: stateless, claims travel with the request, no introspection RPC
- **Cons**: revocation is hard. We compensate by short-lived access tokens (15 min) + refresh.

### 13.5 Why an OpenAI-compatible API for Elaichi?

The same code talks to OpenAI, Groq, Anyscale, Together — anyone who
re-implements the `/v1/chat/completions` schema. We default to Groq because
it's free-tier-generous and orders of magnitude faster than OpenAI for
similar-quality models.

### 13.6 Why was Vite chosen over CRA/Next.js?

- **vs CRA**: CRA is sunset; Vite has zero-config ESM dev with sub-second HMR.
- **vs Next.js**: We don't need SSR/SSG; the SPA is rendered client-side and
  hydrates against the gateway. Adding Next.js would force a Node runtime and
  another moving part.

### 13.7 Why no Redux / Zustand?

The only true global state is "who's the user". `AuthContext` covers it.
Everything else is local to a route or hydrated from the API on mount. Adding
a global store would be premature complexity.

---

## 14. Interview Q&A Bank

### A. Architecture

**Q: Walk me through what happens when a learner clicks "Book session".**
A:
1. The React `BookSessionModal` collects fields (mentor id, time, topic).
2. `sessionService.book(...)` POSTs to `/sessions`. Axios interceptor attaches the JWT.
3. Vite dev proxy (or Nginx in prod) forwards to gateway:9080.
4. Gateway's `JwtAuthenticationFilter` validates the JWT, extracts `userId`/`role`/`email` claims, sets them as headers, forwards to `session-service` (resolved via Eureka load balancer).
5. `session-service` validates input, calls `mentor-service` over Feign to confirm the mentor is `ACTIVE`, persists a `sessions` row (status `REQUESTED`), publishes a `session.requested` event to RabbitMQ.
6. `notification-service` consumes the event, inserts a `notifications` row, sends an email via Spring Mail to the mentor.
7. Gateway returns the response to the browser; React updates the session list optimistically.

**Q: How does service discovery work?**
A: Each service starts a Eureka client, sends a heartbeat every 5 seconds (tuned from default 30s), and registers under its `spring.application.name`. The gateway's load balancer subscribes to the registry and resolves `lb://skillsync-auth-service` to a real `host:port`. We tuned `eviction-interval-timer-in-ms`, `response-cache-update-interval-ms`, and `lease-expiration-duration-in-seconds` to make registration end-to-end ~15s instead of ~100s.

**Q: How does inter-service auth work?**
A: We don't propagate the JWT between services. The gateway is the only JWT validator. After validation, it injects `X-User-Id`, `X-User-Role`, and `X-User-Email` headers. Downstream services use a `ServiceJwtFilter` (in `skillsync-common`) that reads those headers and reconstructs Spring Security's `Authentication` object so `@PreAuthorize` works. This works because the docker network is a closed trust boundary.

### B. Spring & Java

**Q: Why Spring Cloud Gateway over Zuul?**
A: Gateway is reactive (Project Reactor / Netty), Zuul 1 is blocking (Servlet). Under burst load Gateway holds latency tail much better. Gateway also has a cleaner DSL for predicates and filters and is the project Spring is investing in.

**Q: Why use OpenFeign instead of WebClient?**
A: Declarative interfaces — much less boilerplate than building HTTP calls manually, and it integrates with Eureka load balancing out of the box. WebClient is more flexible (streaming, custom timeouts) but for simple CRUD-style RPCs, Feign wins on readability.

**Q: How do you handle JPA + microservices when a query needs data across services?**
A: We forbid cross-schema joins. If `session-service` needs the mentor's name, it makes a Feign call to `mentor-service`. For high-traffic reads, we'd cache the response in Redis. For analytical queries, we'd ship events into a warehouse via a CDC/event pipeline.

### C. Frontend

**Q: How does the frontend handle 401 responses?**
A: The axios response interceptor watches for `status === 401` and (unless the call set `_skipAuthRedirect`) clears local storage and dispatches a `skillsync:unauthorized` event. `AuthContext` listens for that and navigates to `/auth/login`. The interceptor also normalises the error message into `error.userMessage` so components can show a toast without parsing the raw response.

**Q: How does the role-based dashboard work?**
A: `<DashboardRouter>` reads the user's role from `AuthContext` and renders one of three components: `LearnerDashboard`, `MentorDashboard`, `AdminDashboard`. Routes like `/dashboard/learner` exist as direct entry points so the developer (always ROLE_ADMIN) can preview every role's view.

**Q: Why CSS variables instead of Tailwind?**
A: For a small surface area (~30 screens), defining tokens in one file (`styles/index.css`) and using semantic class names is simpler than learning a utility framework. We can swap themes by toggling `data-theme="light"` on `<html>`. There's no build-time CSS purging needed.

### D. DevOps

**Q: Why bind-mount JARs in dev?**
A: The single-stage Dockerfile copies `target/*.jar` into the image. Without bind mounts, every code change requires `docker build`, which churns layers and burns disk. With a bind mount of `target/<svc>.jar` over `/app/app.jar`, `docker compose restart <svc>` re-runs the entrypoint and picks up the new JAR — image stays untouched.

**Q: How would you migrate this to Kubernetes?**
A:
- Eureka → K8s Services (DNS-based service discovery)
- Config Server → ConfigMaps + Secrets
- API Gateway → keep it (or replace with an Ingress Controller + Spring Cloud Gateway as a sidecar pattern)
- MySQL → managed RDS / Cloud SQL
- RabbitMQ → managed (CloudAMQP / Amazon MQ)
- One Helm chart per service; values for each environment
- Horizontal Pod Autoscaler on metrics from Micrometer/Prometheus

**Q: How is observability wired?**
A: Three independent pillars converge in Grafana:
- **Metrics**: Micrometer → `/actuator/prometheus` → Prometheus scrapes → Grafana.
- **Logs**: Logback → loki4j appender → Loki → Grafana.
- **Traces**: Brave bridge sends spans to Zipkin → Grafana (via Zipkin or Tempo data source).
The trace ID is the join key across all three.

### E. Security

**Q: Why is the developer email special-cased?**
A: It's a "break-glass" account hard-coded so we can always bootstrap admins. Public registration as `ROLE_ADMIN` is rejected; only the developer email can mint admins. To prevent credential theft from being game-over, the developer login requires a 6-digit email OTP — even a stolen password is not enough.

**Q: How do you handle a leaked JWT?**
A: Two layers:
- Access tokens are short-lived (15 minutes), so a stolen token has limited reach.
- The refresh token is single-use and bound to the user; if we detect anomalous usage we'd invalidate it server-side.
- For total revocation, we'd add a deny-list cache (Redis) that the gateway checks on each request. We didn't implement this because the project is dev-stage.

**Q: Why bcrypt and not Argon2?**
A: Argon2 is the modern best practice. Bcrypt is acceptable for now because Spring Security ships a `BCryptPasswordEncoder` out of the box and its work factor is tunable. In production we'd run a migration to Argon2id.

### F. AI bots

**Q: How is Elaichi protected from prompt injection?**
A: It's not — that's a known limitation. The current system prompt asks the model to refuse private/illegal queries, but a determined user can jailbreak via creative framing. Mitigations we'd add:
- Output classifier (a smaller LLM) that flags policy violations.
- Per-user rate limiting (already partly enforced by the auth requirement).
- Logging every Q&A for audit.

**Q: Why have two bots (Nikki + Elaichi)?**
A: Different jobs:
- **Nikki** answers from a closed FAQ corpus and forwards real issues to humans. She's deterministic, cheap, and gives us a paper trail (`support_messages`).
- **Elaichi** is open-ended general help. She uses Groq (Llama 3.3 70B) for genuine reasoning. The cost trade-off justifies splitting them.

### G. Testing

**Q: How would you write integration tests for this?**
A:
- **Unit**: JUnit 5 + Mockito for service classes.
- **Slice tests**: `@WebMvcTest` for controllers, `@DataJpaTest` for repos.
- **Service-level integration**: `@SpringBootTest` with TestContainers spinning up a real MySQL.
- **Contract tests**: Spring Cloud Contract or Pact between the gateway and each downstream.
- **End-to-end**: the existing `test-everything.ps1` hits the running stack via the gateway. For CI, we'd containerize this in a docker-compose-driven GitHub Action.

---

## 15. Glossary

| Term | Meaning |
|---|---|
| **JWT** | JSON Web Token. Self-contained signed token carrying claims like `sub`, `role`, `email`. |
| **HMAC-SHA256** | Symmetric signature algorithm used for JWTs in this project. The same secret signs and verifies. |
| **Eureka** | Netflix's service registry. Services register themselves; clients fetch the registry. |
| **Config Server** | Spring Cloud component that serves application config over HTTP. |
| **Feign** | Declarative HTTP client; you write a Java interface and Spring generates the impl. |
| **RabbitMQ** | AMQP broker. Producers publish to exchanges, consumers bind queues with routing keys. |
| **Bind mount** | Mounting a host file/folder into a container. Changes on the host appear instantly inside the container. |
| **Micrometer** | Vendor-neutral metrics façade for Spring Boot. Default registry exports to Prometheus. |
| **Brave** | Zipkin's tracing instrumentation. Wires trace IDs through HTTP and AMQP. |
| **OTP** | One-Time Password. 6-digit code emailed for the developer login. |
| **Aurora theme** | This project's dark UI palette — deep midnight base with shifting gradients. |

---

*Last refreshed: April 2026 · Maintained alongside the codebase. If you change*
*architecture, update this file in the same PR.*
