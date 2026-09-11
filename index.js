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
        // 1. Canvas oluştur
        const canvas = createCanvas(1024, 600);
        const ctx = canvas.getContext('2d');

        // 2. Arka planı yükle ve çiz
        const background = await loadImage(path.join(__dirname, 'betterbot-arkaplan.png'));
        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

        // 3. Avatarı halkanın tam merkezine oturt
        const avatarImage = await loadImage(avatar);
        const avatarSize = 160;
        const avatarCenterX = 512;
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

        // 3.1 Avatarın etrafına neon mavi halka çiz
        ctx.beginPath();
        ctx.arc(avatarCenterX, avatarCenterY, (avatarSize / 2) + 4, 0, Math.PI * 2);
        ctx.strokeStyle = '#73A2E0';
        ctx.lineWidth = 4;
        ctx.shadowColor = '#73A2E0';
        ctx.shadowBlur = 15;
        ctx.stroke();
        ctx.shadowBlur = 0;

        // 4. Kullanıcı adını yaz (halkanın altına, okunaklı şekilde)
        ctx.font = 'bold 34px Arial';
        ctx.fillStyle = '#73A2E0';
        ctx.textAlign = 'center';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
        ctx.shadowBlur = 8;
        ctx.fillText(username, canvas.width / 2, 440);

        // 5. Sunucu adını ve üye sayısını yaz
        ctx.font = '22px Arial';
        ctx.fillStyle = '#AAAAAA';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
        ctx.shadowBlur = 6;
        ctx.fillText(`Sunucu: ${server || 'Bilinmiyor'} | Üye: ${members || '0'}`, canvas.width / 2, 480);

        // Gölgeyi sıfırla
        ctx.shadowBlur = 0;

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
