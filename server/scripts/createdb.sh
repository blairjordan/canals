#!/bin/bash

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

# Set environment variables
POSTGRES_CONTAINER_NAME=canal-postgres
POSTGRES_USER=canaluser
POSTGRES_PASSWORD=canalpassword
POSTGRES_DB=canaldb
POSTGRES_PORT=5432

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

echo "🚚 Copying SQL to container ..."

docker cp $SCRIPT_DIR/createdb.sql $POSTGRES_CONTAINER_NAME:/createdb.sql

echo "🌊 Creating DB objects ..."

docker exec $POSTGRES_CONTAINER_NAME psql -U canaluser canaldb -f ./createdb.sql

echo -n "🌏 Container IP ($POSTGRES_CONTAINER_NAME):"
printf " %s\n" $(docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' $POSTGRES_CONTAINER_NAME)

echo -e "🔗 PostgreSQL Connection String: \033[0;36mpostgres://$POSTGRES_USER:$POSTGRES_PASSWORD@localhost:$POSTGRES_PORT/$POSTGRES_DB"
