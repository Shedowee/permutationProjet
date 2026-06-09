# AI Microservice Architecture / Architecture du Microservice AI

## Overview / Vue d'ensemble

The OFPPT AI Microservice is a FastAPI-based service designed to provide intelligent permutation recommendations for formateurs (trainers). It uses rule-based algorithms and graph theory to detect optimal matching opportunities between permutation requests.

Le microservice AI OFPPT est un service basé sur FastAPI conçu pour fournir des recommandations intelligentes de permutation pour les formateurs. Il utilise des algorithmes basés sur des règles et la théorie des graphes pour détecter les opportunités d'appariement optimales entre les demandes de permutation.

---

## Technologies Used / Technologies Utilisées

### Core Framework / Framework Principal
- **FastAPI** (0.104.1): Modern, fast web framework for building APIs with Python
- **Uvicorn** (0.30.6): ASGI server for running FastAPI applications
- **Pydantic** (2.9.2): Data validation using Python type annotations

### Data Processing & Algorithms / Traitement de Données et Algorithmes
- **NetworkX** (3.2.1): Graph theory library for multi-hop cycle detection
- **NumPy** (1.26.4): Numerical computing library
- **Pandas** (2.2.2): Data manipulation and analysis
- **Scikit-learn** (1.5.2): Machine learning library for advanced algorithms

### HTTP Client / Client HTTP
- **HTTPX** (0.25.2): Async HTTP client for making external requests

### Containerization / Conteneurisation
- **Docker**: Container deployment using Python 3.12-slim base image

---

## Architecture Structure / Structure de l'Architecture

```
ai-microservice/
├── main.py                 # FastAPI application entry point / Point d'entrée de l'application FastAPI
├── models/
│   └── schemas.py          # Pydantic data models / Modèles de données Pydantic
├── services/
│   └── recommendation_engine.py  # Orchestration layer / Couche d'orchestration
├── algorithms/
│   ├── matching.py         # Matching algorithms (direct, regional, multihop) / Algorithmes d'appariement
│   └── scoring.py          # Compatibility scoring logic / Logique de scoring de compatibilité
├── requirements.txt        # Python dependencies / Dépendances Python
├── Dockerfile             # Container configuration / Configuration du conteneur
└── README.md              # User documentation / Documentation utilisateur
```

---

## How It Works / Comment ça Fonctionne

### 1. Request Flow / Flux des Requêtes

```
Client Request → FastAPI Endpoint → Recommendation Engine → Matching Algorithms → Response
Requête Client → Endpoint FastAPI → Moteur de Recommandation → Algorithmes d'Appariement → Réponse
```

### 2. Matching Strategies / Stratégies d'Appariement

The service implements three main matching strategies:

Le service implémente trois stratégies principales d'appariement :

#### A. Direct Matching / Appariement Direct
- **Purpose**: Find reciprocal swaps where two formateurs want to exchange positions directly
- **Purpose**: Trouver des échanges réciproques où deux formateurs veulent échanger leurs positions directement
- **Logic**: Checks if candidate's current location matches target's desired location AND vice versa
- **Logique**: Vérifie si le lieu actuel du candidat correspond au lieu souhaité de la cible ET vice versa
- **Score Threshold**: Minimum 55/100
- **Seuil de Score**: Minimum 55/100

**Example / Exemple**:
- Formateur A wants: City X → City Y
- Formateur B wants: City Y → City X
- Result: Direct match detected / Résultat : Appariement direct détecté

#### B. Regional Matching / Appariement Régional
- **Purpose**: Find opportunities in the same region when direct matches aren't available
- **Purpose**: Trouver des opportunités dans la même région lorsque les appariements directs ne sont pas disponibles
- **Logic**: Candidate's current region matches target's target region
- **Logique**: La région actuelle du candidat correspond à la région cible de la cible
- **Score Threshold**: Minimum 50/100
- **Seuil de Score**: Minimum 50/100

**Example / Exemple**:
- Formateur A wants: City X → City Y (Region R1)
- Formateur B is in: Region R1 → wants to stay in R1
- Result: Regional opportunity / Résultat : Opportunité régionale

#### C. Multi-hop Matching / Appariement Multi-sauts
- **Purpose**: Detect circular permutation chains involving 3+ formateurs
- **Purpose**: Détecter des chaînes de permutation circulaires impliquant 3+ formateurs
- **Technology**: Uses NetworkX graph algorithms to find cycles
- **Technologie**: Utilise les algorithmes de graphes NetworkX pour trouver des cycles
- **Logic**: Builds a directed graph where edges represent possible moves, then finds simple cycles
- **Logique**: Construit un graphe orienté où les arêtes représentent les mouvements possibles, puis trouve des cycles simples
- **Score Threshold**: Minimum 50/100
- **Seuil de Score**: Minimum 50/100

**Example / Exemple**:
- Formateur A: City X → City Y
- Formateur B: City Y → City Z
- Formateur C: City Z → City X
- Result: 3-hop cycle detected / Résultat : Cycle à 3 sauts détecté

### 3. Compatibility Scoring / Scoring de Compatibilité

The scoring system evaluates multiple factors with weighted importance:

Le système de scoring évalue plusieurs facteurs avec une importance pondérée :

