# Use Node.js LTS (Alpine for smaller image)
FROM node:18-alpine

# Install system dependencies (ffmpeg is REQUIRED for merging, python3 for yt-dlp)
# Install system dependencies (ffmpeg is REQUIRED for merging, python3 for yt-dlp)
RUN apk add --no-cache ffmpeg python3 py3-pip

# Install yt-dlp via pip (most reliable method for Alpine)
RUN pip3 install yt-dlp --break-system-packages

# Set working directory
WORKDIR /app

# Copy package.json files first (for caching)
COPY frontend/package*.json ./frontend/
COPY backend/package*.json ./backend/

# Install frontend dependencies
WORKDIR /app/frontend
RUN npm install
# Install backend dependencies
WORKDIR /app/backend
RUN npm install

# Copy source code
WORKDIR /app
COPY . .

# Build frontend
WORKDIR /app/frontend
RUN npm run build

# Expose backend port
EXPOSE 5000

# Start backend (which serves frontend in production)
WORKDIR /app/backend
ENV NODE_ENV=production
ENV PORT=5000
CMD ["npm", "start"]
