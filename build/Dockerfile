#### FRONTEND
FROM node:18-alpine AS frontend-builder
WORKDIR /app
COPY package*.json ./
COPY tsconfig.json ./
COPY vite.config.ts ./
COPY src ./src
COPY public ./public
COPY index.html ./
COPY postcss.config.js ./
COPY tailwind.config.js ./

ARG GEMINI_API_KEY
ENV GEMINI_API_KEY=$GEMINI_API_KEY

ARG VITE_BACKEND_URL
ENV VITE_BACKEND_URL=$VITE_BACKEND_URL

RUN npm ci
RUN npm run build

#### BACKEND    
FROM node:18-alpine
WORKDIR /app

COPY backend/package*.json ./backend/
WORKDIR /app/backend
RUN npm ci --omit=dev

COPY backend/server.js ./

WORKDIR /app
COPY --from=frontend-builder /app/dist ./dist
ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080

WORKDIR /app/backend
CMD ["node", "server.js"]
