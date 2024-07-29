// MPBot by light2k4 (https://discord.gg/YmA88jc7GF)
// Ce fichier permet de créer le client Discord.js.

const { Client, GatewayIntentBits } = require('discord.js');
require('dotenv').config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMessages, 
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.DirectMessages
    ]
})

client.login(process.env.TOKEN);

module.exports = client;