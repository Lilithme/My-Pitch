FROM node:22-alpine

WORKDIR /app

COPY ./vite.config.js /app/vite.config.js
COPY ./package.json /app/package.json
COPY ./package-lock.json /app/package-lock.json
COPY ./src /app/src
COPY ./static /app/static

RUN cd /app && npm install
RUN cd /app && npm run build

CMD cd /app && npm run serve
