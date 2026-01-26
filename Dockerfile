FROM node:18-slim

# Install Python, Pip and FFmpeg
RUN apt-get update && \
    apt-get install -y python3 python3-pip ffmpeg && \
    ln -s /usr/bin/python3 /usr/bin/python

# Force update yt-dlp to bypass blocks
RUN pip3 install -U yt-dlp --break-system-packages

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# Set permissions for cookies
RUN chmod 644 cookies.txt

EXPOSE 8000
CMD ["node", "api/ytdownload.js"]
