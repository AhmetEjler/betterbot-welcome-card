const express = require('express');
const { createCanvas, loadImage } = require('@napi-rs/canvas');
const path = require('path');
const url = require('url');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.Welcome_Card,
    api_key: process.env.178321835179337,
    api_secret: process.env.le7yxY-GzwHuxqX_6nxisznyfq8,
});

const app = express();
const PORT = process.env.PORT || 3000;

// POST body'sini okuyabilmek için
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Hem GET hem POST kabul et
app.all('/welcome', async (req, res) => {
    // GET'ten query, POST'tan body parametrelerini oku
    const queryObject = url.parse(req.url, true).query;
    
    const avatar = req.body.avatar || queryObject.avatar;
    const username = req.body.username || queryObject.username;
    const server = req.body.server || queryObject.server;
    const members = req.body.members || queryObject.members;

    console.log('Gelen parametreler:', { avatar, username, server, members });

    if (!avatar || !username) {
        return res.status(400).send('avatar ve username parametreleri gerekli. Gelen: ' + JSON.stringify({ avatar, username }));
    }

    try {
        const canvas = createCanvas(1024, 600);
        const ctx = canvas.getContext('2d');

        const background = await loadImage(path.join(__dirname, 'betterbot-arkaplan.png'));
        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

        const avatarImage = await loadImage(avatar);
        const avatarSize = 160;
        const avatarCenterX = 498;
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
        ctx.fillText(`Sunucu: ${server || 'Bilinmiyor'} | Üye: ${members || '0'}`, 240, 560);
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
        console.error('Hata:', error);
        res.status(500).send('Kart oluşturulamadı: ' + error.message);
    }
});

app.listen(PORT, () => {
    console.log(`API ${PORT} portunda çalışıyor`);
});
