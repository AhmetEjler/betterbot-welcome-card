const express = require('express');
const { createCanvas, loadImage } = require('@napi-rs/canvas');
const path = require('path');
const url = require('url');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==================== HG (HOŞ GELDİN) ====================
app.all('/welcome', async (req, res) => {
    const queryObject = url.parse(req.url, true).query;
    const avatar = req.body.avatar || queryObject.avatar;
    const username = req.body.username || queryObject.username;
    const members = req.body.members || queryObject.members;

    if (!avatar || !username) {
        return res.status(400).send('avatar ve username parametreleri gerekli');
    }

    try {
        const canvas = createCanvas(1024, 600);
        const ctx = canvas.getContext('2d');

        const background = await loadImage(path.join(__dirname, 'betterbot-arkaplan.png'));
        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

        const avatarImage = await loadImage(avatar);
        const avatarSize = 160;
        const avatarCenterX = 510;
        const avatarCenterY = 212;
        const avatarX = avatarCenterX - (avatarSize / 2);
        const avatarY = avatarCenterY - (avatarSize / 2);

        ctx.save();
        ctx.beginPath();
        ctx.arc(avatarCenterX, avatarCenterY, avatarSize / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(avatarImage, avatarX, avatarY, avatarSize, avatarSize);
        ctx.restore();

        ctx.beginPath();
        ctx.arc(avatarCenterX, avatarCenterY, (avatarSize / 2) + 4, 0, Math.PI * 2);
        ctx.strokeStyle = '#73A2E0';
        ctx.lineWidth = 4;
        ctx.shadowColor = '#73A2E0';
        ctx.shadowBlur = 15;
        ctx.stroke();
        ctx.shadowBlur = 0;

        ctx.font = 'bold 34px Arial';
        ctx.fillStyle = '#6396ff';
        ctx.textAlign = 'center';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
        ctx.shadowBlur = 8;
        ctx.fillText(username, canvas.width / 2, 495);

        ctx.font = '22px Arial';
        ctx.fillStyle = '#AAAAAA';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
        ctx.shadowBlur = 6;
        ctx.fillText(`Üye: ${members || '0'}`, 90, 560);
        ctx.shadowBlur = 0;

        const buffer = canvas.toBuffer('image/png');
        const result = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream({ resource_type: 'image' }, (error, result) => {
                if (error) reject(error);
                else resolve(result);
            }).end(buffer);
        });

        res.send(result.secure_url);
    } catch (error) {
        console.error('HG Hata:', error);
        res.status(500).send('Kart oluşturulamadı: ' + error.message);
    }
});

// ==================== HB (HOŞÇA KAL) ====================
app.all('/goodbye', async (req, res) => {
    const queryObject = url.parse(req.url, true).query;
    const avatar = req.body.avatar || queryObject.avatar;
    const username = req.body.username || queryObject.username;
    const members = req.body.members || queryObject.members;

    if (!avatar || !username) {
        return res.status(400).send('avatar ve username parametreleri gerekli');
    }

    try {
        const canvas = createCanvas(1024, 600);
        const ctx = canvas.getContext('2d');

        const background = await loadImage(path.join(__dirname, 'betterbot-hb-arkaplan.png'));
        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

        const avatarImage = await loadImage(avatar);
        const avatarSize = 160;
        const avatarCenterX = 510;
        const avatarCenterY = 225;
        const avatarX = avatarCenterX - (avatarSize / 2);
        const avatarY = avatarCenterY - (avatarSize / 2);

        ctx.save();
        ctx.beginPath();
        ctx.arc(avatarCenterX, avatarCenterY, avatarSize / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(avatarImage, avatarX, avatarY, avatarSize, avatarSize);
        ctx.restore();

        ctx.beginPath();
        ctx.arc(avatarCenterX, avatarCenterY, (avatarSize / 2) + 4, 0, Math.PI * 2);
        ctx.strokeStyle = '#ff4444';
        ctx.lineWidth = 4;
        ctx.shadowColor = '#ff4444';
        ctx.shadowBlur = 15;
        ctx.stroke();
        ctx.shadowBlur = 0;

        ctx.font = 'bold 34px Arial';
        ctx.fillStyle = '#ff4444';
        ctx.textAlign = 'center';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
        ctx.shadowBlur = 8;
        ctx.fillText(username, canvas.width / 2, 495);

        ctx.font = '22px Arial';
        ctx.fillStyle = '#AAAAAA';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
        ctx.shadowBlur = 6;
        ctx.fillText(`Üye: ${members || '0'}`, 90, 560);
        ctx.shadowBlur = 0;

        const buffer = canvas.toBuffer('image/png');
        const result = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream({ resource_type: 'image' }, (error, result) => {
                if (error) reject(error);
                else resolve(result);
            }).end(buffer);
        });

        res.send(result.secure_url);
    } catch (error) {
        console.error('HB Hata:', error);
        res.status(500).send('Kart oluşturulamadı: ' + error.message);
    }
});

app.listen(PORT, () => {
    console.log(`API ${PORT} portunda çalışıyor`);
});
