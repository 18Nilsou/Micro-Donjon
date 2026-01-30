FROM node:20 AS base

WORKDIR /usr/src/app

COPY package.json package-lock.json* ./

RUN npm install

COPY . .

RUN mkdir -p data

EXPOSE 3000

ENV PORT=3000

CMD ["npm", "run", "dev"]