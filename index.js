const express = require('express');
const { createCanvas, loadImage } = require('@napi-rs/canvas');
const path = require('path');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/welcome', async (req, res) => {
    const { avatar, username, server, members } = req.query;

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
        const avatarCenterX = 512;
        const avatarCenterY = 265;
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
        ctx.strokeStyle = '#00F0FF';
        ctx.lineWidth = 4;
        ctx.shadowColor = '#00F0FF';
        ctx.shadowBlur = 15;
        ctx.stroke();
        ctx.shadowBlur = 0;

        ctx.font = 'bold 34px Arial';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#6396ff';
        ctx.shadowColor = '#3168d8';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 3;
        ctx.shadowOffsetY = 3;
        ctx.fillText(username, canvas.width / 2, 440);
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;

        ctx.font = '22px Arial';
        ctx.fillStyle = '#AAAAAA';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
        ctx.shadowBlur = 6;
        ctx.fillText(`Sunucu: ${server || 'Bilinmiyor'} | Üye: ${members || '0'}`, canvas.width / 2, 480);
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
        console.error(error);
        res.status(500).send('Kart oluşturulamadı');
    }
});

app.listen(PORT, () => {
    console.log(`API ${PORT} portunda çalışıyor`);
});
