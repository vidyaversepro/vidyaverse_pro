# Stage 1: Builder
FROM node:20-alpine AS builder

WORKDIR /app

# Install build dependencies (needed for bcrypt, sharp, etc.)
RUN apk add --no-cache python3 make g++ openssl openssl-dev

# Copy package files
COPY package.json package-lock.json* ./
COPY prisma ./prisma/

# Install all dependencies
RUN npm install

# Copy source
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build TypeScript (tsconfig.build.json has strict:false + skipLibCheck for fast Docker builds)
RUN npx tsc -p tsconfig.build.json

# Prune dev dependencies
RUN npm prune --production

# -------------------------------------------
# Stage 2: Production
FROM node:20-alpine AS production

WORKDIR /app

# Add non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Install runtime dependencies (curl for healthcheck, openssl for Prisma)
RUN apk add --no-cache curl openssl

# Copy from builder
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nodejs:nodejs /app/prisma ./prisma

# Set user
USER nodejs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

# Start application
CMD ["node", "dist/index.js"]
