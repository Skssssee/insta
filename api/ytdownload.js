const express = require('express');
const { exec } = require('child_process');
const cors = require('cors');
const path = require('path');
const app = express();

app.use(cors());

// Aapka specific endpoint
app.get('/api/ytdownload', (req, res) => {
    const videoUrl = req.query.url;
    
    if (!videoUrl) {
        return res.status(400).json({ success: false, message: "YouTube URL toh daal bhai!" });
    }

    const cookiePath = path.join(__dirname, '../cookies.txt');

    // BYPASS COMMAND: YouTube ko lagega ye iPhone se request hai
    const command = `python3 -m yt_dlp --cookies "${cookiePath}" --dump-json --no-check-certificate --user-agent "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1" --extractor-args "youtube:player_client=ios,mweb" -f "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/b" --no-playlist "${videoUrl}"`;

    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`❌ Scrape Error: ${stderr}`);
            return res.status(500).json({ success: false, error: "YouTube blocked this request. Check cookies." });
        }

        try {
            const data = JSON.parse(stdout);
            res.json({
                success: true,
                data: {
                    title: data.title,
                    url: data.url, // Direct Scrapped Download Link
                    thumbnail: data.thumbnail,
                    duration: data.duration_string,
                    uploader: data.uploader
                }
            });
        } catch (e) {
            res.status(500).json({ success: false, message: "Parsing failed." });
        }
    });
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`🚀 YouTube Engine Live on Port ${PORT}`));
