FROM node:20 AS base

WORKDIR /usr/src/app

COPY package.json package-lock.json* ./

RUN npm ci

COPY . .

RUN mkdir -p data

EXPOSE 3001

ENV PORT=3001

CMD ["npm", "run", "dev"]