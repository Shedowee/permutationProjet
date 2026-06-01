from enum import Enum
from typing import Any, Literal

from pydantic import BaseModel, Field, field_validator


class RecommendationType(str, Enum):
    DIRECT = "direct"
    REGIONAL = "regional"
    MULTIHOP = "multihop"


class Demande(BaseModel):
    id: int
    user_id: int | None = None
    formateur_id: int
    formateur_name: str | None = None
    current_establishment_id: int | None = None
    current_establishment_name: str | None = None
    current_city_id: int | None = None
    current_city_name: str | None = None
    current_region_id: int | None = None
    current_region_name: str | None = None
    target_establishment_id: int | None = None
    target_establishment_name: str | None = None
    target_city_id: int | None = None
    target_city_name: str | None = None
    target_region_id: int | None = None
    target_region_name: str | None = None
    specialty: str | None = None
    years_experience: float | None = None
    urgency: int = Field(default=3, ge=1, le=5)
    preferences: dict[str, Any] = Field(default_factory=dict)
    constraints: dict[str, Any] = Field(default_factory=dict)
    history: dict[str, Any] = Field(default_factory=dict)

    @field_validator("preferences", "constraints", "history", mode="before")
    @classmethod
    def empty_list_as_dict(cls, value: Any) -> dict[str, Any]:
        if value is None or value == []:
            return {}
        return value


class MatchRequest(BaseModel):
    target_demande_id: int
    demandes: list[Demande]
    max_results: int = Field(default=10, ge=1, le=50)
    max_cycle_length: int = Field(default=4, ge=3, le=6)


class CompatibilityRequest(BaseModel):
    source: Demande
    candidate: Demande


class Recommendation(BaseModel):
    type: RecommendationType
    target_demande_id: int
    candidate_demande_ids: list[int]
    score: float
    confidence: Literal["low", "medium", "high"]
    title: str
    summary: str
    chain: list[dict[str, Any]] = Field(default_factory=list)
    metadata: dict[str, Any] = Field(default_factory=dict)


class RecommendationResponse(BaseModel):
    recommendations: list[Recommendation]
