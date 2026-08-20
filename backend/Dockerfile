# --- Build stage: compile TypeScript to JavaScript ---
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# --- Production stage: only runtime deps + compiled output ---
# Keeping this separate from the build stage means the final image doesn't
# carry TypeScript, ts-node, or dev tooling — smaller image, smaller attack
# surface, faster to pull on EC2.
FROM node:20-alpine AS production
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=build /app/dist ./dist

EXPOSE 4000
CMD ["node", "dist/server.js"]
