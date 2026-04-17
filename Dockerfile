# Base image
FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
RUN apk add --no-cache openssl

# Dependencies stage
FROM base AS dependencies
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm config set allow-build-scripts true
RUN pnpm install --frozen-lockfile

# Build stage
FROM base AS build
WORKDIR /app
COPY . .
COPY --from=dependencies /app/node_modules ./node_modules
RUN npx prisma generate
RUN pnpm run build
RUN pnpm prune --prod

# Production stage
FROM base AS production
WORKDIR /app
ENV NODE_ENV=production

# Copy built assets and production node_modules
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json ./package.json

# If you heavily use CLI via npm/pnpm start scripts
# COPY --from=build /app/prisma ./prisma

EXPOSE 5000

CMD ["node", "dist/main"]
