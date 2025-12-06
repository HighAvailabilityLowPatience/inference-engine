# Use the official Bun image
FROM oven/bun:1

WORKDIR /app

# Copy only dependency files first (cache-friendly layer)
COPY package.json bun.lockb ./

# Install deps using bun
RUN bun install

# Copy the full source
COPY . .

# Expose UI port
EXPOSE 3000

# Run the dev server (or switch to build+serve when ready for prod)
CMD ["bun", "run", "dev"]
