FROM mcr.microsoft.com/devcontainers/base:ubuntu-24.04

# Install Node.js and npm
RUN apt-get update && apt-get install -y curl && \
    curl -fsSL https://deb.nodesource.com/setup_lts.x | bash - && \
    apt-get install -y nodejs && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Install claude-code globally
RUN npm i -g @anthropic-ai/claude-code
