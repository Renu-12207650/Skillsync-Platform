# SkillSync Platform 🚀

A scalable, cloud-native peer learning and mentorship platform built using **Spring Boot Microservices**, **React.js**, **Docker**, and **Spring Cloud**.

SkillSync connects learners with mentors, enables skill discovery, mentoring sessions, authentication, notifications, and personalized learning experiences through a modern distributed architecture.

---

## 🌟 Key Features

### 🔐 Authentication & Security

* JWT-based authentication and authorization
* Role-based access control (Admin, Mentor, Learner)
* Secure API Gateway filtering
* Password reset and OTP verification support

### 👤 User Management

* User registration and onboarding
* Profile management
* Skill tracking and personalization

### 🎯 Skill Discovery

* Browse and manage skills
* Search and filter capabilities
* Skill recommendation foundation

### 🧑‍🏫 Mentor Platform

* Mentor applications
* Mentor profile management
* Mentor discovery and matching

### 📅 Session Management

* Session booking workflow
* Session approval/rejection
* Session status tracking

### 🔔 Notification System

* Event-driven notifications
* RabbitMQ-based asynchronous communication
* Email notification support

### 🤖 AI & Support

* Chatbot integration
* Support ticket/message handling
* Intelligent user assistance

### 📊 Monitoring & Observability

* Prometheus metrics collection
* Grafana dashboards
* Centralized logging support

---

# 🏗️ System Architecture

The platform follows a distributed microservices architecture:

```text
                     ┌─────────────────┐
                     │ React Frontend  │
                     └────────┬────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │   API Gateway    │
                    └────────┬─────────┘
                             │
      ┌──────────────────────┼──────────────────────┐
      ▼                      ▼                      ▼

┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│ Auth Service│      │ User Service│      │Skill Service│
└─────────────┘      └─────────────┘      └─────────────┘

      ▼                      ▼                      ▼

┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│Mentor Svc   │      │Session Svc  │      │Notification │
└─────────────┘      └─────────────┘      │   Service   │
                                          └─────────────┘

                     ▼
          ┌────────────────────┐
          │ Eureka Discovery   │
          └────────────────────┘

                     ▼
          ┌────────────────────┐
          │ Config Server      │
          └────────────────────┘
```

---

# 🧩 Microservices

| Service              | Description                                 |
| -------------------- | ------------------------------------------- |
| API Gateway          | Single entry point and routing              |
| Auth Service         | Authentication, JWT, OTP                    |
| User Service         | User profile management                     |
| Skill Service        | Skill management                            |
| Mentor Service       | Mentor onboarding and discovery             |
| Session Service      | Session scheduling and lifecycle            |
| Notification Service | Notifications and messaging                 |
| Eureka Server        | Service discovery                           |
| Config Server        | Centralized configuration                   |
| Common Module        | Shared DTOs, security utilities, exceptions |

---

# 🛠️ Technology Stack

## Backend

* Java 
* Spring Boot
* Spring Security
* Spring Cloud Gateway
* Spring Cloud Config
* Netflix Eureka
* Spring Data JPA
* Hibernate
* MySQL
* RabbitMQ
* Maven

## Frontend

* React.js
* Vite
* Axios
* Context API

## DevOps & Infrastructure

* Docker
* Docker Compose
* Nginx
* Prometheus
* Grafana

## Testing

* JUnit 5
* Mockito
* Spring Boot Test

---

# 📂 Project Structure

```text
SkillSync-Platform
│
├── skillsync-api-gateway
├── skillsync-auth-service
├── skillsync-user-service
├── skillsync-skill-service
├── skillsync-mentor-service
├── skillsync-session-service
├── skillsync-notification-service
├── skillsync-config-server
├── skillsync-eureka-server
├── skillsync-common
├── skillsync-frontend
│
├── api-tests
├── docs
├── dummy-data
├── docker-compose.full.yml
└── README.md
```

---

# 🚀 Getting Started

## Prerequisites

* Java
* Maven 3.9+
* Node.js 18+
* Docker & Docker Compose
* MySQL
* RabbitMQ

---

## Clone Repository

```bash
git clone https://github.com/Renu-12207650/Skillsync-Platform.git
cd Skillsync-Platform
```

---

## Environment Setup

Create:

```bash
.env
```

using:

```bash
.env.example
```

and configure your credentials.

---

## Start Infrastructure

```bash
docker-compose -f docker-compose.full.yml up -d
```

---

## Start Backend Services

Example:

```bash
cd skillsync-eureka-server
mvn spring-boot:run
```

Start services in this order:

1. Eureka Server
2. Config Server
3. API Gateway
4. Remaining Microservices

---

## Start Frontend

```bash
cd skillsync-frontend
npm install
npm run dev
```

Frontend:

```text
http://localhost:5173
```

---

# 📈 Monitoring

### Grafana

```text
http://localhost:3000
```

### Prometheus

```text
http://localhost:9090
```

### Eureka Dashboard

```text
http://localhost:8761
```

---

# 🔒 Security Features

* JWT Authentication
* API Gateway validation
* Role-based authorization
* Password reset workflow
* OTP verification support
* Secure service-to-service communication

---

# 🧪 Testing

Run backend tests:

```bash
mvn test
```

Frontend tests:

```bash
npm test
```

---

# 🎯 Learning Outcomes

This project demonstrates:

* Microservices Architecture
* API Gateway Pattern
* Service Discovery
* Centralized Configuration
* Event-Driven Architecture
* JWT Security
* Docker Orchestration
* Monitoring & Observability
* Full-Stack Development

---

# 👨‍💻 Author

**Renu Kumari**

GitHub: https://github.com/Renu-12207650

---


