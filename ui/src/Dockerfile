# 1. Build the UI
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# 2. Serve using a tiny static web server (best practice)
FROM nginx:alpine

# Copy build output to nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port
EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
