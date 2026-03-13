FROM mcr.microsoft.com/devcontainers/javascript-node:22

# Enable pnpm via corepack and install helpful tools
RUN corepack enable \
  && corepack prepare pnpm@latest --activate \
  && apt-get update \
  && apt-get install -y postgresql-client \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /workspace

