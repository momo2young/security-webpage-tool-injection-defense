FROM rust:1.83-bookworm

# Install system dependencies
RUN apt-get update -qq && \
    apt-get install -y -qq curl git build-essential libssl-dev pkg-config && \
    rm -rf /var/lib/apt/lists/*

# Install microsandbox
RUN curl -sSL https://raw.githubusercontent.com/zerocore-ai/microsandbox/refs/heads/main/scripts/install_microsandbox.sh | sh

# Add to PATH
ENV PATH="/root/.local/bin:${PATH}"

# Pre-download kernels to avoid runtime download
# KVM is not needed for pulling images
RUN msb pull microsandbox/python
RUN msb pull microsandbox/node

# Set working directory
WORKDIR /workspace

# Default command to start the server
CMD ["msb", "server", "start", "--host", "0.0.0.0", "--port", "7263", "--dev"]
