# syntax=docker/dockerfile:1

FROM node:18.12.1
WORKDIR /app
ENV NODE_ENV=production
RUN apt-get update && apt-get install -y default-jdk screen && rm -rf /var/lib/apt/lists/*

COPY brouter brouter
RUN bash ./brouter/scripts/update_segments.sh; exit 0

COPY package.json .
COPY yarn.lock .
RUN yarn build-brouter

COPY ./client/package.json ./client/
COPY ./server/package.json ./server/
RUN yarn install

COPY . .
RUN yarn build

CMD yarn brouter & yarn start