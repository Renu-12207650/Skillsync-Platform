# SkillSync Frontend

A modern, glassmorphism-themed Single Page Application built with **Vite + React 18** that ties the SkillSync microservices together into one cohesive product.

The user only ever opens **one URL** — the Nginx container that ships this app reverse-proxies every API call to the Spring Cloud Gateway, so there is no separate frontend / backend port to think about.

---

## What's inside

| Area | Tech |
|------|------|
| Framework | Vite 5 + React 18 (JSX) |
| Routing | react-router-dom v6 |
| HTTP | axios with JWT request interceptor |
| State | React Context for auth, component-local state for everything else |
| Styling | Hand-rolled CSS tokens · glassmorphism dark theme |
| Tests | Vitest + Testing Library (jsdom) |
| Coverage | v8 → LCOV (consumed by SonarQube) |
| Container | Multi-stage Dockerfile, served by Nginx |

### User flows wired end-to-end

* Register / Login / Logout
* **Forgot password / Reset password** (newly added to `auth-service`)
* Learner dashboard with **skill-based mentor recommendations**
* Mentor discovery with filters (skill, min experience, name search)
* Mentor profile page
* Apply to become a mentor
* Multi-step session booking modal
* Sessions list (learner & mentor views) with accept / reject / cancel / complete
* Mentor dashboard with pending request queue
* Admin console: pending mentor approvals, user list, skill catalog CRUD
* Notifications bell with polling + dedicated inbox page
* Profile editor with skill-interest picker

Per the requirements, **ratings, prices, and learning groups are intentionally not surfaced in the UI**, even though the underlying data exists in the backend.

---

## Running it

### Option 1 — full stack with one command (recommended)

From the repo root:

```bash
docker-compose up --build
```

Then open **http://localhost:8080** — the SPA. The Nginx in the `frontend` container proxies `/auth`, `/users`, `/mentors`, `/skills`, `/sessions`, `/notifications` straight to `api-gateway:9080`, so you never have to think about CORS or two terminals.

Other useful URLs while it's running:

| Service | URL |
|---------|-----|
| API Swagger UI | http://localhost:9080/swagger-ui.html |
| Eureka | http://localhost:9761 |
| RabbitMQ admin | http://localhost:15672 (guest / guest) |
| Grafana | http://localhost:3000 |

### Option 2 — frontend only, in dev mode

```bash
cd skillsync-frontend
npm install
npm run dev
# → http://localhost:5173
```

`vite.config.js` contains a dev proxy pointed at `http://localhost:9080`, so make sure the API gateway is reachable on that port (e.g. via `docker-compose up api-gateway` along with its dependencies).

### Configuration

`.env`:

```
VITE_API_BASE_URL=                         # leave empty to use same-origin (recommended)
VITE_NOTIFICATION_POLL_INTERVAL=30000      # bell polls every 30s
```

---

## Folder structure

```
src/
├── core/
│   ├── api/client.js              # axios instance + interceptors
│   ├── auth/
│   │   ├── AuthContext.jsx        # global auth provider
│   │   ├── guards.jsx             # ProtectedRoute / PublicOnly
│   │   └── tokenStorage.js        # session-storage wrapper
│   └── services/                  # one module per backend microservice
│       ├── authService.js
│       ├── userService.js
│       ├── mentorService.js
│       ├── skillService.js
│       ├── sessionService.js
│       └── notificationService.js
├── features/
│   ├── auth/                      # login / register / forgot / reset
│   ├── dashboard/                 # learner / mentor / admin dashboards
│   ├── mentors/                   # browse · profile · apply · matching logic
│   ├── sessions/                  # sessions list · multi-step booking modal
│   ├── notifications/             # full notification inbox
│   ├── admin/                     # admin console (mentor approvals · skills CRUD)
│   ├── profile/                   # edit profile + skill interests
│   ├── landing/                   # public marketing page
│   └── misc/                      # 404 etc
├── layout/                        # Shell · Sidebar · Topbar (with bell)
├── shared/
│   ├── components/                # Button · Input · Card · Modal · Toast · …
│   └── utils/format.js
├── styles/index.css               # design tokens + utility classes
├── App.jsx                        # route table
└── main.jsx                       # entry point
```

---

## Backend changes shipped alongside

To honour the case-study requirements without leaving holes in the backend, **`auth-service` was extended** with token-based password recovery:

* `PasswordResetToken` entity & repository
* `POST /auth/forgot-password` — generates a one-time token (returned in the response payload for demo purposes; logs it for ops)
* `POST /auth/reset-password` — consumes the token, updates the user's password

`mentor-service` already had the `hourlyRate` and `averageRating` fields, so no schema changes were needed there. Per the requirements the frontend doesn't surface those values to learners, but the data model is intact for future use.

The case-study sections about "Peer learning groups" and "Reviews & ratings" are intentionally **not** wired into the UI.

---

## Quality gates

```bash
npm run lint            # ESLint
npm run test            # Vitest unit tests
npm run test:coverage   # outputs coverage/lcov.info for Sonar
npm run sonar           # requires sonar-scanner in PATH
```

`sonar-project.properties` is configured to:

* Track sources under `src/`
* Pull coverage from `coverage/lcov.info`
* Exclude tests and build artifacts

The current test suite covers the parts most likely to harbor logic bugs:

* `features/mentors/matching.js` — the recommendation scoring
* `core/auth/tokenStorage.js` — session storage round-trip
* `shared/utils/format.js` — date / status helpers
* `shared/components/Button.jsx` — interaction smoke test

Build, tests, and coverage all pass clean (28 / 28 tests at the time of writing).

---

## Design notes

The look and feel is intentionally distinct from the screenshots in the case study — closer to Linear / Vercel than to Material 3.

* Deep navy / charcoal canvas with two big radial accent gradients (purple + teal)
* Frosted-glass surfaces (`backdrop-filter: blur`) for cards, sidebar, topbar
* `Sora` for display text, `Inter` for UI text, `JetBrains Mono` for code/tokens
* Rounded pill buttons with a soft brand glow
* Status chips coloured semantically (warning / success / danger / muted)

All theme values live as CSS custom properties in `src/styles/index.css`, so swapping the palette is a single-file change.
