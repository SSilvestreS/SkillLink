# Multi-stage build para otimizar tamanho da imagem
FROM node:18-alpine AS base

# Instalar dependências do sistema
RUN apk add --no-cache \
    dumb-init \
    curl \
    && addgroup -g 1001 -S nodejs \
    && adduser -S nestjs -u 1001

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./

# Stage de dependências
FROM base AS deps
RUN npm ci --only=production && npm cache clean --force

# Stage de build
FROM base AS build
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage de desenvolvimento
FROM base AS development
RUN npm ci
COPY . .
EXPOSE 3000
CMD ["npm", "run", "start:dev"]

# Stage de produção
FROM base AS production

# Instalar dependências de produção
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/package*.json ./

# Criar diretórios necessários
RUN mkdir -p /app/uploads /app/logs && \
    chown -R nestjs:nodejs /app

# Mudar para usuário não-root
USER nestjs

# Expor porta
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Comando de inicialização
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/main.js"]