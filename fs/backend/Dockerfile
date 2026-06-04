FROM node:24-alpine AS deps

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY tsconfig.json eslint.config.ts drizzle.config.ts ./
COPY src ./src
COPY scripts ./scripts
COPY drizzle ./drizzle

FROM deps AS build

RUN npm run build

FROM build AS tools

CMD ["npm", "run", "drizzle:migrate"]

FROM node:24-alpine AS runtime

ENV NODE_ENV=production
WORKDIR /app

COPY --from=deps /app/package*.json ./
COPY --from=deps /app/node_modules ./node_modules
RUN npm prune --omit=dev

COPY --from=build /app/package*.json ./
COPY --from=build /app/dist ./dist

EXPOSE 3000
CMD ["npm", "start"]
