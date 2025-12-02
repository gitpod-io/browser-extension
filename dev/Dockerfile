FROM mcr.microsoft.com/devcontainers/base:ubuntu-24.04

# Install Node.js and npm
RUN apt-get update && apt-get install -y curl && \
    curl -fsSL https://deb.nodesource.com/setup_lts.x | bash - && \
    apt-get install -y nodejs && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Install global npm packages
COPY npm-tools/package.json npm-tools/package-lock.json /opt/npm-tools/
RUN cd /opt/npm-tools && \
    npm ci && \
    # Create symlinks for all binaries in node_modules/.bin
    for bin in /opt/npm-tools/node_modules/.bin/*; do \
        ln -sf "$bin" /usr/local/bin/$(basename "$bin"); \
    done && \
    # Cleanup npm cache
    rm -rf ~/.npm/_cacache

# Disable npm/yarn lifecycle scripts by default (security hardening)
# To allow specific packages, use: npm rebuild <package> or yarn rebuild <package>
RUN npm config set ignore-scripts true --location=user && \
    echo 'ignore-scripts true' >> ~/.yarnrc

# Disable npx (security hardening - prevents arbitrary package execution)
RUN rm -f /usr/bin/npx /usr/local/bin/npx && \
    echo '#!/bin/sh' > /usr/local/bin/npx && \
    echo 'echo "npx is disabled for security reasons. Use explicit package installation instead." >&2' >> /usr/local/bin/npx && \
    echo 'exit 1' >> /usr/local/bin/npx && \
    chmod +x /usr/local/bin/npx
