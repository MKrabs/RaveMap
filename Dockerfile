# syntax=docker/dockerfile:1
FROM node:20-alpine AS build
WORKDIR /app

# install dependencies (use lockfile for reproducible builds)
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# copy source and build using the project's build script
COPY . .
RUN yarn build

FROM node:20-alpine AS runtime
WORKDIR /app

# copy built assets
COPY --from=build /app/dist ./dist

# small static server (no nginx)
ENV PORT=80
RUN npm install -g serve@14 --no-audit --silent

EXPOSE 80
CMD ["serve", "-s", "dist", "-l", "tcp://0.0.0.0:80"]
