# OFPPT Intelligent Permutation Platform

This repository is structured as an intelligent optimization platform:

- `backend/`: Laravel API gateway, authentication, workflow, notifications, persistence
- `Front-end/`: React dashboard for formateurs, commission, and admin users
- `ai-microservice/`: isolated FastAPI recommendation engine

## Phase 1 AI

The AI service starts with deterministic algorithms:

- direct reciprocal matching
- regional nearest matching
- multi-hop graph cycle detection
- compatibility scoring
- ranked recommendation metadata

Laravel sends pending demandes to the AI service, stores returned recommendations, and exposes the authenticated feed to React.

## Docker

```bash
docker compose up --build ai-microservice
```

Set Laravel:

```env
AI_SERVICE_URL=http://ai-microservice:8001
```

For local non-Docker development:

```env
AI_SERVICE_URL=http://127.0.0.1:8001
```

