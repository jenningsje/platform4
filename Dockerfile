# Use a lightweight Nginx web server image
FROM nginx:alpine

# Copy your HTML file into the default Nginx public directory
COPY index.html /usr/share/nginx/html/index.html

# Expose port 80 for web traffic
EXPOSE 80

# Nginx starts automatically in the base image, no custom CMD needed
