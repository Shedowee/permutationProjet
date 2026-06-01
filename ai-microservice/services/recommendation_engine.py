from models.schemas import CompatibilityRequest, MatchRequest, RecommendationResponse
from algorithms.matching import direct_matches, find_target, multihop_cycles, regional_matches
from algorithms.scoring import compatibility_score


class RecommendationEngine:
    def direct(self, request: MatchRequest) -> RecommendationResponse:
        target = find_target(request.target_demande_id, request.demandes)
        return RecommendationResponse(recommendations=direct_matches(target, request.demandes, request.max_results))

    def regional(self, request: MatchRequest) -> RecommendationResponse:
        target = find_target(request.target_demande_id, request.demandes)
        return RecommendationResponse(recommendations=regional_matches(target, request.demandes, request.max_results))

    def multihop(self, request: MatchRequest) -> RecommendationResponse:
        target = find_target(request.target_demande_id, request.demandes)
        return RecommendationResponse(
            recommendations=multihop_cycles(target, request.demandes, request.max_cycle_length, request.max_results)
        )

    def full_scan(self, request: MatchRequest) -> RecommendationResponse:
        target = find_target(request.target_demande_id, request.demandes)
        direct = direct_matches(target, request.demandes, request.max_results)
        if direct:
            return RecommendationResponse(recommendations=direct[: request.max_results])

        regional = regional_matches(target, request.demandes, request.max_results)
        if regional:
            return RecommendationResponse(recommendations=regional[:1])

        multihop = multihop_cycles(target, request.demandes, request.max_cycle_length, request.max_results)
        return RecommendationResponse(recommendations=multihop[:1])

    def score(self, request: CompatibilityRequest) -> dict:
        score, factors = compatibility_score(request.source, request.candidate)
        return {"score": score, "factors": factors}
