# ==========================================
# 1. Build Stage for React Frontend
# ==========================================
FROM node:20-alpine AS client-builder
WORKDIR /app/client

COPY client/package*.json ./
RUN npm ci

COPY client/ ./
RUN npm run build

# ==========================================
# 2. Production Stage for Express Server
# ==========================================
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Install production server dependencies
COPY server/package*.json ./server/
RUN cd server && npm ci --only=production

# Copy server code
COPY server/ ./server/

# Copy built frontend assets from builder stage
COPY --from=client-builder /app/client/dist ./client/dist

# Expose port
EXPOSE 5000

# Start server
CMD ["node", "server/server.js"]
