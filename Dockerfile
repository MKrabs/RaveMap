# syntax=docker/dockerfile:1

# Stage 1: Build the frontend
FROM node:20-alpine AS build
WORKDIR /app

# Install dependencies using npm (package-lock.json is the source of truth)
COPY package.json package-lock.json ./
RUN npm ci

# Copy source and build using the project's build script
COPY . .
RUN npm run build

# Stage 2: PocketBase runtime with built frontend
FROM alpine:latest

RUN apk add --no-cache ca-certificates wget unzip

# Download PocketBase
ARG POCKETBASE_VERSION=0.22.27
RUN wget -O /tmp/pocketbase.zip "https://github.com/pocketbase/pocketbase/releases/download/v${POCKETBASE_VERSION}/pocketbase_${POCKETBASE_VERSION}_linux_amd64.zip" && \
    unzip /tmp/pocketbase.zip -d /pb/ && \
    chmod +x /pb/pocketbase && \
    rm /tmp/pocketbase.zip

# Copy built frontend to pb_public so PocketBase serves it automatically at /
COPY --from=build /app/dist /pb/pb_public

# Copy PocketBase JS hooks
COPY pb_hooks/ /pb/pb_hooks/

WORKDIR /pb

EXPOSE 8090

# Start PocketBase - serves static files from pb_public and the API from /api/
CMD ["./pocketbase", "serve", "--http=0.0.0.0:8090", "--dir=/pb/pb_data", "--hooksDir=/pb/pb_hooks"]
