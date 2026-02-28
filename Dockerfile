# ─── Stage 1: Build ───
FROM node:20-alpine AS builder

WORKDIR /app

# Install deps first (layer caching)
COPY package.json package-lock.json ./
RUN npm ci

# Copy source & build
COPY . .
RUN npm run build


# ─── Stage 2: Serve with Nginx (Cloud Run) ───
FROM nginx:1.27-alpine

# Remove default config
RUN rm /etc/nginx/conf.d/default.conf

# Nginx config template — uses $PORT injected by Cloud Run (default 8080)
COPY <<'EOF' /etc/nginx/templates/default.conf.template
server {
    listen       ${PORT};
    server_name  _;
    root         /usr/share/nginx/html;
    index        index.html;

    # gzip
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript image/svg+xml;
    gzip_min_length 256;

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }
}
EOF

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

ENV PORT=8080
EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
