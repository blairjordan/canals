# Copy all the files needed for building the app
FROM node:16-alpine AS base
WORKDIR /app
COPY package.json ./
COPY . ./
RUN npm install

# Sqitch build stage
FROM sqitch/sqitch:1.2.1 as build
USER 0
RUN apt-get update \
  && apt-get install -yq --no-install-recommends curl git perl make openssh-client libpq-dev \
  && curl -fsSL https://deb.nodesource.com/setup_16.x | bash - \
  && apt-get install -yq --no-install-recommends nodejs \
  && npm install -g yarn \
  && cpan -T TAP::Parser::SourceHandler::pgTAP
WORKDIR /app
COPY --from=base /app /app
COPY db ./db
ENTRYPOINT []
EXPOSE 80

# Bundle application run time depenendencies
FROM node:16-alpine as app_bundle
WORKDIR /app
COPY --from=build /app ./

# Build application image
FROM node:16-alpine AS app
WORKDIR /app
COPY --from=app_bundle /app /app
EXPOSE 80
CMD [ "node", "server.js" ]
