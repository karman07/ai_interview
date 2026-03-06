# ─── Stage 1: Build ───
FROM node:20-alpine AS builder

WORKDIR /app

# Install deps (including devDependencies for build)
COPY package.json package-lock.json ./
RUN npm ci

# Copy prisma schema & generate client
COPY prisma ./prisma/
RUN npx prisma generate

# Copy source & build
COPY . .
RUN npm run build


# ─── Stage 2: Production (Cloud Run) ───
FROM node:20-alpine

WORKDIR /app

# Install production deps only
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copy Prisma schema & generated client from builder
COPY --from=builder /app/prisma ./prisma/
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Copy compiled output
COPY --from=builder /app/dist ./dist

# Cloud Run injects PORT env var (default 8080)
ENV PORT=8080
EXPOSE 8080

CMD ["node", "dist/main"]
