# ---- Build ----
FROM node:22.12-alpine AS build
WORKDIR /app

# copia solo manifiestos para aprovechar cache
COPY package.json ./
RUN npm install

# copia el resto y construye
COPY . .
RUN npm run build

# ---- Runtime ----
FROM nginx:1.27-alpine

# (opcional) SSL y conf si las usas
COPY docker/nginx-ssl.conf /etc/nginx/conf.d/default.conf
COPY docker/ssl/localhost-cert.pem /etc/nginx/ssl/localhost-cert.pem
COPY docker/ssl/localhost-key.pem  /etc/nginx/ssl/localhost-key.pem

# sirve el build
COPY --from=build /app/dist /usr/share/nginx/html
