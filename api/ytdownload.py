from http.server import BaseHTTPRequestHandler
import json
import yt_dlp
import os
import shutil
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

        # Vercel Temporary Cookies Fix
        original_cookie_path = os.path.join(os.getcwd(), 'cookies.txt')
        temp_cookie_path = '/tmp/cookies.txt'
        if os.path.exists(original_cookie_path):
            shutil.copy2(original_cookie_path, temp_cookie_path)

        # UPDATED: Flexible Format Selection
        ydl_opts = {
            'format': 'bestvideo+bestaudio/best', # Force merge ya jo best ho wo uthao
            'quiet': True,
            'no_warnings': True,
            'nocheckcertificate': True,
            'user_agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
            'extractor_args': {
                'youtube': {
                    'player_client': ['android', 'ios'], # Mobile clients are harder to block
                    'player_skip': ['webpage', 'configs'],
                }
            }
        }

        if os.path.exists(temp_cookie_path):
            ydl_opts['cookiefile'] = temp_cookie_path

        try:
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(video_url, download=False)
                
                # Link nikalne ki optimized logic
                formats = info.get('formats', [])
                # Filter for links that are actually accessible
                download_url = info.get('url') or (formats[-1].get('url') if formats else None)

                res_data = {
                    "success": True,
                    "data": {
                        "title": info.get('title'),
                        "thumbnail": info.get('thumbnail'),
                        "url": download_url,
                        "uploader": info.get('uploader'),
                        "duration": info.get('duration_string')
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
