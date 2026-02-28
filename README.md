# AccessCore | Backend Intern Assignment

Welcome to the **AccessCore** submission. This project is a robust, enterprise-ready task management system designed to demonstrate advanced proficiency in Node.js, Express, PostgreSQL, and scalable architectural patterns.

---

## 🚀 Project Overview

AccessCore is a secure platform that enables users to manage mission-critical tasks with role-based accessibility. It features a high-end React frontend and a standardized Express API following the **RESTful** design philosophy.

### Key Highlights:
- **Full CRUD**: Comprehensive task management with ownership enforcement.
- **RBAC**: Multi-role system (User/Admin) for hierarchical data access.
- **Premium UX**: Framer-motion driven UI with an obsidian-glass design system.
- **Standardized API**: Consistent JSON response formats and global error handling.

---

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Backend** | Node.js, Express.js |
| **Database** | PostgreSQL |
| **Authentication** | JWT (JSON Web Tokens), Bcrypt.js |
| **Documentation** | Swagger (OpenAPI 3.0) |
| **Frontend** | React, Vite, Framer Motion, Lucide Icons |
| **Security** | Helmet, CORS, Parameterized Queries |

---

## ⚙️ Installation & Setup

### 1. Prerequisites
- Node.js (v16+)
- PostgreSQL (Local or Cloud instance)

### 2. Database Initialization
Create a new database in PostgreSQL and run the schema:
```bash
cd backend
# Database configuration is handled via .env
node src/models/run-schema.js
```

### 3. Backend Setup
```bash
cd backend
npm install
npm start
```

### 4. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

---

## 🔑 Environment Variables

The backend requires a `.env` file in the `/backend` directory:

| Variable | Description | Example |
| :--- | :--- | :--- |
| `PORT` | Server Port | `5000` |
| `DB_USER` | Postgres Username | `postgres` |
| `DB_PASSWORD` | Postgres Password | `****` |
| `DB_NAME` | Database Name | `accesscore` |
| `JWT_SECRET` | Secret for Signing | `your_ultra_secret_key` |
| `JWT_EXPIRE` | Token Expiry | `30d` |

---

## 📑 API Endpoints & Documentation

### Interactive Docs
The API is fully documented using Swagger. Once the backend is running, visit:
👉 **[http://localhost:5000/api-docs](http://localhost:5000/api-docs)**

### Endpoint Summary (v1)

| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/v1/auth/register` | Create new account | Public |
| **POST** | `/api/v1/auth/login` | Obtain JWT token | Public |
| **GET** | `/api/v1/tasks` | Fetch user-specific tasks | JWT |
| **POST** | `/api/v1/tasks` | Deploy new objective | JWT |
| **PUT** | `/api/v1/tasks/:id` | Update task details | JWT + Owner |
| **DELETE** | `/api/v1/tasks/:id` | Purge task | JWT + Owner |
| **GET** | `/api/v1/admin/stats` | Global analytics | JWT + Admin |

---

## 🛡️ Security & Scalability

- **Stateless Auth**: JWT-based authentication ensures the backend can scale horizontally without session synchronization.
- **Injection Protection**: Direct use of parameterized SQL queries to prevent automated and manual injection attacks.
- **Password Safety**: Industry-standard salting and hashing using `Bcrypt`.
- **RBAC Middleware**: Permission checks are decoupled from logic, allowing for easy expansion of roles (e.g., Manager, Auditor).
- **Scalability Path**:
  - **Redis Caching**: Ready for integration to cache frequent task lookups.
  - **Docker Ready**: Structured for easy containerization with environment isolation.

---

## 🔮 Future Improvements

1.  **Unit & Integration Testing**: Implementing Jest/Supertest for 100% logic coverage.
2.  **WebSockets**: Real-time task updates across team members.
3.  **File Attachments**: AWS S3 integration for task-related documentation.
4.  **Multi-tenancy**: Support for organizational workspaces.

---
## Logging

Basic request logging implemented using Express middleware.
Sample logs available in /backend/logs/server.log

*This project was developed as part of a Backend Engineering Intern Assignment.*
