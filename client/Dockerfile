# --- Etapa 1: build ---
FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Vite "quema" las variables VITE_* dentro del bundle en tiempo de build,
# por eso se pasan como build-arg y no como variable de entorno en runtime.
ARG VITE_SERVER_URL=http://localhost:3001
ENV VITE_SERVER_URL=$VITE_SERVER_URL

RUN npm run build

# --- Etapa 2: runtime (nginx sirviendo los estáticos) ---
FROM nginx:1.27-alpine AS runtime
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s \
  CMD wget -q --spider http://localhost:80 || exit 1
