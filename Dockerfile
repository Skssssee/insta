FROM node:18-slim

# Install Python and FFmpeg
RUN apt-get update && \
    apt-get install -y python3 python3-pip ffmpeg curl && \
    ln -s /usr/bin/python3 /usr/bin/python

# Force update yt-dlp to bypass YouTube's latest blocks
RUN pip3 install -U yt-dlp --break-system-packages

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# Set cookie permissions
RUN chmod 644 cookies.txt

EXPOSE 8000
CMD ["node", "api/ytdownload.js"]
