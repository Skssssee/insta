from http.server import BaseHTTPRequestHandler
import json
import yt_dlp
import os
from urllib.parse import urlparse, parse_qs

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        query = urlparse(self.path).query
        params = parse_qs(query)
        video_url = params.get('url', [None])[0]

        if not video_url:
            self.send_response(400)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({"success": False, "message": "URL missing!"}).encode())
            return

        cookie_path = os.path.join(os.getcwd(), 'cookies.txt')

        # FINAL BYPASS SETTINGS
        ydl_opts = {
            'format': 'best',
            'quiet': True,
            'no_warnings': True,
            'nocheckcertificate': True,
            # Fake User Agent
            'user_agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
            # Force YouTube to use Android Clients (Hard to block)
            'extractor_args': {
                'youtube': {
                    'player_client': ['android', 'web'],
                    'player_skip': ['webpage', 'configs'],
                }
            }
        }

        # Load cookies if available
        if os.path.exists(cookie_path):
            ydl_opts['cookiefile'] = cookie_path

        try:
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(video_url, download=False)
                
                res_data = {
                    "success": True,
                    "data": {
                        "title": info.get('title'),
                        "thumbnail": info.get('thumbnail'),
                        "url": info.get('url'),
                        "duration": info.get('duration_string'),
                        "uploader": info.get('uploader')
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
            # Error message for debugging
            self.wfile.write(json.dumps({"success": False, "error": str(e)}).encode())
