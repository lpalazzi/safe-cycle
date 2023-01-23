# syntax=docker/dockerfile:1

FROM node:18.12.1
WORKDIR /app
ENV NODE_ENV=production

COPY package.json .
COPY yarn.lock .
COPY ./client/package.json ./client/
COPY ./server/package.json ./server/
RUN yarn install 

COPY . .
RUN yarn build

CMD yarn start