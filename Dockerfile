# ==========================================
# Stage 1: Build the Frontend (React + Vite)
# ==========================================
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

# Copy frontend package manifests
COPY frontend/package*.json ./
RUN npm ci

# Copy frontend source code
COPY frontend/ ./

# Build the static assets (outputs to frontend/dist)
RUN npm run build

# ==========================================
# Stage 2: Build the Backend (Node + Express + TS)
# ==========================================
FROM node:20-alpine AS backend-builder
WORKDIR /app/backend

# Copy backend package manifests
COPY backend/package*.json ./
RUN npm ci

# Copy backend source code
COPY backend/ ./

# Build the TypeScript files (outputs to backend/dist)
RUN npm run build

# ==========================================
# Stage 3: Monolithic Runner (Node + Nginx)
# ==========================================
FROM node:20-alpine AS runner

# Install Nginx
RUN apk add --no-cache nginx && mkdir -p /run/nginx

# Set up backend runtime directory
WORKDIR /app/backend

# Copy backend built files and package manifests
COPY --from=backend-builder /app/backend/dist ./dist
COPY --from=backend-builder /app/backend/package*.json ./

# Install only production dependencies for the backend
RUN npm ci --only=production

# Copy frontend static build to Nginx public directory
COPY --from=frontend-builder /app/frontend/dist /usr/share/nginx/html

# Copy frontend static build to Express public directory (for direct Node hosting on Render)
COPY --from=frontend-builder /app/frontend/dist ./public

# Copy Nginx server configuration
COPY nginx.conf /etc/nginx/http.d/default.conf

# Copy and prepare startup script
COPY start.sh /app/start.sh
RUN chmod +x /app/start.sh

# Expose Nginx port (which reverse-proxies back to port 3000)
EXPOSE 80

# Run both Nginx and Node.js backend
CMD ["/app/start.sh"]
