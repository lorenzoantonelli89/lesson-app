# Use Node.js 18 Debian image instead of Alpine
FROM node:18

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Make startup script executable
RUN chmod +x start.sh

# Expose port
EXPOSE 3000

# Start with our script
CMD ["./start.sh"] 