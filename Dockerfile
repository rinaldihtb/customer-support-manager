FROM node:24.9.0-alpine AS base
WORKDIR /app

FROM base AS backend
WORKDIR /app/backend
COPY backend/package*.json .
RUN yarn install
COPY backend/ .
EXPOSE 8100
CMD ["node", "server.js"]


FROM base AS frontend
WORKDIR /app/frontend
COPY frontend/package*.json .
RUN yarn install
COPY frontend .
EXPOSE 8200
CMD ["yarn", "dev"]