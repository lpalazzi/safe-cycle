# syntax=docker/dockerfile:1

FROM node:18.12.1
WORKDIR /app
ENV NODE_ENV=production
RUN apt-get update && apt-get install default-jdk screen -y

COPY package.json .
COPY yarn.lock .
COPY ./client/package.json ./client/
COPY ./server/package.json ./server/
RUN yarn install

RUN git submodule update --init

COPY brouter brouter
RUN yarn build-brouter
RUN bash ./brouter/scripts/update_segments.sh

COPY . .
RUN yarn build

CMD screen -dm yarn brouter && yarn start