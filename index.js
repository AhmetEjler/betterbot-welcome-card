const express = require('express');
const { WelcomeCard } = require('discord-welcome-card');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/welcome', async (req, res) => {
    const { avatar, username, server, members } = req.query;
    
    if (!avatar || !username) {
        return res.status(400).send('avatar ve username parametreleri gerekli');
    }

    try {
        const card = new WelcomeCard()
            .setAvatar(avatar)
            .setUsername(username)
            .setServerName(server || 'Sunucu')
            .setMemberCount(members || '0')
            .setBackground(path.join(__dirname, 'betterbot-arkaplan.png'));

        const buffer = await card.build();
        
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
