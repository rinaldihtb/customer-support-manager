# Customer Support Manager

A unified full-stack solution featuring a **Clean Architecture Node.js API** and a **Next.js Frontend**, fully orchestrated via Docker.

## 📂 Project Structure

```text
.
├── backend/            # Node.js + Express API
├── frontend/           # Next.js Web Application
├── docker-compose.yml  # Multi-container orchestration
└── README.md

```

### Backend (API) Architecture

The backend is organized into functional layers for clear separation of concerns:

* **`src/routes`**: Maps HTTP endpoints to specific controller functions.
* **`src/controllers`**: Handles incoming requests, extracts data, and calls the appropriate service.
* **`src/services`**: Contains the core business logic (e.g., ticket validation, status transitions).
* **`src/repositories`**: Manages all direct database interactions (PostgreSQL).
* **`src/middlewares`**: Logic for authentication, logging, and global error handling.
* **`src/workers`**: Handles background or asynchronous tasks.
* **`src/config`**: Manages environment variables and database connections.
* **`app.js`**: The main entry point for the Express server.


### Frontend (Next.js)

A role-based interface designed for distinct user workflows:

* **`/` (Role Selection)**: Entry point for users to choose their access level.
* **`/support` (User Form)**: Interface for users to create and submit support tickets.
* **`/dashboard` (Agent View)**: Management tool for agents to view, edit, message, and resolve tickets.
* **`/health` (Status)**: Web-based display of the API's current health status.

---

## 🚀 Docker Setup (Recommended)

The workspace is configured to run all services (API, Web, and DB) with a single command.

### 1. Environment Configuration

Copy the example environment file to the each backend and frontend to set defaults for the app and database:

```bash
cp backend/.env.example .env
cp frontend/.env.example .env

```

### 2. Start the Stack

Build and launch all containers in detached mode:

```bash
docker-compose up --build

```

### 3. Service Access

| Service | URL | Port |
| --- | --- | --- |
| **Frontend App** | `http://localhost:8200` | 8200 |
| **Backend API** | `http://localhost:8100` | 8100 |
| **PostgreSQL** | `localhost` | 5432 |

---

## 🛠 Manual Development

If you need to run services individually without Docker:

### Backend Setup

1. `cd backend`
2. `npm install`
3. Ensure PostgreSQL is running and `DB_*` values in `.env` are correct.
4. `npm run dev`

### Frontend Setup

1. `cd frontend`
2. `npm install`
3. `npm run dev` (Runs on `http://localhost:8200` by default)

---

## 🔌 API Endpoints Reference

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/ticket` | List all tickets |
| `GET` | `/ticket/:id` | Get details for a specific ticket |
| `PATCH` | `/ticket/:id/resolve` | Mark a ticket as resolved |
| `POST` | `/ticket-message/:id` | Add a new message to a ticket |
| `PATCH` | `/ticket-message/:id` | Update an existing ticket message |
| `PATCH` | `/ticket-message/:id/publish` | Publish a message for the user to see |
| `GET` | `/health` | API Health Check (Returns 200 Success) |

---

## 🐳 Useful Docker Commands

* **Stop the stack**: `npm run docker:down` or `docker-compose down`.
* **Reset Database**: `docker-compose down -v` (Removes the `db_data` volume).
* **View Logs**: `docker-compose logs -f api`.
