FROM node:20-alpine

WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm

# Copy lockfile & package.json for the processor
COPY pnpm-lock.yaml ./
COPY services/processor/package.json ./

# FIX: Allow lockfile updates during build
RUN pnpm install --prod --no-frozen-lockfile

# Copy full service source
COPY services/processor ./

CMD ["node", "index.js"]
