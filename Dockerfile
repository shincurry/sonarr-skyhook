FROM node:16-buster

WORKDIR /usr/src/app

COPY . .
RUN yarn
