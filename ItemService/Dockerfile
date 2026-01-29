FROM oven/bun:1 AS base

WORKDIR /usr/src/app

COPY package.json bun.lockb* ./

RUN bun install --frozen-lockfile

COPY . .

RUN mkdir -p data

RUN bun run seed

EXPOSE 3004

ENV PORT=3004

CMD ["bun", "run", "src/index.ts"]