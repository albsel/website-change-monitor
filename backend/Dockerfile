# Use a small Node image
FROM node:22-alpine

# Set working directory
WORKDIR /app

# Copy only package files first (for cached installs)
COPY package.json package-lock.json ./

# Install dependencies (production only for this PoC)
RUN npm ci --only=production

# Copy the rest of the backend code
COPY src ./src
COPY data ./data

# Ensure history folder exists at runtime
RUN mkdir -p /app/data/history

# Env + port
ENV NODE_ENV=production
EXPOSE 3001

# Start the server
CMD ["npm", "start"]
