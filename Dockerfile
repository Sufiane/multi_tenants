# ============================================
# Stage 1: Base - Install dependencies
# ============================================
FROM node:24-alpine AS base

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /app

# Copy package files
COPY package*.json ./

# ============================================
# Stage 2: Dependencies - Install all deps
# ============================================
FROM base AS dependencies

ENV HUSKY=0
ENV NPM_CONFIG_IGNORE_SCRIPTS=1

# Install all dependencies (including dev dependencies)
RUN npm ci

# ============================================
# Stage 3: Build - Generate Prisma and build TypeScript
# ============================================
FROM dependencies AS build

# Copy source code
COPY --chown=nodejs:nodejs . .

# Generate Prisma Client
RUN npx prisma generate --schema=src/prisma/schema.prisma

# Build the application
RUN npm run build

# ============================================
# Stage 4: Development - Hot reload setup
# ============================================
FROM dependencies AS dev

# Copy source code
COPY --chown=nodejs:nodejs . .

# Reuse Prisma Client generated at build time
COPY --from=build --chown=nodejs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=build --chown=nodejs:nodejs /app/node_modules/@prisma ./node_modules/@prisma

# Change ownership
RUN chown -R nodejs:nodejs /app

USER nodejs

EXPOSE 3000

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

CMD ["npm", "run", "start:dev"]

# ============================================
# Stage 5: Production - Minimal runtime
# ============================================
FROM base AS production

# Set NODE_ENV
ENV NODE_ENV=production
ENV HUSKY=0
ENV NPM_CONFIG_IGNORE_SCRIPTS=1

# Install only production dependencies
RUN npm ci --omit=dev && npm cache clean --force

# Copy built application from build stage
COPY --from=build --chown=nodejs:nodejs /app/dist ./dist

# Copy Prisma schema and generated client
COPY --from=build --chown=nodejs:nodejs /app/src/prisma ./src/prisma
COPY --from=build --chown=nodejs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=build --chown=nodejs:nodejs /app/node_modules/@prisma ./node_modules/@prisma

# Change ownership
RUN chown -R nodejs:nodejs /app

USER nodejs

EXPOSE 3000

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

CMD ["node", "dist/main"]
