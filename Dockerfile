# FROM node:16.14-alpine3.15 AS build-stage
# RUN npm i -g npm
# WORKDIR /app
# COPY package*.json ./
# RUN npm install
# COPY . .
# ARG node_env
# ENV NODE_ENV=$node_env
# RUN npm run build
FROM node:16.14-alpine3.15
EXPOSE 8080
WORKDIR /app
COPY web/package*.json ./
RUN npm install
COPY web /app
# COPY --from=build-stage /app/dist /app/dist
ENTRYPOINT node .