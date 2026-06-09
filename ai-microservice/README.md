# OFPPT AI Microservice

FastAPI service for Phase 1 rule-based permutation intelligence.

## Capabilities / Capacités

- Direct reciprocal swap detection / Détection d'échange réciproque direct
- Regional fallback recommendations / Recommandations de repli régional
- Multi-hop cycle detection with NetworkX / Détection de cycle multi-sauts avec NetworkX
- Compatibility scoring and ranked recommendation metadata / Scoring de compatibilité et métadonnées de recommandation classées
- REST API boundary for independent deployment / Limite d'API REST pour déploiement indépendant

## Prerequisites / Prérequis

- Python 3.9 or higher / Python 3.9 ou supérieur
- pip3 (Python package manager) / pip3 (gestionnaire de paquets Python)

## Installation / Installation

### English
1. Install the required dependencies:
```bash
pip3 install -r requirements.txt
```

### Français
1. Installez les dépendances requises :
```bash
pip3 install -r requirements.txt
```

## Run locally / Exécution locale

### English
Start the server using uvicorn:
```bash
python3 -m uvicorn main:app --reload --port 8001
```

The service will be available at http://127.0.0.1:8001

### Français
Démarrez le serveur en utilisant uvicorn :
```bash
python3 -m uvicorn main:app --reload --port 8001
```

Le service sera disponible à l'adresse http://127.0.0.1:8001

## API Endpoints / Points de terminaison API

- `GET /health` - Health check endpoint / Point de terminaison de vérification de santé
- `POST /match/direct` - Direct reciprocal swap matching / Correspondance d'échange réciproque direct
- `POST /match/regional` - Regional fallback recommendations / Recommandations de repli régional
- `POST /match/multihop` - Multi-hop cycle detection / Détection de cycle multi-sauts
- `POST /match/full` - Full matching with all strategies / Correspondance complète avec toutes les stratégies
- `POST /score/compatibility` - Compatibility scoring / Scoring de compatibilité

