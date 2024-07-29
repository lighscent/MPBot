// MPBot by light2k4 (https://discord.gg/YmA88jc7GF)
// Cette commande permet de générer une clé premium et de l'ajouter à la base de données
// Pour utiliser cette commande, il faut être le développeur du bot (mettre votre ID dans le fichier .env)

const { SlashCommandBuilder } = require("discord.js");
const log = require("../../logger");
const db = require("../../db");
const { format, addDays } = require("date-fns");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('keypremium')
        .setDescription('[DEV] - Create a premium key')
        .addNumberOption(option => option.setName('expires').setDescription('Number of days before the key expires').setRequired(false)),
    async execute(interaction) {
        try {
            if (interaction.user.id !== process.env.DEV_ID) {
                return interaction.reply({ content: 'You are not allowed to use this command.', ephemeral: true });
            }

            const key = await generateUniqueKey();
            const expiresInDays = interaction.options.getNumber('expires') || null;
            const expirationDate = expiresInDays ? format(addDays(new Date(), expiresInDays), 'yyyy-MM-dd HH:mm:ss') : null;

            const sql = `INSERT INTO premium_keys (key, expiration_date) VALUES (?, ?)`;
            await db.runAsync(sql, [key, expirationDate]);

            let replyMessage = `The premium key has been created: \`${key}\``;
            if (expiresInDays) {
                replyMessage += ` and it will expire in ${expiresInDays} days.`;
            }

            return interaction.reply({ content: replyMessage, ephemeral: true });
        } catch (error) {
            log.error('Error while creating premium key:', error);
            return interaction.reply({ content: 'An error occurred while creating the premium key.', ephemeral: true });
        }
    }
}

async function generateUniqueKey() {
    const existingKeys = await getExistingKeys();
    let key;

    do {
        key = generateKey();
    } while (isKeyTooSimilar(key, existingKeys));

    return key;
}

function generateKey() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789*#?!§%$£&@';
    let key = '';
    for (let i = 0; i < 20; i++) {
        key += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return key;
}

async function getExistingKeys() {
    const rows = await db.allAsync('SELECT key FROM premium_keys');
    return rows.map(row => row.key);
}

function isKeyTooSimilar(newKey, existingKeys) {
    const similarityThreshold = 0.5;
    return existingKeys.some(existingKey => calculateSimilarity(newKey, existingKey) > similarityThreshold);
}

function calculateSimilarity(key1, key2) {
    let matches = 0;
    for (let i = 0; i < Math.min(key1.length, key2.length); i++) {
        if (key1[i] === key2[i]) {
            matches++;
        }
    }
    return matches / Math.max(key1.length, key2.length);
}