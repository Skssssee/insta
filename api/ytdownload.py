from http.server import BaseHTTPRequestHandler
import json
import yt_dlp
import os
from urllib.parse import urlparse, parse_qs

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        # 1. URL se query parameters nikalna
        query = urlparse(self.path).query
        params = parse_qs(query)
        video_url = params.get('url', [None])[0]

        if not video_url:
            self.send_response(400)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({"success": False, "message": "Bhai, URL missing hai!"}).encode())
            return

        # 2. Cookies setup
        cookie_path = os.path.join(os.getcwd(), 'cookies.txt')

        # 3. Heavy Scrapper Options
        ydl_opts = {
            'format': 'best',
            'quiet': True,
            'no_warnings': True,
            'nocheckcertificate': True,
            'user_agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        }

        # Agar Instagram hai toh cookies aur extra headers use karein
        if "instagram.com" in video_url:
            if os.path.exists(cookie_path):
                ydl_opts['cookiefile'] = cookie_path
            ydl_opts['addheader'] = [('Accept-Language', 'en-US,en;q=0.9')]

        try:
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(video_url, download=False)
                
                # Sahi link nikalne ki logic
                final_url = info.get('url')
                if not final_url and 'formats' in info:
                    final_url = info['formats'][-1].get('url')

                res_data = {
                    "success": True,
                    "data": {
                        "title": info.get('title', 'Video'),
                        "thumbnail": info.get('thumbnail'),
                        "url": final_url,
                        "uploader": info.get('uploader'),
                        "duration": info.get('duration_string'),
                        "platform": "YouTube" if "youtu" in video_url else "Instagram"
                    }
                }

                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps(res_data).encode())

        except Exception as e:
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({"success": False, "error": str(e)}).encode())
