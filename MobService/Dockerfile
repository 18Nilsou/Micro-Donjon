FROM node:20 AS base

WORKDIR /usr/src/app

COPY package.json package-lock.json* ./

RUN npm install

COPY . .

RUN mkdir -p data

EXPOSE 3006

ENV PORT=3006

CMD ["npm", "run", "dev"]
