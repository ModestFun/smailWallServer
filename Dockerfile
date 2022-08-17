FROM node:latest

WORKDIR /app
COPY . .
CMD npm install --registry=https://registry.npmmirror.com && npm start
