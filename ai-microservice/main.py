from fastapi import FastAPI, HTTPException

from models.schemas import CompatibilityRequest, MatchRequest, RecommendationResponse
from services.recommendation_engine import RecommendationEngine

app = FastAPI(
    title="OFPPT Permutation AI Microservice",
    version="1.0.0",
    description="Rule-based recommendation and graph optimization engine for formateur permutations.",
)
engine = RecommendationEngine()


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/match/direct", response_model=RecommendationResponse)
def match_direct(request: MatchRequest) -> RecommendationResponse:
    try:
        return engine.direct(request)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc


@app.post("/match/regional", response_model=RecommendationResponse)
def match_regional(request: MatchRequest) -> RecommendationResponse:
    try:
        return engine.regional(request)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc


@app.post("/match/multihop", response_model=RecommendationResponse)
def match_multihop(request: MatchRequest) -> RecommendationResponse:
    try:
        return engine.multihop(request)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc


@app.post("/match/full", response_model=RecommendationResponse)
def match_full(request: MatchRequest) -> RecommendationResponse:
    try:
        return engine.full_scan(request)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc


@app.post("/score/compatibility")
def score_compatibility(request: CompatibilityRequest) -> dict:
    return engine.score(request)


@app.get("/recommendations/{user_id}")
def recommendations_placeholder(user_id: int) -> dict:
    return {
        "user_id": user_id,
        "message": "Laravel persists user-specific recommendations; call the Laravel API for authenticated feeds.",
        "recommendations": [],
    }

