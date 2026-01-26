const express = require('express');
const { exec } = require('child_process');
const cors = require('cors');
const app = express();

app.use(cors());

// Endpoint: /api/nuelink?url=VIDEO_URL
app.get('/api/nuelink', (req, res) => {
    const videoUrl = req.query.url;

    // Koyeb Terminal Logs
    console.log(`\n📥 [NEW REQUEST]: ${videoUrl}`);

    if (!videoUrl) {
        return res.status(400).json({ success: false, message: "URL parameter is missing!" });
    }

    // Best command to bypass blocks and get MP4
    const command = `python3 -m yt_dlp --dump-json --no-check-certificate --format "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best" "${videoUrl}"`;

    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`❌ Scraper Error: ${stderr}`);
            return res.status(500).json({ success: false, message: "Could not fetch video. Instagram might be blocking us." });
        }

        try {
            const metadata = JSON.parse(stdout);
            
            // Exactly like the other site's response structure
            res.json({
                success: true,
                data: {
                    title: metadata.title || "Instagram Video",
                    thumbnail: metadata.thumbnail,
                    url: metadata.url, // Main Video Link
                    uploader: metadata.uploader,
                    duration: metadata.duration_string,
                    source: "Insta-DLX Powered by Koyeb"
                }
            });
            console.log(`✅ Successfully scraped: ${metadata.title}`);
        } catch (e) {
            res.status(500).json({ success: false, message: "Failed to parse video data." });
        }
    });
});

// Koyeb Port logic
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`🚀 Scraper Engine is running on port ${PORT}`);
    console.log(`🔗 Test Link: http://localhost:${PORT}/api/nuelink?url=VIDEO_URL`);
});
