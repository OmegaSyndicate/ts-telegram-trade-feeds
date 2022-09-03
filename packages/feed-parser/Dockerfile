FROM node:lts-alpine

WORKDIR /app
COPY ./feed-parser/package*.json .
RUN npm install

COPY ./feed-parser ./feed-parser
COPY ./config.json .

WORKDIR /app/feed-parser/
RUN npm run build

WORKDIR /app/feed-parser-dist
CMD ["node", "main.js"]