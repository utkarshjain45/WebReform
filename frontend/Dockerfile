# ==============================================================================
# React + TypeScript SPA Container (Node.js Alpine)
# ==============================================================================
FROM node:20-alpine

WORKDIR /app

# Install dependencies with exact lockfile reproducibility
COPY package*.json ./
RUN npm ci

# Build static bundle
COPY . .

# Inject build-time environment variables for Vite bundle
ARG VITE_API_URL=/api
ARG VITE_ACCESS_CODE
ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_ACCESS_CODE=${VITE_ACCESS_CODE}

RUN npm run build

# Expose port for the web application
EXPOSE 3000

ENV HOST=0.0.0.0
ENV PORT=3000

# Healthcheck targeting the preview server
HEALTHCHECK --interval=20s --timeout=3s --retries=3 \
    CMD node -e "fetch('http://127.0.0.1:3000').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "3000"]
