FROM node:20-alpine

WORKDIR /usr/src/app

COPY package.json ./

RUN npm install

COPY . .

RUN mkdir -p data

RUN npm run build

EXPOSE 3001

ENV PORT=3001
ENV REDIS_HOST=redis-game
ENV REDIS_PORT=6379

CMD ["npm", "start"]