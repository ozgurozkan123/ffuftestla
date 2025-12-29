FROM node:22-bookworm-slim

# Install ffuf binary and basic utilities
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    wget \
    && wget -O /tmp/ffuf.deb "https://ftp.debian.org/debian/pool/main/f/ffuf/ffuf_2.1.0-1+b9_amd64.deb" \
    && dpkg -i /tmp/ffuf.deb || apt-get -f install -y \
    && rm -f /tmp/ffuf.deb \
    && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000
ENV FFUF_PATH=/usr/bin/ffuf

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
