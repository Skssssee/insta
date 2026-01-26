const express = require('express');
const { exec } = require('child_process');
const cors = require('cors');
const path = require('path');
const app = express();

app.use(cors());

app.get('/api/ytdownload', (req, res) => {
    const videoUrl = req.query.url;
    console.log(`\n📥 Request for: ${videoUrl}`);

    if (!videoUrl) {
        return res.status(400).json({ success: false, message: "URL missing!" });
    }

    // Path to cookies in root
    const cookiePath = path.join(__dirname, '../cookies.txt');

    // Bypass Command: Force Android client to avoid bot detection
    const command = `python3 -m yt_dlp --cookies "${cookiePath}" --dump-json --no-check-certificate --user-agent "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36" --extractor-args "youtube:player_client=android,web" --format "best" "${videoUrl}"`;

    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`❌ Error: ${stderr}`);
            return res.status(500).json({ success: false, error: stderr.split('\n')[0] });
        }

        try {
            const data = JSON.parse(stdout);
            res.json({
                success: true,
                data: {
                    title: data.title,
                    thumbnail: data.thumbnail,
                    url: data.url,
                    duration: data.duration_string,
                    uploader: data.uploader
                }
            });
            console.log(`✅ Success: ${data.title}`);
        } catch (e) {
            res.status(500).json({ success: false, message: "Data parsing failed." });
        }
    });
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`🚀 Scraper Engine Live on Port ${PORT}`));