| Factor / Facteur | Weight / Poids | Description / Description |
|------------------|----------------|--------------------------|
| Specialty / Spécialité | 28% | Similarity between formateurs' specialties / Similarité entre les spécialités des formateurs |
| Destination / Destination | 24% | Reciprocal match quality (establishment > city) / Qualité de l'appariement réciproque (établissement > ville) |
| Region / Région | 16% | Regional alignment / Alignement régional |
| Experience / Expérience | 12% | Years of experience gap / Écart d'années d'expérience |
| Historical Acceptance / Acceptation Historique | 12% | Past acceptance rate / Taux d'acceptation passé |
| Urgency / Urgence | 8% | Alignment of urgency levels / Alignement des niveaux d'urgence |

**Score Calculation / Calcul du Score**:
```
Final Score = (Weighted Sum of Factors) - Constraint Penalties
Score Final = (Somme Pondérée des Facteurs) - Pénalités de Contrainte
```

**Confidence Levels / Niveaux de Confiance**:
- High: ≥ 82% / Élevé: ≥ 82%
- Medium: 62-81% / Moyen: 62-81%
- Low: < 62% / Faible: < 62%

### 4. Full Scan Strategy / Stratégie de Scan Complet

The `/match/full` endpoint implements a fallback strategy:

L'endpoint `/match/full` implémente une stratégie de repli :

1. Try direct matches first (highest quality) / Essayer d'abord les appariements directs (qualité la plus élevée)
2. If no direct matches, try regional matches / Si aucun appariement direct, essayer les appariements régionaux
3. If no regional matches, try multi-hop cycles / Si aucun appariement régional, essayer les cycles multi-sauts
4. Return the best available option / Retourner la meilleure option disponible

---

## API Endpoints / Points de Terminaison API

### Health Check / Vérification de Santé
```
GET /health
Returns: {"status": "ok"}
Retourne: {"status": "ok"}
```

### Direct Matching / Appariement Direct
```
POST /match/direct
Body: MatchRequest (target_demande_id, demandes, max_results)
Returns: RecommendationResponse with DIRECT type recommendations
Retourne: RecommendationResponse avec recommandations de type DIRECT
```

### Regional Matching / Appariement Régional
```
POST /match/regional
Body: MatchRequest (target_demande_id, demandes, max_results)
Returns: RecommendationResponse with REGIONAL type recommendations
Retourne: RecommendationResponse avec recommandations de type REGIONAL
```

### Multi-hop Matching / Appariement Multi-sauts
```
POST /match/multihop
Body: MatchRequest (target_demande_id, demandes, max_cycle_length, max_results)
Returns: RecommendationResponse with MULTIHOP type recommendations
Retourne: RecommendationResponse avec recommandations de type MULTIHOP
```

### Full Scan / Scan Complet
```
POST /match/full
Body: MatchRequest (target_demande_id, demandes, max_results, max_cycle_length)
Returns: RecommendationResponse with best available recommendations
Retourne: RecommendationResponse avec les meilleures recommandations disponibles
```

### Compatibility Scoring / Scoring de Compatibilité
```
POST /score/compatibility
Body: CompatibilityRequest (source, candidate)
Returns: {"score": float, "factors": {...}}
Retourne: {"score": float, "factors": {...}}
```

---

## Data Models / Modèles de Données

### Demande (Permutation Request / Demande de Permutation)
- Formateur information (ID, name, specialty) / Informations du formateur (ID, nom, spécialité)
- Current location (establishment, city, region) / Lieu actuel (établissement, ville, région)
- Target location (establishment, city, region) / Lieu cible (établissement, ville, région)
- Experience and urgency / Expérience et urgence
- Preferences, constraints, and history / Préférences, contraintes et historique

### Recommendation
- Type (DIRECT, REGIONAL, MULTIHOP) / Type (DIRECT, REGIONAL, MULTIHOP)
- Score and confidence level / Score et niveau de confiance
- Title and summary / Titre et résumé
- Chain of moves (for multihop) / Chaîne de mouvements (pour multi-sauts)
- Metadata with scoring factors / Métadonnées avec facteurs de scoring

---

## Deployment / Déploiement

### Local Development / Développement Local
```bash
pip3 install -r requirements.txt
python3 -m uvicorn main:app --reload --port 8001
```

### Docker Deployment / Déploiement Docker
```bash
docker build -t ofppt-ai-microservice .
docker run -p 8001:8001 ofppt-ai-microservice
```

The Dockerfile uses Python 3.12-slim for a lightweight production image.

Le Dockerfile utilise Python 3.12-slim pour une image de production légère.

---

## Key Design Decisions / Décisions de Conception Clés

1. **Rule-based over ML**: Uses deterministic rules for transparency and explainability
   **Basé sur des règles plutôt que ML**: Utilise des règles déterministes pour la transparence et l'explicabilité

2. **Graph theory for cycles**: NetworkX provides efficient cycle detection algorithms
   **Théorie des graphes pour les cycles**: NetworkX fournit des algorithmes efficaces de détection de cycles

3. **Weighted scoring**: Multiple factors with different weights reflect real-world priorities
   **Scoring pondéré**: Plusieurs facteurs avec différents poids reflètent les priorités du monde réel

4. **Fallback strategy**: Progressive fallback from best to acceptable matches
   **Stratégie de repli**: Repli progressif des meilleurs aux appariements acceptables

5. **REST API boundary**: Clean separation allows independent deployment and scaling
   **Limite d'API REST**: Séparation propre permet un déploiement et une mise à l'échelle indépendants

---

## Future Enhancements / Améliorations Futures

- Machine learning models for improved scoring / Modèles de machine learning pour un scoring amélioré
- Real-time notification system / Système de notification en temps réel
- Historical performance tracking / Suivi des performances historiques
- Advanced constraint handling / Gestion avancée des contraintes
- Caching layer for performance / Couche de cache pour les performances
