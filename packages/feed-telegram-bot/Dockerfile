FROM node:lts-alpine

WORKDIR /app
COPY ./feed-telegram-bot/package*.json .
COPY ./feed-telegram-bot ./feed-telegram-bot
COPY ./feed-parser/helpers ./feed-parser/helpers
COPY ./config.json ./feed-telegram-bot-dist/config.json

RUN npm install
WORKDIR /app/feed-telegram-bot/
RUN npm run build
RUN ls -la **/**

WORKDIR /app/feed-telegram-bot-dist/feed-telegram-bot
CMD ["node", "main.js"]