lfrom http.server import BaseHTTPRequestHandler
import json
import yt_dlp
from urllib.parse import urlparse, parse_qs

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        # 1. URL se YouTube link nikalna
        query = urlparse(self.path).query
        params = parse_qs(query)
        video_url = params.get('url', [None])[0]

        if not video_url:
            self.send_response(400)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({"success": False, "message": "YouTube URL is required!"}).encode())
            return

        # 2. yt-dlp settings for YouTube
        ydl_opts = {
            # Sabse acchi quality ka MP4 download link
            'format': 'best[ext=mp4]/best',
            'quiet': True,
            'no_warnings': True,
            'nocheckcertificate': True,
        }

        try:
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(video_url, download=False)
                
                # Response data structure
                response_data = {
                    "success": True,
                    "data": {
                        "title": info.get('title'),
                        "thumbnail": info.get('thumbnail'),
                        "duration": info.get('duration_string'),
                        "views": info.get('view_count'),
                        "url": info.get('url'), # Direct Download Link
                        "uploader": info.get('uploader')
                    }
                }

                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps(response_data).encode())

        except Exception as e:
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({"success": False, "error": str(e)}).encode())
