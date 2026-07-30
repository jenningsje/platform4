FROM alpine:3.24

# Install Node.js, npm, and build tools if needed for native packages
RUN apk add --no-cache nodejs npm

# Set working directory
WORKDIR /app

# Copy package files first to leverage Docker cache
COPY package*.json ./

# Install project dependencies (including tsx if listed in package.json)
RUN npm install

# Copy the rest of your application files (including main.ts and src/)
COPY . .

# Expose the application port
EXPOSE 8000

# Use array format for CMD so Docker runs it properly without shell wrapping issues
CMD ["npx", "tsx", "./src/main.ts"]