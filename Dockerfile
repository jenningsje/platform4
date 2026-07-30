FROM alpine:3.24

# Install Node.js and npm
RUN apk add --no-cache nodejs npm

# Set working directory
WORKDIR /app

# Copy application files
COPY . .

# Expose the application port
EXPOSE 8000

# Start the CommonJS Node server
CMD ["node", "server.cjs"]
