from __future__ import annotations

import math
import unicodedata
from datetime import date
from difflib import SequenceMatcher
from typing import Any

from models.schemas import Demande


def normalize(value: str | None) -> str:
    value = value or ""
    value = unicodedata.normalize("NFKD", value).encode("ascii", "ignore").decode("ascii")
    return " ".join(value.lower().strip().split())


def specialty_similarity(left: str | None, right: str | None) -> float:
    left_norm = normalize(left)
    right_norm = normalize(right)
    if not left_norm or not right_norm:
        return 0.75
    if left_norm == right_norm:
        return 1.0
    if left_norm in right_norm or right_norm in left_norm:
        return 0.9
    return SequenceMatcher(None, left_norm, right_norm).ratio()


def experience_years_from_hire_date(value: Any) -> float | None:
    if not value:
        return None
    try:
        hire_date = date.fromisoformat(str(value)[:10])
    except ValueError:
        return None
    return max((date.today() - hire_date).days / 365.25, 0)


def confidence_from_score(score: float) -> str:
    if score >= 0.82:
        return "high"
    if score >= 0.62:
        return "medium"
    return "low"


def compatibility_score(source: Demande, candidate: Demande, *, regional: bool = False) -> tuple[float, dict[str, float]]:
    specialty = specialty_similarity(source.specialty, candidate.specialty)

    if source.years_experience is None or candidate.years_experience is None:
        experience = 0.72
    else:
        gap = abs(source.years_experience - candidate.years_experience)
        experience = max(0.35, 1 - min(gap, 20) / 20)

    reciprocal_city = (
        source.target_city_id is not None
        and candidate.current_city_id == source.target_city_id
        and candidate.target_city_id == source.current_city_id
    )
    reciprocal_establishment = (
        source.target_establishment_id is not None
        and candidate.current_establishment_id == source.target_establishment_id
        and candidate.target_establishment_id == source.current_establishment_id
    )
    destination = 1.0 if reciprocal_establishment else 0.88 if reciprocal_city else 0.58

    same_region = (
        source.target_region_id is not None
        and candidate.current_region_id == source.target_region_id
    )
    region = 1.0 if same_region else 0.55
    if regional and same_region:
        region = 0.92

    source_urgency = max(min(source.urgency or 3, 5), 1)
    candidate_urgency = max(min(candidate.urgency or 3, 5), 1)
    urgency = 1 - abs(source_urgency - candidate_urgency) / 5

    acceptance = float(candidate.history.get("acceptance_rate", 0.65))
    acceptance = min(max(acceptance, 0.15), 0.98)

    constraint_penalty = 0.0
    if source.constraints.get("same_region_required") and not same_region:
        constraint_penalty += 0.25
    if source.constraints.get("same_specialty_required") and specialty < 0.95:
        constraint_penalty += 0.25

    factors = {
        "specialty": specialty,
        "experience": experience,
        "destination": destination,
        "region": region,
        "urgency": urgency,
        "historical_acceptance": acceptance,
    }

    weighted = (
        specialty * 0.28
        + destination * 0.24
        + region * 0.16
        + experience * 0.12
        + urgency * 0.08
        + acceptance * 0.12
    )
    score = max(0.0, min(1.0, weighted - constraint_penalty))
    return round(score * 100, 2), {key: round(value, 3) for key, value in factors.items()}


def chain_score(demandes: list[Demande]) -> tuple[float, dict[str, float]]:
    if len(demandes) < 3:
        return 0.0, {}
    scores = []
    factor_totals: dict[str, list[float]] = {}
    for index, demande in enumerate(demandes):
        candidate = demandes[(index + 1) % len(demandes)]
        score, factors = compatibility_score(demande, candidate)
        scores.append(score)
        for key, value in factors.items():
            factor_totals.setdefault(key, []).append(value)
    avg_score = sum(scores) / len(scores)
    length_penalty = math.log(len(demandes), 10) * 3
    factors = {key: round(sum(values) / len(values), 3) for key, values in factor_totals.items()}
    return round(max(avg_score - length_penalty, 0), 2), factors

