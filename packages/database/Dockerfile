FROM node:18

WORKDIR /app

# Install pnpm and Prisma CLI
RUN npm install -g pnpm prisma

# Copy package.json and lockfile
COPY package.json pnpm-lock.yaml* ./

# Install dependencies
RUN pnpm install --prod

# Copy everything (including prisma/schema.prisma)
COPY . .

CMD ["pnpm", "exec", "prisma", "migrate", "deploy"]