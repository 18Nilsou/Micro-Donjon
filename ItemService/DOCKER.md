# Docker - Guide d'utilisation

## Commandes de base

### Construire l'image

```bash
docker build -t item-service .
```

### Lancer le conteneur

```bash
# En mode détaché
docker run -d -p 3004:3004 --name item-service item-service

# Avec logs visibles
docker run -p 3004:3004 --name item-service item-service
```

### Gérer le conteneur

```bash
# Voir les logs
docker logs item-service
docker logs -f item-service  # Mode suivi

# Arrêter le conteneur
docker stop item-service

# Démarrer un conteneur arrêté
docker start item-service

# Redémarrer
docker restart item-service

# Supprimer le conteneur
docker rm item-service

# Supprimer l'image
docker rmi item-service
```

## Docker Compose

### Démarrer les services

```bash
# Démarrer en arrière-plan
docker-compose up -d

# Démarrer avec logs
docker-compose up

# Rebuild et démarrer
docker-compose up -d --build
```

### Gérer les services

```bash
# Voir les logs
docker-compose logs
docker-compose logs -f  # Mode suivi
docker-compose logs item-service  # Logs d'un service spécifique

# Arrêter les services
docker-compose stop

# Arrêter et supprimer les conteneurs
docker-compose down

# Arrêter et supprimer conteneurs + volumes
docker-compose down -v

# Redémarrer un service
docker-compose restart item-service
```

### État des services

```bash
# Voir les services en cours
docker-compose ps

# Voir les processus
docker-compose top
```

## Variables d'environnement

### Dans docker-compose.yml

```yaml
services:
  item-service:
    environment:
      - PORT=3004
      - NODE_ENV=production
```

### Avec fichier .env

Créer un fichier `.env`:
```bash
PORT=3004
NODE_ENV=production
```

Puis:
```bash
docker-compose --env-file .env up -d
```

## Volumes et persistance

### Monter un volume pour les données

```bash
# Dans docker-compose.yml (déjà configuré)
volumes:
  - ./data:/usr/src/app/data
```

### Sauvegarder les données

```bash
# Copier les données depuis le conteneur
docker cp item-service:/usr/src/app/data ./backup-data

# Restaurer les données
docker cp ./backup-data/. item-service:/usr/src/app/data
```

## Health Check

### Vérifier la santé du conteneur

```bash
# Avec Docker
docker inspect --format='{{.State.Health.Status}}' item-service

# Avec Docker Compose
docker-compose ps
```

### Tester manuellement

```bash
# Depuis l'hôte
curl http://localhost:3004/health

# Depuis le conteneur
docker exec item-service curl http://localhost:3004/health
```

## Debug

### Accéder au shell du conteneur

```bash
docker exec -it item-service sh
```

### Voir les fichiers

```bash
# Lister les fichiers
docker exec item-service ls -la /usr/src/app

# Voir le contenu d'un fichier
docker exec item-service cat /usr/src/app/data/item-types.json
```

### Inspecter le conteneur

```bash
# Informations détaillées
docker inspect item-service

# Voir les variables d'environnement
docker inspect --format='{{range .Config.Env}}{{println .}}{{end}}' item-service

# Voir les ports
docker port item-service
```

## Nettoyage

### Nettoyer les ressources inutilisées

```bash
# Supprimer tous les conteneurs arrêtés
docker container prune

# Supprimer toutes les images non utilisées
docker image prune

# Supprimer tout (attention!)
docker system prune -a

# Supprimer les volumes non utilisés
docker volume prune
```

## Multi-environnements

### Développement

```bash
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up
```

### Production

```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## Registry Docker

### Tag et push vers un registry

```bash
# Tag l'image
docker tag item-service:latest myregistry.com/item-service:1.0.0

# Push vers le registry
docker push myregistry.com/item-service:1.0.0

# Pull depuis le registry
docker pull myregistry.com/item-service:1.0.0
```

## Exemples de déploiement

### Déploiement simple

```bash
# 1. Construire l'image
docker build -t item-service:1.0.0 .

# 2. Arrêter l'ancien conteneur
docker stop item-service || true
docker rm item-service || true

# 3. Lancer le nouveau conteneur
docker run -d \
  --name item-service \
  -p 3004:3004 \
  --restart unless-stopped \
  item-service:1.0.0
```

### Avec réseau personnalisé

```bash
# Créer un réseau
docker network create micro-donjon

# Lancer le service dans ce réseau
docker run -d \
  --name item-service \
  --network micro-donjon \
  -p 3004:3004 \
  item-service:1.0.0
```

## Troubleshooting

### Le conteneur ne démarre pas

```bash
# Voir les logs complets
docker logs item-service

# Vérifier la configuration
docker inspect item-service
```

### Port déjà utilisé

```bash
# Trouver le processus utilisant le port
lsof -i :3004

# Utiliser un autre port
docker run -p 3005:3004 item-service
```

### Le health check échoue

```bash
# Tester manuellement
docker exec item-service curl http://localhost:3004/health

# Vérifier les logs
docker logs item-service
```
