FROM node:16-alpine3.12

WORKDIR /app
COPY ./feed-parser/package*.json .
COPY ./feed-parser ./feed-parser
COPY ./config.json .

RUN npm install
WORKDIR /app/feed-parser/
RUN npm run build

WORKDIR /app/feed-parser-dist
CMD ["node", "main.js"]