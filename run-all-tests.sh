#!/bin/bash

set -e

echo "=== Lancement des tests unitaires et d'intégration ==="

SERVICES=("AuthService" "DungeonService" "HeroService" "ItemService" "MobService" "GameEngine")

for service in "${SERVICES[@]}"; do
  echo ""
  echo "---- $service ----"
  if [ -f "$service/package.json" ]; then
    (cd "$service" && npm install && npm test)
  else
    echo "Aucun package.json trouvé dans $service, tests npm ignorés."
  fi
done

echo ""
echo "=== Lancement des tests Bruno ==="

for service in "${SERVICES[@]}"; do
  if [ -d "$service/bruno" ]; then
    echo ""
    echo "---- Tests Bruno pour $service ----"
    bru run "$service/bruno"
  else
    echo "Aucun dossier bruno/ trouvé dans $service, tests Bruno ignorés."
  fi
done

echo ""
echo "=== Tous les tests sont terminés ==="