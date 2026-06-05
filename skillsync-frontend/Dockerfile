# =============================================================================
# Stage 1 — build the Vite React app
# =============================================================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy manifest first for better Docker cache hits
COPY package.json package-lock.json* ./
RUN npm install --no-audit --no-fund

# Copy the rest of the source and build
COPY . .
RUN npm run build

# =============================================================================
# Stage 2 — serve the static bundle through Nginx and proxy API requests
#           to the Spring Cloud Gateway.
# =============================================================================
FROM nginx:1.27-alpine

# Replace the default Nginx config with our SPA + API-gateway-proxy config.
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the static build output produced in stage 1.
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
