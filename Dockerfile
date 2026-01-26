FROM node:18-slim

# Machine mein Python aur yt-dlp install karne ke liye
RUN apt-get update && \
    apt-get install -y python3 python3-pip ffmpeg && \
    ln -s /usr/bin/python3 /usr/bin/python

# yt-dlp library install karna
RUN pip3 install yt-dlp --break-system-packages

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

EXPOSE 8000
CMD ["node", "api/nuelink.js"]
