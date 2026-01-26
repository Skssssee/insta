const express = require('express');
const { exec } = require('child_process');
const cors = require('cors');
const path = require('path');
const app = express();

app.use(cors());

app.get('/api/ytdownload', (req, res) => {
    const videoUrl = req.query.url;
    if (!videoUrl) return res.status(400).json({ success: false, message: "URL missing!" });

    const cookiePath = path.join(__dirname, '../cookies.txt');

    // NEW BYPASS STRATEGY:
    // 1. Android client use kiya hai jo cookies handle kar sakta hai.
    // 2. n-challenge solve karne ke liye player_client settings badli hain.
    const command = `python3 -m yt_dlp --cookies "${cookiePath}" --dump-json --no-check-certificate --user-agent "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36" --extractor-args "youtube:player_client=android,web;player_skip=webpage,configs" -f "best" --no-playlist "${videoUrl}"`;

    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`❌ Scrape Error: ${stderr}`);
            return res.status(500).json({ success: false, error: "YouTube still blocking. PO-Token or Oauth required." });
        }
        try {
            const data = JSON.parse(stdout);
            res.json({
                success: true,
                data: {
                    title: data.title,
                    url: data.url,
                    thumbnail: data.thumbnail
                }
            });
        } catch (e) {
            res.status(500).json({ success: false, message: "Parsing failed." });
        }
    });
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`🚀 YouTube Engine Live on Port ${PORT}`));
