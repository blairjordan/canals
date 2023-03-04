#!/bin/bash

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

# Set environment variables
POSTGRES_CONTAINER_NAME=canal-postgres
POSTGRES_USER=canaluser
POSTGRES_PASSWORD=canalpassword
POSTGRES_DB=canaldb
POSTGRES_PORT=5432
POSTGRES_HOST=localhost
SQITCH_TARGET=db:pg://$POSTGRES_USER:$POSTGRES_PASSWORD@$POSTGRES_HOST:$POSTGRES_PORT/$POSTGRES_DB

echo "🚧 Stopping and removing existing container ..."
docker stop $POSTGRES_CONTAINER_NAME >/dev/null 2>&1
docker rm $POSTGRES_CONTAINER_NAME >/dev/null 2>&1

sleep 5

echo "🐘 Creating PostgreSQL container ..."

docker run -d \
  --name $POSTGRES_CONTAINER_NAME \
  -e POSTGRES_USER=canaluser \
  -e POSTGRES_PASSWORD=canalpassword \
  -e POSTGRES_DB=canaldb \
  -e POSTGRES_HOST_AUTH_METHOD=trust \
  -p 5432:5432 \
  postgres:latest >/dev/null 2>&1

sleep 5

cd db

echo "🐳 Pulling sqitch image ..."

docker pull -q sqitch/sqitch

echo "⬇ Downloading Sqitch bash script ..."

curl -sL https://git.io/JJKCn -o sqitch && chmod +x sqitch

echo "🌊 Deploying DB objects ..."
./sqitch deploy --target $SQITCH_TARGET

echo -n "🌏 Container IP ($POSTGRES_CONTAINER_NAME):"
printf " %s\n" $(docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' $POSTGRES_CONTAINER_NAME)

echo -e "🔗 PostgreSQL Connection String: \033[0;36mpostgres://$POSTGRES_USER:$POSTGRES_PASSWORD@$POSTGRES_HOST:$POSTGRES_PORT/$POSTGRES_DB"
