// MPBot by light2k4 (https://discord.gg/YmA88jc7GF)
// Cette commande permet de claim une clé premium pour le serveur sur lequel elle est exécutée.

const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const db = require('../../db.js');
const log = require('../../logger.js');
const { format, addDays } = require("date-fns");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('claim')
        .setDescription('Claim une clé premium pour le serveur sur lequel cette commande est exécutée.')
        .addStringOption(option => 
            option.setName('key')
                .setDescription('La clé premium à claim')
                .setRequired(true)),
    async execute(interaction) {
        if (!interaction.user.id === (await interaction.guild.fetch()).ownerId) {
            const errorEmbed = new EmbedBuilder()
                .setTitle('403 - Non autorisé')
                .setColor('#FF0000')
                .setDescription('Vous devez être le propriétaire du serveur pour utiliser cette commande.');
            return await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }

        const guildId = interaction.guild.id;
        const key = interaction.options.getString('key');

        // check if guild is already premium
        const isPremium = await checkPremiumStatus(guildId);
        if (isPremium) {
            const errorEmbed = new EmbedBuilder()
                .setTitle('Erreur')
                .setColor('#FF0000')
                .setDescription('Ce serveur possède déjà une licence premium.');
            return await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }

        // check if key is valid
        const keyData = await checkKey(key);
        if (!keyData) {
            const errorEmbed = new EmbedBuilder()
                .setTitle('Erreur')
                .setColor('#FF0000')
                .setDescription('La clé premium est invalide ou déjà utilisée.');
            return await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }

        // if key is valid, update premium, buy_date, expire_date(if set in premium_keys table) and license_key in guilds table
        const now = new Date();
        const nowFormatted = format(now, "yyyy-MM-dd HH:mm:ss");
        const expireDate = keyData.expiration_date ? new Date(keyData.expiration_date) : null;
        const expireDateFormatted = expireDate ? format(expireDate, "yyyy-MM-dd HH:mm:ss") : null;
        await db.runAsync('UPDATE guilds SET premium = 1, buy_date = ?, expire_date = ?, license_key = ? WHERE guild_id = ?', [nowFormatted, expireDateFormatted, key, guildId]);
        await db.runAsync('UPDATE premium_keys SET used = 1, used_by_user = ?, used_for_guild = ?, used_date = ? WHERE key = ?', [interaction.user.id, guildId, nowFormatted, key]);
        
        const successEmbed = new EmbedBuilder()
            .setTitle('Succès')
            .setColor('#00FF00')
            .setDescription(`La clé \`${key}\` a été utilisée avec succès pour ce serveur.`)
            .addFields(
                { name: 'Expiration', value: expireDate ? format(expireDate, "dd/MM/yyyy HH:mm:ss") : 'Illimité', inline: true },
            )
            .setFooter({ text: 'Merci pour votre soutien ! - MPBot by light2k4' })
            .setTimestamp();
        await interaction.reply({ embeds: [successEmbed] });
        log.info(`La clé ${key} a été utilisée avec succès pour le serveur ${guildId}`);
    }
};


// check if guild is already premium
function checkPremiumStatus(guildId) {
    return new Promise((resolve, reject) => {
        db.get('SELECT premium FROM guilds WHERE guild_id = ?', [guildId], (err, row) => {
            if (err) {
                return reject(err);
            }
            resolve(row && row.premium);
        });
    });
}

// function check if key is valid
function checkKey(key) {
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM premium_keys WHERE key = ? AND used = 0', [key], (err, row) => {
            if (err) {
                return reject(err);
            }
            if (row && row.expiration_date) {
                const expirationDate = new Date(row.expiration_date);
                if (expirationDate < new Date()) {
                    return resolve(null);
                }
            }
            resolve(row);
        });
    });
}

