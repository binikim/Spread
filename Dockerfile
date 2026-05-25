# Stage 1: Install dependencies
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files and prisma schema
COPY package.json package-lock.json ./
COPY prisma ./prisma/

# Install all dependencies (including devDependencies like tsx/typescript for the worker)
RUN npm ci

# Stage 2: Build the application and generate Prisma client
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set environment variable to trigger standalone build in next.config.js
ENV NEXT_STANDALONE=true

# Generate Prisma Client and build Next.js application
RUN npx prisma generate
RUN npm run build

# Stage 3: Runner stage
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Copy built application and files
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/package-lock.json ./package-lock.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/worker ./worker
COPY --from=builder /app/tsconfig.json ./tsconfig.json

# Create database volume directory to ensure it can be mapped for persistence
RUN mkdir -p /app/prisma/data

EXPOSE 3000

# Default command to start the Next.js web application
CMD ["npm", "run", "start"]
