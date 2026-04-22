#!/bin/bash
set -e

# Carrega variáveis de ambiente do .env se existir
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

echo "==> Parando containers anteriores..."
docker compose down

echo "==> Limpando recursos Docker não utilizados..."
docker image prune -f
docker container prune -f
docker network prune -f
docker volume prune -f --filter "label!=keep"
docker builder prune -f

echo "==> Fazendo build da imagem..."
docker compose build --no-cache

echo "==> Subindo banco de dados..."
docker compose up -d db

echo "==> Aguardando banco ficar pronto..."
until docker compose exec db pg_isready -U "${POSTGRES_USER:-gestmed}" -d "${POSTGRES_DB:-gestmed_exams}" > /dev/null 2>&1; do
  sleep 1
done

echo "==> Rodando migrations..."
docker compose run --rm api sh -c "npx prisma migrate deploy"

echo "==> Subindo a API..."
docker compose up -d api

echo "==> Logs da API (Ctrl+C para sair):"
docker compose logs -f api
