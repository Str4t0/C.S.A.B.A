# Frontend Dockerfile
# DevOps Engineer: Tom Wilson

FROM node:18-alpine as build

WORKDIR /app

# Függőségek telepítése
COPY package*.json ./
RUN npm install

# Alkalmazás másolása és build
COPY . .
RUN npm run build

# Production image - nginx
FROM nginx:alpine

# Build eredmények másolása
COPY --from=build /app/dist /usr/share/nginx/html

# Nginx konfiguráció
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
