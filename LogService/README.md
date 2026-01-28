# Log Service - Service de Logs Passif

## Description
Le Log Service est un service **totalement passif** qui enregistre chronologiquement tous les événements du système Micro-Donjon. Il ne reçoit jamais d'appels HTTP directs pour écrire des logs.

## Architecture

### Stockage
- **PostgreSQL** (`postgres-log`) : Base de données relationnelle pour un stockage structuré et chronologique
- **Port** : 5433 (externe) → 5432 (interne)

### Communication
- **RabbitMQ** : Consomme automatiquement tous les messages du Message Broker
- **Exchange** : `game_events` (type: topic)
- **Queue** : `logs_queue` (durable)
- **Routing Keys** : `hero.*`, `game.*`, `dungeon.*`, `item.*`, `mob.*`, `auth.*`, `error.*`

### Service
- **Port** : 3005
- **Mode** : Service passif (écoute RabbitMQ uniquement)

## Fonctionnalités

### ✅ Écriture Automatique (Passive)
- Écoute en continu les messages RabbitMQ
- Sauvegarde automatique en PostgreSQL
- Aucune API HTTP d'écriture

### ✅ Consultation (HTTP)
- `GET /logs` : Liste filtrée et paginée des logs
- `GET /logs/stats` : Statistiques des dernières 24h
- `GET /health` : État de santé du service

## Installation

```bash
# Dans le dossier LogService
npm install

# Démarrage avec Docker Compose (depuis la racine du projet)
docker-compose up -d postgres-log rabbitmq log-service
```

## Utilisation

### 1. Pour les autres services (Envoi de logs)

Utiliser la classe `LogPublisher` :

```javascript
const LogPublisher = require('./LogService/logPublisher');
const logger = new LogPublisher(process.env.RABBITMQ_URL);

// Exemple : création d'un héros
await logger.logHeroEvent('HERO_CREATED', {
  heroId: hero.id,
  heroName: hero.name,
  heroClass: hero.class
}, userId, sessionId);

// Exemple : erreur
await logger.logError('HERO', error, { 
  endpoint: '/heroes', 
  method: 'POST' 
});
```

### 2. Pour consulter les logs

```bash
# Tous les logs
curl http://localhost:3005/logs

# Logs filtrés
curl "http://localhost:3005/logs?service=HERO_SERVICE&level=ERROR&page=1&limit=50"

# Statistiques
curl http://localhost:3005/logs/stats

# État de santé
curl http://localhost:3005/health
```

## Structure de la Base de Données

```sql
CREATE TABLE logs (
  id SERIAL PRIMARY KEY,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  service VARCHAR(100) NOT NULL,
  action VARCHAR(200) NOT NULL,
  message TEXT,
  level VARCHAR(50) DEFAULT 'INFO',
  user_id VARCHAR(100),
  session_id VARCHAR(100),
  metadata JSONB
);
```

## Types d'Événements

### Routing Keys Supportées
- `hero.*` : Événements du Hero Service
- `game.*` : Événements du Game Engine
- `dungeon.*` : Événements du Dungeon Service
- `item.*` : Événements du Item Service
- `mob.*` : Événements du Mob Service
- `auth.*` : Événements d'authentification
- `error.*` : Erreurs système

### Niveaux de Logs
- `DEBUG` : Informations détaillées pour le débogage
- `INFO` : Informations générales (défaut)
- `WARN` : Avertissements
- `ERROR` : Erreurs
- `FATAL` : Erreurs critiques

## Test

```bash
# Test manuel
node test.js

# Vérification
curl http://localhost:3005/logs
```

## Avantages de cette Architecture

1. **Découplage Total** : Les services n'ont pas besoin d'attendre une réponse du service de logs
2. **Performance** : Écriture asynchrone via messages
3. **Fiabilité** : Messages persistants dans RabbitMQ
4. **Traçabilité Complète** : Tous les événements sont capturés automatiquement
5. **Consultation Rapide** : API HTTP optimisée pour la lecture

## Monitoring

Le service expose un endpoint `/health` qui indique :
- État général du service
- Connexion à PostgreSQL
- Connexion à RabbitMQ
- Timestamp de la dernière vérification

```json
{
  "status": "healthy",
  "service": "log-service", 
  "timestamp": "2026-01-28T10:30:00Z",
  "rabbitmq_connected": true
}
```