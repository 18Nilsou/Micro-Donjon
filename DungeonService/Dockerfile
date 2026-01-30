FROM node:20 AS base

WORKDIR /usr/src/app

COPY package.json package-lock.json* ./

RUN npm install

COPY . .

RUN mkdir -p data

EXPOSE 3003

ENV PORT=3003
ENV REDIS_HOST=redis-dungeon
ENV REDIS_PORT=6379

CMD ["npm", "run", "dev"]