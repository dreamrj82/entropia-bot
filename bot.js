const { Client, GatewayIntentBits } = require('discord.js');
const express = require('express');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers
    ]
});

const app = express();
app.use(express.json());

/* ===========================
   CHANNEL MAP
=========================== */

const CHANNELS = {
    story: "1500979145965043815",
    image: "1500979219335872592",
    video: "1500979380938346596",
    vu: "1501086859022045194", // announcement channel
    museum_update: "1501086990097977506"
};

/* ===========================
   LOG CHANNEL
=========================== */

const LOG_CHANNEL_ID = "1500978013565751359";

/* ===========================
   BOT READY FLAG
=========================== */

let botReady = false;

client.once('ready', () => {
    botReady = true;
    console.log(`🤖 Logged in as ${client.user.tag}`);
});

/* ===========================
   LOG HELPER
=========================== */

function logToDiscord(message) {
    try {
        const channel = client.channels.cache.get(LOG_CHANNEL_ID);

        if (channel) {
            channel.send(message);
        }

    } catch (err) {
        console.error("❌ Log send failed:", err);
    }
}

/* ===========================
   AUTO ROLE ON JOIN
=========================== */

client.on('guildMemberAdd', async (member) => {

    try {

        const roleName = "Colonist";

        const role = member.guild.roles.cache.find(r => r.name === roleName);

        if (!role) {
            console.log("❌ Colonist role not found");
            logToDiscord("❌ Colonist role not found");
            return;
        }

        await member.roles.add(role);

        console.log(`✅ Assigned Colonist to ${member.user.tag}`);
        logToDiscord(`🟢 ${member.user.tag} joined and was assigned Colonist`);

    } catch (err) {

        console.error("❌ Role assignment failed:", err);
        logToDiscord(`❌ Role assignment failed for ${member.user.tag}`);

    }

});

/* ===========================
   HEALTH CHECK
=========================== */

app.get('/', (req, res) => {
    res.send('Bot is running');
});

/* ===========================
   API ENDPOINT
=========================== */

app.post('/post-content', async (req, res) => {

    try {

        if (!botReady) {
            return res.status(503).json({
                error: "Bot not ready yet"
            });
        }

        const { type, title, url } = req.body;

        const channelId = CHANNELS[type];

        if (!channelId) {
            return res.status(400).json({
                error: "Invalid type"
            });
        }

        const channel = await client.channels.fetch(channelId);

        if (!channel) {
            return res.status(404).json({
                error: "Channel not found"
            });
        }

        let message = '';

        switch(type) {

            case 'story':
                message = `📖 **New Story Added!**\n\n**${title}**\n${url}`;
                break;

            case 'image':
                message = `🖼️ **New Gallery Image Added!**\n\n**${title}**\n${url}`;
                break;

            case 'video':
                message = `🎬 **New Video Added!**\n\n**${title}**\n${url}`;
                break;

            case 'vu':
                message = `🚀 **New Version Update Added!**\n\n**${title}**\n${url}`;
                break;

            case 'museum_update':
                message = `🏛️ **New Museum Update Posted!**\n\n**${title}**\n${url}`;
                break;

            default:
                message = `📢 **New Content Added!**\n\n**${title}**\n${url}`;
        }

        await channel.send(message);

        logToDiscord(`📢 New ${type} posted: ${title}`);

        res.json({
            success: true
        });

    } catch (err) {

        console.error("❌ Post error:", err);

        logToDiscord(`❌ Post error: ${err.message}`);

        res.status(500).json({
            error: "Failed to post"
        });

    }

});

/* ===========================
   START SERVER
=========================== */

const PORT = process.env.PORT;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🌐 API running on port ${PORT}`);
});

/* ===========================
   LOGIN LAST
=========================== */

client.login(process.env.DISCORD_TOKEN);
