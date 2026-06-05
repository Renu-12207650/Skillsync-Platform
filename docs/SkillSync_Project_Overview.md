# SkillSync — Project Overview

This document summarizes the SkillSync project architecture, features, key concepts, and how the chatbot is integrated. Use this to present the project in interviews.

## 1. One-line elevator pitch
SkillSync is a mentor-learner platform that connects learners with experienced engineers through async chat and scheduled mentoring sessions, backed by microservices.

## 2. High-level architecture
- Frontend: React 18 + Vite, single-page application served by Nginx in production.
- Edge: Spring Cloud Gateway routes requests to services and performs JWT validation.
- Services: Modular microservices (auth, user, mentor, skill, session, notification), each with its own DB schema.
- Registry/Config: Eureka for service discovery; Spring Config Server for centralized config.
- Messaging: RabbitMQ used for events between services.
- Observability: Prometheus, Grafana, Loki, Zipkin.

## 3. Key flows
- Authentication: JWT issued by `auth-service` after login; API Gateway validates tokens on incoming requests.
- Mentor discovery & booking: Frontend queries `mentor-service` and `session-service` to browse mentors and request sessions.
- Notifications: `notification-service` handles in-app notifications and includes the chatbot proxy.

## 4. Chatbot (Elaichi & Nikki)
- Widget: Floating chat widget in the app shell (post-login). Two tabs: Nikki (rule-based FAQ) and Elaichi (AI).
- Nikki: Matches user queries against FAQ data and can forward messages to admins via `support-service`.
- Elaichi: Sends `{ message, history }` to `/chatbot/ask` on `notification-service`.
  - `notification-service` forwards prompts to an OpenAI-compatible API (configurable via `OPENAI_BASE_URL` and `OPENAI_API_KEY`).
  - If no API key present, Elaichi runs in demo mode returning canned replies so UI remains functional.
- Security: The system prompt instructs the model to refuse private or illegal queries; however, prompt injection is a known limitation.

## 5. Concepts used (brief)
- Microservices: Bounded contexts, independent deployability, own databases.
- API Gateway & Service Discovery: Centralized routing, security, and service discovery with Eureka.
- JWT Auth: Stateless auth tokens validated at the gateway.
- Event-driven messaging: RabbitMQ for events like `session.created` and `mentor.approved`.
- Observability: Centralized logging and metrics for debugging and monitoring.
- LLM integration: Proxying chat completions to an OpenAI-compatible endpoint with graceful demo fallback.

## 6. Configuration & deployment notes
- Environment variables controlling LLM: `OPENAI_API_KEY`, `OPENAI_BASE_URL`, `OPENAI_MODEL`.
- Docker-compose provided (`docker-compose.full.yml`) to run full stack locally.
- Services run on different ports and register with Eureka; API Gateway routes /chatbot/** to notification-service.

## 7. Demo talking points for interview
- Explain why a microservices approach (decoupling, teams, scaling).
- Show the chat widget and explain the two-bot model (Nikki vs Elaichi) and why demo mode exists.
- Discuss security considerations: JWT, protecting LLM from prompt injection, and mitigation ideas.
- Mention trade-offs: consistent UX vs operational overhead (many services), eventual consistency with events.

## 8. Files to point to during interview
- Frontend shell and widget: `skillsync-frontend/src/layout/Shell.jsx` and `skillsync-frontend/src/features/chatbot/ChatbotWidget.jsx`.
- Elaichi bot frontend + service: `skillsync-frontend/src/features/chatbot/ElaichiBot.jsx` and `skillsync-frontend/src/core/services/chatbotService.js`.
- Chatbot backend proxy: `skillsync-notification-service/src/main/java/in/skillsync/notification/service/ChatbotService.java` and `ChatbotController.java`.
- Gateway routing for chatbot: `skillsync-api-gateway/src/main/resources/application.yml` (look for `skillsync-chatbot` route).

---

Prepared for interview use. If you want, I can convert this to a PDF and place it in the `docs/` folder now.