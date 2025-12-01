FROM mcr.microsoft.com/devcontainers/base:ubuntu-24.04

# Install Node.js and npm
RUN apt-get update && apt-get install -y curl && \
    curl -fsSL https://deb.nodesource.com/setup_lts.x | bash - && \
    apt-get install -y nodejs && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Install claude-code globally
RUN npm i -g @anthropic-ai/claude-code

RUN rm -f /usr/bin/npx /usr/local/bin/npx && \
    echo '#!/bin/sh' > /usr/local/bin/npx && \
    echo 'echo "npx is disabled for security reasons. Use explicit package installation instead." >&2' >> /usr/local/bin/npx && \
    echo 'exit 1' >> /usr/local/bin/npx && \
    chmod +x /usr/local/bin/npx

USER node
RUN npm config set ignore-scripts true --location=user && \
    echo 'ignore-scripts true' >> ~/.yarnrc
