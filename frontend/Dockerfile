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

# Run database migrations
RUN npx prisma db push

# Expose port
EXPOSE 3000

# Start development server
CMD ["npm", "run", "dev"] 