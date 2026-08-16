# STAGE 1: Build the React App
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# STAGE 2: Serve with Nginx
FROM nginx:stable-alpine
# Copy the compiled files from the build stage
COPY --from=build /app/docs /usr/share/nginx/html
# Copy your custom Nginx config (we made this earlier)
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]