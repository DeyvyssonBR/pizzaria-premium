FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production && cp -r node_modules /prod_modules
RUN npm ci

COPY scripts/build-images.js scripts/build-images.js
COPY imagem/ imagem/
COPY assets/img/ assets/img/

RUN mkdir -p assets/img/cardapio && \
    node scripts/build-images.js 2>/dev/null || echo "Image build opt-in; skipping."

FROM node:18-alpine

RUN apk add --no-cache curl

WORKDIR /app

COPY --from=builder /prod_modules node_modules

COPY server.js package.json ./
COPY api/ api/

COPY index.html admin.html manifest.json sitemap.xml sw.js vercel.json ./
COPY assets/ assets/
COPY imagem/ imagem/

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/ || exit 1

ENV NODE_ENV=production

CMD ["node", "server.js"]
