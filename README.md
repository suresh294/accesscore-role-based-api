# AccessCore — Role-Based Task Management API

[![CI](https://github.com/suresh294/accesscore-role-based-api/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/suresh294/accesscore-role-based-api/actions/workflows/ci.yml)

AccessCore is a full-stack task-management application built to demonstrate REST API development, JWT authentication, role-based access control, and PostgreSQL integration. It includes a React/Vite frontend and an Express backend with Swagger API documentation.

> **Demo status:** A verified public deployment URL has not been confirmed yet. Use the local setup below to run the project.

## Features

- Task creation, retrieval, updating, and deletion.
- JWT-based registration and login.
- User and administrator roles with protected admin functionality.
- Task ownership checks on user-facing task operations.
- PostgreSQL persistence with parameterized queries.
- Centralized API error handling and request logging.
- Interactive API documentation through Swagger UI.

## Technology Stack

| Area | Technology |
|---|---|
| Frontend | React, Vite, Framer Motion, Lucide Icons |
| Backend | Node.js, Express.js |
| Database | PostgreSQL |
| Authentication | JWT, bcryptjs |
| API documentation | Swagger / OpenAPI |
| Security middleware | Helmet, CORS |

## Prerequisites

- Node.js and npm
- PostgreSQL
- Git

## Local Setup

### 1. Clone the repository

```bash
git clone https://github.com/suresh294/accesscore-role-based-api.git
cd accesscore-role-based-api
```

### 2. Configure PostgreSQL and the backend

Create a PostgreSQL database, then create a `backend/.env` file using the environment variable names expected by the backend. The README's configuration reference is:

| Variable | Purpose |
|---|---|
| `PORT` | Backend port (commonly `5000`) |
| `DB_USER` | PostgreSQL username |
| `DB_PASSWORD` | PostgreSQL password |
| `DB_NAME` | Database name |
| `JWT_SECRET` | Secret used to sign tokens |
| `JWT_EXPIRE` | Token lifetime |

Use a unique, randomly generated JWT secret and keep `.env` files out of version control. Never paste production credentials into issues, screenshots, or documentation.

Initialize the schema using the project's script:

```bash
cd backend
npm install
node src/models/run-schema.js
npm start
```

### 3. Start the frontend

Open another terminal from the repository root:

```bash
cd frontend
npm install
npm run dev
```

Use the local URL printed by Vite. When the backend is running, the Swagger UI is expected at:

```text
http://localhost:5000/api-docs
```

If your local database or port configuration differs, update the backend environment accordingly.

## API Overview

| Method | Endpoint | Purpose | Access |
|---|---|---|---|
| POST | `/api/v1/auth/register` | Register an account | Public |
| POST | `/api/v1/auth/login` | Sign in and receive a JWT | Public |
| GET | `/api/v1/tasks` | List tasks available to the signed-in user | Authenticated |
| POST | `/api/v1/tasks` | Create a task | Authenticated |
| PUT | `/api/v1/tasks/:id` | Update a task | Authenticated / ownership checked |
| DELETE | `/api/v1/tasks/:id` | Delete a task | Authenticated / ownership checked |
| GET | `/api/v1/admin/stats` | Retrieve administrator statistics | Admin |

The running Swagger UI is the best place to confirm request schemas and response details for the current code.

## Current Scope and Next Steps

The repository is a portfolio project, not a claim of production readiness. Before using it with real users, review authentication and authorization paths, configure secure deployment secrets, add automated unit/integration tests, and run dependency/security checks. Before deploying publicly, review and resolve the dependency advisories reported by CI. The current audit still flags high-severity issues in frontend dependencies and development tooling; some fixes require major-version upgrades and should be tested separately. Future enhancements could include real-time updates and file attachments; these are not presented as existing features.

## Repository

[View AccessCore on GitHub](https://github.com/suresh294/accesscore-role-based-api)
