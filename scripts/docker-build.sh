#!/bin/sh
set -e

# Lade .env wenn vorhanden
if [ -f .env ]; then
  set -a
  # shellcheck disable=SC1091
  . ./.env
  set +a
fi

IMAGE="harbor.cyberca.de/ariscorp/website/frontend:live-test"

echo "Baue Docker-Image: $IMAGE"
echo ""

docker build --tag "$IMAGE" "$@" .

echo ""
echo "Fertig: $IMAGE"
echo "Starten: docker run --rm -p 3000:3000 $IMAGE"
