# Produção (Railway / Docker) — sem build pesado obrigatório
FROM node:20-alpine

RUN apk add --no-cache curl

WORKDIR /app

COPY package.json package-lock.json* ./
# App não exige deps de runtime; install é no-op se vazio
RUN npm install --omit=dev 2>/dev/null || true

COPY server.js package.json ./
COPY lib/ lib/
COPY api/ api/

COPY index.html admin.html manifest.json sitemap.xml sw.js robots.txt ./
COPY assets/ assets/
COPY imagem/ imagem/

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:${PORT:-3000}/health || exit 1

CMD ["node", "server.js"]
