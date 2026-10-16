# Full-Stack Blog & Observability Platform

A containerized blog application that combines a browser-based client,
REST API, relational database, CI/CD, and infrastructure monitoring in one
repository.

[Live application](https://blog-tan-eight-61.vercel.app)

## What this project demonstrates

- Account creation and login flows
- Post creation, editing, and comments
- REST API backed by PostgreSQL
- Multi-service orchestration with Docker Compose
- Automated image builds and health checks in GitHub Actions
- Branch-based deployment workflow for staging and production
- Application and infrastructure observability with Prometheus and Grafana

## Architecture

```text
Browser
   │
   ▼
Frontend (Nginx) ──────► Backend API (Node.js + Express)
                                │
                                ▼
                          PostgreSQL 15

Prometheus ◄── Node Exporter / Postgres Exporter / cAdvisor
   │
   ▼
Grafana
```

## Tech stack

| Layer | Technologies |
|---|---|
| Front end | HTML, CSS, JavaScript, Fetch API, Nginx |
| Back end | Node.js, Express, CORS, `pg` |
| Database | PostgreSQL 15 |
| Containers | Docker and Docker Compose |
| CI/CD | GitHub Actions and AWS EC2 deployment workflow |
| Observability | Prometheus, Grafana, Node Exporter, Postgres Exporter, cAdvisor |

## Repository structure

```text
.
├── .github/workflows/ci-cd.yml
├── backend/
│   ├── Dockerfile
│   ├── init-db.sql
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── Dockerfile
│   ├── app.js
│   ├── index.html
│   └── style.css
├── docker-compose.yaml
├── prometheus.yml
├── AWS_DEPLOYMENT_GUIDE.md
└── AWS_DEPLOYMENT_PLAN.md
```

## Run locally with Docker

### Requirements

- Docker Engine or Docker Desktop
- Docker Compose v2

### Start the stack

```bash
git clone https://github.com/edlesonjrr/Blog.git
cd Blog
docker compose up --build -d
```

### Local services

| Service | URL |
|---|---|
| Front end | `http://localhost:8080` |
| Backend API | `http://localhost:3000` |
| Health check | `http://localhost:3000/health` |
| Prometheus | `http://localhost:9090` |
| Grafana | `http://localhost:3001` |
| cAdvisor | `http://localhost:8081` |

The credentials in `docker-compose.yaml` are intended only for local
development. Replace them with environment variables and secret management
before exposing any service outside a trusted machine.

### Inspect and stop

```bash
docker compose ps
docker compose logs -f
docker compose down
```

## API overview

| Method | Endpoint | Purpose |
|---|---|---|
| `POST` | `/create-account` | Create an account |
| `POST` | `/login` | Authenticate a user |
| `GET` | `/users` | List users |
| `GET` | `/posts` | List posts and comments |
| `POST` | `/posts` | Create a post |
| `POST` | `/comments` | Add a comment |
| `GET` | `/health` | Check API and database health |

## CI/CD

The GitHub Actions workflow:

1. Builds all Docker images.
2. Starts the stack in CI.
3. Verifies the back-end health endpoint and front end.
4. Publishes diagnostic logs on failure.
5. Deploys `staging` and `main` through environment-scoped GitHub secrets.

Required deployment secrets are documented by name in the workflow; no host,
private key, or production credential is stored in this repository.

## Observability

- Prometheus collects service and host metrics.
- Grafana provides dashboard visualization.
- Node Exporter exposes system metrics.
- Postgres Exporter exposes database metrics.
- cAdvisor exposes container resource usage.

For production, keep monitoring endpoints behind a firewall, VPN, or authenticated
reverse proxy instead of exposing their ports publicly.

## Authors

Academic project by Guilherme Leal, Edleson Junior, Lauro Viana, Anthony Ramos,
and Arthur Cabral.
