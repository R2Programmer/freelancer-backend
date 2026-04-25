# =============================================================================
# Freelancer OS — Backend (NestJS + Prisma)
# =============================================================================

# -----------------------------------------------------------------------------
# Stage 1: Install all dependencies
# bcrypt uses native C++ bindings — needs build tools on Alpine
# -----------------------------------------------------------------------------
FROM node:22-alpine AS deps
WORKDIR /app

RUN apk add --no-cache python3 make g++

COPY package*.json ./
RUN npm ci

# -----------------------------------------------------------------------------
# Stage 2: Build (compile TypeScript + generate Prisma client)
# -----------------------------------------------------------------------------
FROM node:22-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npx prisma generate
RUN npm run build

# -----------------------------------------------------------------------------
# Stage 3: Development
# Hot-reload via bind mount. Source code is mounted at runtime.
# -----------------------------------------------------------------------------
FROM node:22-alpine AS development
WORKDIR /app

ENV NODE_ENV=development

# Install build tools for native modules (bcrypt)
RUN apk add --no-cache python3 make g++

COPY package*.json ./
RUN npm ci

COPY . .
RUN npx prisma generate

EXPOSE 3001

# Migrations + hot-reload start (command can be overridden in compose)
CMD ["sh", "-c", "npx prisma migrate deploy && npm run start:dev"]

# -----------------------------------------------------------------------------
# Stage 4: Production
# Slim runtime image — no build tools, non-root user
# -----------------------------------------------------------------------------
FROM node:22-alpine AS production
WORKDIR /app

ENV NODE_ENV=production

# Copy compiled app and all node_modules from builder
# (includes prisma CLI — needed for migrate deploy at startup)
COPY --from=builder /app/dist               ./dist
COPY --from=builder /app/node_modules       ./node_modules
COPY --from=builder /app/src/generated      ./src/generated
COPY --from=builder /app/prisma             ./prisma
COPY --from=builder /app/package*.json      ./

COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

# Non-root user
RUN addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 nestjs  \
 && chown -R nestjs:nodejs /app

USER nestjs

EXPOSE 3001

ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["node", "dist/main"]
