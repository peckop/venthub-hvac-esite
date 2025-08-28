# Build stage
FROM node:18-alpine as builder
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN corepack enable && corepack prepare pnpm@latest --activate
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm run build:ci

# Serve stage (Nginx)
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
# Optional: add your custom nginx.conf for caching/compression if needed
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

