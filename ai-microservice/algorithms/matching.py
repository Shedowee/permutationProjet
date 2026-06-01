from __future__ import annotations

import networkx as nx

from algorithms.scoring import chain_score, compatibility_score, confidence_from_score
from models.schemas import Demande, Recommendation, RecommendationType


def find_target(target_demande_id: int, demandes: list[Demande]) -> Demande:
    for demande in demandes:
        if demande.id == target_demande_id:
            return demande
    raise ValueError(f"Unknown target_demande_id {target_demande_id}")


def _edge_is_possible(source: Demande, candidate: Demande) -> bool:
    if source.id == candidate.id:
        return False
    if not source.target_establishment_id and not source.target_city_id:
        return False
    if source.target_establishment_id and candidate.current_establishment_id == source.target_establishment_id:
        return True
    return bool(source.target_city_id and candidate.current_city_id == source.target_city_id)


def direct_matches(target: Demande, demandes: list[Demande], max_results: int = 10) -> list[Recommendation]:
    results: list[Recommendation] = []
    for candidate in demandes:
        if candidate.id == target.id:
            continue
        reciprocal_establishment = (
            target.current_establishment_id
            and target.target_establishment_id
            and candidate.current_establishment_id == target.target_establishment_id
            and candidate.target_establishment_id == target.current_establishment_id
        )
        reciprocal_city = (
            target.current_city_id
            and target.target_city_id
            and candidate.current_city_id == target.target_city_id
            and candidate.target_city_id == target.current_city_id
        )
        if not reciprocal_establishment and not reciprocal_city:
            continue

        score, factors = compatibility_score(target, candidate)
        if score < 55:
            continue
        results.append(
            Recommendation(
                type=RecommendationType.DIRECT,
                target_demande_id=target.id,
                candidate_demande_ids=[candidate.id],
                score=score,
                confidence=confidence_from_score(score / 100),
                title="Permutation directe détectée",
                summary=f"{target.current_city_name or 'Ville actuelle'} -> {target.target_city_name or 'ville souhaitée'} avec {candidate.formateur_name or 'un formateur compatible'}.",
                chain=[
                    {
                        "demande_id": target.id,
                        "from": target.current_city_name,
                        "to": target.target_city_name,
                    },
                    {
                        "demande_id": candidate.id,
                        "from": candidate.current_city_name,
                        "to": candidate.target_city_name,
                    },
                ],
                metadata={"factors": factors, "reciprocal_establishment": bool(reciprocal_establishment)},
            )
        )
    return sorted(results, key=lambda item: item.score, reverse=True)[:max_results]


def regional_matches(target: Demande, demandes: list[Demande], max_results: int = 10) -> list[Recommendation]:
    results: list[Recommendation] = []
    for candidate in demandes:
        if candidate.id == target.id:
            continue
        if candidate.current_region_id != target.target_region_id:
            continue
        if candidate.target_region_id and target.current_region_id and candidate.target_region_id != target.current_region_id:
            continue
        score, factors = compatibility_score(target, candidate, regional=True)
        if score < 50:
            continue
        results.append(
            Recommendation(
                type=RecommendationType.REGIONAL,
                target_demande_id=target.id,
                candidate_demande_ids=[candidate.id],
                score=score,
                confidence=confidence_from_score(score / 100),
                title="Opportunité régionale proche",
                summary=f"Option compatible dans la région {target.target_region_name or 'souhaitée'}, proche de {target.target_city_name or 'la destination cible'}.",
                chain=[
                    {"demande_id": target.id, "from": target.current_city_name, "to": target.target_city_name},
                    {"demande_id": candidate.id, "from": candidate.current_city_name, "to": candidate.target_city_name},
                ],
                metadata={"factors": factors, "regional_fallback": True},
            )
        )
    return sorted(results, key=lambda item: item.score, reverse=True)[:max_results]


def multihop_cycles(target: Demande, demandes: list[Demande], max_cycle_length: int = 4, max_results: int = 10) -> list[Recommendation]:
    by_id = {demande.id: demande for demande in demandes}
    graph = nx.DiGraph()
    for demande in demandes:
        graph.add_node(demande.id)
    for source in demandes:
        for candidate in demandes:
            if _edge_is_possible(source, candidate):
                graph.add_edge(source.id, candidate.id)

    results: list[Recommendation] = []
    seen: set[tuple[int, ...]] = set()
    for cycle in nx.simple_cycles(graph, length_bound=max_cycle_length):
        if target.id not in cycle or len(cycle) < 3:
            continue
        while cycle[0] != target.id:
            cycle = cycle[1:] + cycle[:1]
        key = tuple(cycle)
        if key in seen:
            continue
        seen.add(key)
        cycle_demandes = [by_id[demande_id] for demande_id in cycle]
        score, factors = chain_score(cycle_demandes)
        if score < 50:
            continue
        results.append(
            Recommendation(
                type=RecommendationType.MULTIHOP,
                target_demande_id=target.id,
                candidate_demande_ids=[demande_id for demande_id in cycle if demande_id != target.id],
                score=score,
                confidence=confidence_from_score(score / 100),
                title=f"Chaîne de permutation à {len(cycle)} formateurs",
                summary="Cycle circulaire détecté automatiquement par analyse de graphe.",
                chain=[
                    {"demande_id": demande.id, "from": demande.current_city_name, "to": demande.target_city_name}
                    for demande in cycle_demandes
                ],
                metadata={"factors": factors, "cycle_length": len(cycle)},
            )
        )
    return sorted(results, key=lambda item: item.score, reverse=True)[:max_results]

