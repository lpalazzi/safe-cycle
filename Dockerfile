# syntax=docker/dockerfile:1

FROM node:18.12.1
WORKDIR /app

COPY package.json .
COPY yarn.lock .
COPY ./client/package.json ./client/
COPY ./server/package.json ./server/
RUN yarn install 

COPY . .
ENV NODE_ENV=production
RUN yarn build
