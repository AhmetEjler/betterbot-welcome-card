const express = require('express');
const { createCanvas, loadImage } = require('@napi-rs/canvas');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;

// uploads klasörünü oluştur (yoksa)
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

// uploads klasörünü statik olarak sun
app.use('/uploads', express.static(uploadsDir));

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
        ctx.fillText(username, canvas.width / 2, 480);
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;

        ctx.font = '22px Arial';
        ctx.fillStyle = '#AAAAAA';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
        ctx.shadowBlur = 6;
        ctx.fillText(`Sunucu: ${server || 'Bilinmiyor'} | Üye: ${members || '0'}`, 240, 560);
        ctx.shadowBlur = 0;

        // Resmi uploads klasörüne kaydet
        const fileName = `${uuidv4()}.png`;
        const filePath = path.join(uploadsDir, fileName);
        const buffer = canvas.toBuffer('image/png');
        fs.writeFileSync(filePath, buffer);

        // Resim linkini döndür
        const imageUrl = `https://${req.get('host')}/uploads/${fileName}`;
        res.json({ url: imageUrl });
    } catch (error) {
        console.error(error);
        res.status(500).send('Kart oluşturulamadı');
    }
});

app.listen(PORT, () => {
    console.log(`API ${PORT} portunda çalışıyor`);
});
