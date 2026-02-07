# Build stage for Frontend
FROM node:18-alpine AS frontend-builder
WORKDIR /app
COPY package*.json ./
COPY tsconfig.json ./
COPY vite.config.ts ./
COPY src ./src
COPY index.html ./
COPY postcss.config.js ./
COPY tailwind.config.js ./

ARG GEMINI_API_KEY
ENV GEMINI_API_KEY=$GEMINI_API_KEY

RUN npm ci
RUN npm run build

# Build stage for Backend (and final image)
FROM node:18-alpine
WORKDIR /app

# Copy backend dependencies and source
COPY backend/package*.json ./backend/
WORKDIR /app/backend
RUN npm ci --omit=dev

COPY backend/server.js ./

# Copy frontend build artifacts from frontend-builder
# copy to ../dist relative to backend/server.js, so /app/dist
WORKDIR /app
COPY --from=frontend-builder /app/dist ./dist

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8080

# Expose port
EXPOSE 8080

# Start the server
WORKDIR /app/backend
CMD ["node", "server.js"]
