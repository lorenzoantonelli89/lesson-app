# ---- Base Node ----
FROM node:18 AS base

WORKDIR /app

# ---- Dependencies ----
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

# ---- Build ----
FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# ---- Production ----
FROM base AS prod
ENV NODE_ENV=production
COPY --from=build /app .
CMD ["npm", "run", "dev"] 