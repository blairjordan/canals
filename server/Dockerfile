# Build application image
FROM node:16-alpine AS app
WORKDIR /app

# install sqitch
RUN apk add --no-cache --virtual build-deps \
    g++ make \
    perl-dev tzdata \
    perl-dbd-pg postgresql-client && \
    cp /usr/share/zoneinfo/UTC /etc/localtime && \
    echo UTC > /etc/timezone && \
    perl -MCPAN -e "CPAN::Shell->notest('install', 'App::Sqitch')" && \
    apk del build-deps

# To use sqitch postgresql
RUN apk add --no-cache bash perl perl-dbd-pg postgresql-client

# Copy source code and install dependencies
COPY package.json ./
COPY . ./
RUN npm install

# Copy Sqitch changes and deploy them
COPY db ./db

# Copy start script
COPY ./start.sh /app/start.sh
RUN chmod +x /app/start.sh

# Expose ports and start application
EXPOSE 3000
EXPOSE 3001
CMD [ "/bin/bash", "/app/start.sh" ]
