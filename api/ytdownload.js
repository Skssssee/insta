const express = require('express');
const { exec } = require('child_process');
const cors = require('cors');
const path = require('path');
const app = express();

app.use(cors());

// Home page par error na aaye isliye empty route
app.get('/', (req, res) => res.send("Scrapper Engine is Running! Use /api/ytdownload?url=..."));

app.get('/api/ytdownload', (req, res) => {
    const videoUrl = req.query.url;
    console.log(`\n📥 Scrapping Request: ${videoUrl}`);

    if (!videoUrl) {
        return res.status(400).json({ success: false, message: "URL missing!" });
    }

    const cookiePath = path.join(__dirname, '../cookies.txt');

    // BYPASS SCRAPPING COMMAND: 
    // -f "b" select karta hai best pre-merged format bina warning ke
    // extractor-args mein android hata kar ios/mweb rakha hai bypass ke liye
    const command = `python3 -m yt_dlp --cookies "${cookiePath}" --dump-json --no-check-certificate --user-agent "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1" --extractor-args "youtube:player_client=ios,mweb,web" -f "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/b" --no-playlist "${videoUrl}"`;

    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`❌ Scrapping Error: ${stderr}`);
            return res.status(500).json({ success: false, error: "YouTube Scrapping Blocked. Check Cookies or IP." });
        }

        try {
            const data = JSON.parse(stdout);
            res.json({
                success: true,
                data: {
                    title: data.title,
                    thumbnail: data.thumbnail,
                    url: data.url, // Direct Scrapped Link
                    duration: data.duration_string,
                    uploader: data.uploader
                }
            });
            console.log(`✅ Scrapped Successfully: ${data.title}`);
        } catch (e) {
            res.status(500).json({ success: false, message: "Data parsing failed." });
        }
    });
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`🚀 Scrapper Engine Live on Port ${PORT}`));
