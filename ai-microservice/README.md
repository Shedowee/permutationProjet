# OFPPT AI Microservice

FastAPI service for Phase 1 rule-based permutation intelligence.

## Capabilities

- Direct reciprocal swap detection
- Regional fallback recommendations
- Multi-hop cycle detection with NetworkX
- Compatibility scoring and ranked recommendation metadata
- REST API boundary for independent deployment

## Run locally

```bash
pip install -r requirements.txt
uvicorn main:app --reload --port 8001
```

## API

- `GET /health`
- `POST /match/direct`
- `POST /match/regional`
- `POST /match/multihop`
- `POST /match/full`
- `POST /score/compatibility`

