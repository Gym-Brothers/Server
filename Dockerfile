# Use Node.js 18 Alpine as base image for smaller size and better security
FROM node:18-alpine AS base

# Set working directory
WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001

# Copy package files
COPY package.json yarn.lock ./
COPY .yarnrc.yml ./

# Enable Yarn v4 and install dependencies
RUN corepack enable && corepack prepare yarn@4.4.1 --activate

# Development stage
FROM base AS development

# Install all dependencies (including dev dependencies)
RUN yarn install --immutable

# Copy source code
COPY . .

# Change ownership to nestjs user
RUN chown -R nestjs:nodejs /app
USER nestjs

# Expose port
EXPOSE 3000

# Start development server
CMD ["dumb-init", "yarn", "start:dev"]

# Build stage
FROM base AS build

# Install all dependencies
RUN yarn install --immutable

# Copy source code
COPY . .

# Build the application
RUN yarn build

# Remove dev dependencies
RUN yarn workspaces focus --all --production

# Production stage
FROM node:18-alpine AS production

# Install dumb-init
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001

# Set working directory
WORKDIR /app

# Copy built application and production dependencies from build stage
COPY --from=build --chown=nestjs:nodejs /app/dist ./dist
COPY --from=build --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=build --chown=nestjs:nodejs /app/package.json ./package.json

# Switch to non-root user
USER nestjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node dist/main.js --health-check || exit 1

# Start the application
CMD ["dumb-init", "node", "dist/main"]
