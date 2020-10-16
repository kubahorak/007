# https://nodejs.org/en/docs/guides/nodejs-docker-webapp/
FROM node:12

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 9000
CMD [ "node", "server/server.js" ]
