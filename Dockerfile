# Docker image for platforms that expect a container (Render Web Service, Fly.io, etc.)
# Heroku free dynos were discontinued in 2022 — prefer GitHub Pages or Render Static.

FROM python:3.12-slim AS parser
WORKDIR /app
COPY parser/pyproject.toml parser/README.md ./parser/
COPY parser/src ./parser/src
COPY files ./files
RUN pip install --no-cache-dir ./parser \
  && bmw-parse parse-dir /app/files -o /app/data

FROM node:22-alpine AS builder
WORKDIR /app
COPY viewer/package.json viewer/package-lock.json ./
RUN npm ci
COPY viewer/ ./
COPY --from=parser /app/data ./public/data
ARG BASE_PATH=
ENV BASE_PATH=$BASE_PATH
RUN npm run build

FROM nginx:1.27-alpine
COPY --from=builder /app/out /usr/share/nginx/html
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
