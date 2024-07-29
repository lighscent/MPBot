const { SlashCommandBuilder } = require("discord.js");
const log = require("../../logger");
const db = require("../../db");
const { format } = require("date-fns");

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
            let expirationDate = null;

            if (expiresInDays) {
                const expiration = new Date();
                expiration.setDate(expiration.getDate() + expiresInDays);
                expirationDate = format(expiration, 'yyyy-MM-dd HH:mm:ss');
            }

            const sql = `INSERT INTO premium_keys (key, expiration_date) VALUES (?, ?)`;
            const values = [key, expirationDate];

            await db.runAsync(sql, values);

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
    const upperCaseLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowerCaseLetters = 'abcdefghijklmnopqrstuvwxyz';
    const digits = '0123456789';
    const specialCharacters = '*#?!§%$£&@';
    const allCharacters = upperCaseLetters + lowerCaseLetters + digits + specialCharacters;

    let key = '';
    let lastCharType = '';

    for (let i = 0; i < 20; i++) {
        let char;
        let charType;

        do {
            char = allCharacters.charAt(Math.floor(Math.random() * allCharacters.length));
            if (upperCaseLetters.includes(char)) {
                charType = 'upper';
            } else if (digits.includes(char)) {
                charType = 'digit';
            } else if (specialCharacters.includes(char)) {
                charType = 'special';
            } else {
                charType = 'lower';
            }
        } while (charType === lastCharType);

        key += char;
        lastCharType = charType;
    }

    return key;
}

async function getExistingKeys() {
    return new Promise((resolve, reject) => {
        db.all('SELECT key FROM premium_keys', [], (err, rows) => {
            if (err) {
                return reject(err);
            }
            resolve(rows.map(row => row.key));
        });
    });
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