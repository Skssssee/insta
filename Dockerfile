FROM node:18-slim

# Install Python and full JavaScript support for yt-dlp
RUN apt-get update && \
    apt-get install -y python3 python3-pip ffmpeg curl nodejs && \
    ln -s /usr/bin/python3 /usr/bin/python

# Force upgrade yt-dlp to latest (har din update hota hai)
RUN pip3 install -U yt-dlp --break-system-packages

WORKDIR /app
COPY . .
RUN npm install
RUN chmod 644 cookies.txt

EXPOSE 8000
CMD ["node", "api/ytdownload.js"]
