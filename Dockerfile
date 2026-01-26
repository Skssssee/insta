FROM node:18-slim

# Is line se Python aur Pip install honge
RUN apt-get update && \
    apt-get install -y python3 python3-pip ffmpeg && \
    ln -s /usr/bin/python3 /usr/bin/python

# yt-dlp ko update karne ke liye
RUN pip3 install -U yt-dlp --break-system-packages

WORKDIR /app
COPY . .
RUN npm install

EXPOSE 8000
CMD ["node", "api/ytdownload.js"]
