const express = require('express');
const { createCanvas, loadImage } = require('@napi-rs/canvas');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/welcome', async (req, res) => {
    const { avatar, username, server, members } = req.query;

    if (!avatar || !username) {
        return res.status(400).send('avatar ve username parametreleri gerekli');
    }

    try {
        // 1. Canvas oluştur (kartının boyutlarına göre ayarla)
        const canvas = createCanvas(1024, 600);
        const ctx = canvas.getContext('2d');

        // 2. Arka planı yükle ve çiz
        const background = await loadImage(path.join(__dirname, 'betterbot-arkaplan.png'));
        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

        // 3. Avatarı yükle ve ortadaki halkaya çiz
        const avatarImage = await loadImage(avatar);
        const avatarSize = 180;
        const avatarX = (canvas.width - avatarSize) / 2;
        const avatarY = (canvas.height - avatarSize) / 2 - 20;
        
        ctx.save();
        ctx.beginPath();
        ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(avatarImage, avatarX, avatarY, avatarSize, avatarSize);
        ctx.restore();

        // 4. Kullanıcı adını yaz
        ctx.font = 'bold 36px Arial';
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'center';
        ctx.fillText(username, canvas.width / 2, canvas.height / 2 + avatarSize / 2 + 50);

        // 5. Sunucu adını ve üye sayısını yaz (isteğe bağlı)
        ctx.font = '24px Arial';
        ctx.fillStyle = '#AAAAAA';
        ctx.fillText(`Sunucu: ${server || 'Bilinmiyor'} | Üye: ${members || '0'}`, canvas.width / 2, canvas.height / 2 + avatarSize / 2 + 90);

        // 6. Resmi PNG olarak gönder
        const buffer = canvas.toBuffer('image/png');
        res.set('Content-Type', 'image/png');
        res.send(buffer);

    } catch (error) {
        console.error(error);
        res.status(500).send('Kart oluşturulamadı');
    }
});

app.listen(PORT, () => {
    console.log(`API ${PORT} portunda çalışıyor`);
});
