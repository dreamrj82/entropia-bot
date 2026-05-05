const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers
    ]
});

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

client.login(process.env.DISCORD_TOKEN);
