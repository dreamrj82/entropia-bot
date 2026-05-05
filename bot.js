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
    video: "1500979380938346596"
};

/* ===========================
   BOT READY
=========================== */

client.once('ready', () => {
    console.log(`🤖 Logged in as ${client.user.tag}`);
});

/* ===========================
   AUTO ROLE ON JOIN
=========================== */

client.on('guildMemberAdd', async (member) => {
    try {
        const roleName = "Colonist";

        const role = member.guild.roles.cache.find(r => r.name === roleName);

        if (!role) {
            console.log("❌ Colonist role not found");
            return;
        }

        await member.roles.add(role);
        console.log(`✅ Assigned Colonist to ${member.user.tag}`);

    } catch (err) {
        console.error("❌ Role assignment failed:", err);
    }
});

/* ===========================
   API ENDPOINT
=========================== */

app.post('/post-content', async (req, res) => {
    try {
        const { type, title, url } = req.body;

        const channelId = CHANNELS[type];

        if (!channelId) {
            return res.status(400).json({ error: "Invalid type" });
        }

        const channel = await client.channels.fetch(channelId);

        if (!channel) {
            return res.status(404).json({ error: "Channel not found" });
        }

        await channel.send(`📢 **New ${type} added!**\n\n**${title}**\n${url}`);

        res.json({ success: true });

    } catch (err) {
        console.error("❌ Post error:", err);
        res.status(500).json({ error: "Failed to post" });
    }
});

/* ===========================
   START EVERYTHING
=========================== */

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`🌐 API running on port ${PORT}`);
});

client.login(process.env.DISCORD_TOKEN);
