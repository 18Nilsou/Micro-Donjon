# Micro-Donjon Front

Vue.js frontend for the Micro-Donjon game.

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

The app will be available at http://localhost:5173

### Compile and Minify for Production

```sh
npm run build
```

## Environment Variables

Create a `.env` file:

```
VITE_API_URL=http://localhost:3000/api
```

## Features

- Game setup (select hero and dungeon)
- Dungeon visualization with grid-based map
- Hero stats and inventory display
- Combat interface
- Real-time game state management

## API Integration

The frontend connects to the Gateway service (default: http://localhost:3000) which proxies requests to:
- Game Engine
- Hero Service
- Dungeon Service
- Item Service
- Mob Service

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

