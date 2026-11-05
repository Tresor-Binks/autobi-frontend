# --- ÉTAPE 1 : Build de l'application ---
FROM node:20-alpine AS builder
WORKDIR /app

# Copier les fichiers de configuration des dépendances
COPY package.json package-lock.json* yarn.lock* pnpm-lock.yaml* bun.lockb* ./

# Installer les dépendances
RUN \
  if [ -f package-lock.json ]; then npm ci; \
  elif [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm i --frozen-lockfile; \
  elif [ -f bun.lockb ]; then corepack enable bun && bun install --frozen-lockfile; \
  else npm install; \
  fi

# Copier le reste du code source
COPY . .

# Déclencher le build (génère le dossier /dist ou /build)
RUN \
  if [ -f package-lock.json ]; then npm run build; \
  elif [ -f yarn.lock ]; then yarn build; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm run build; \
  elif [ -f bun.lockb ]; then corepack enable bun && bun run build; \
  else npm run build; \
  fi


# --- ÉTAPE 2 : Serveur de production (Nginx) ---
FROM nginx:1.25-alpine AS runner

# Copier la configuration personnalisée de Nginx (essentielle pour le routing React)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copier les fichiers buildés depuis l'étape précédente vers le répertoire Nginx
# Note : Remplacez "dist" par "build" si vous utilisez Create React App au lieu de Vite
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
