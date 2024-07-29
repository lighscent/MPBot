const { SlashCommandBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, EmbedBuilder } = require('discord.js');
const log = require('../../logger.js');
const db = require('../../db.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('premium')
        .setDescription('Affiche le statut premium de la guilde'),
    async execute(interaction) {
        try {
            const isPremium = await checkPremiumStatus(interaction.guild.id);

            if (isPremium) {
                const successEmbed = createEmbed(
                    'Statut Premium',
                    '#00FF00',
                    'Ce serveur possède une licence premium.',
                    'Merci pour votre soutien ! - MPBot by light2k4.'
                );
                await interaction.reply({ embeds: [successEmbed] });
            } else {
                const fields = [
                    { name: '📊 Rate Limit', value: '`1 envoi/15 minutes`', inline: false },
                    { name: '👥 Users Limit', value: '`500 Users/envoi`', inline: false },
                    { name: '🎟️ Fast Support', value: '`Support sous 24h`', inline: false }
                ];
                const buttons = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setLabel('Acheter Premium')
                            .setStyle(ButtonStyle.Link)
                            .setURL('https://discord.com/users/378218184295186443/')
                    );
                const errorEmbed = createEmbed(
                    'Statut Premium',
                    '#FF0000',
                    'Ce serveur ne possède pas de license premium.\nVoici les avantages de la license Premium',
                    'MPBot by light2k4.',
                    fields
                );
                await interaction.reply({ embeds: [errorEmbed], components: [buttons] });
            }
        } catch (error) {
            log.error('Erreur lors de la vérification du statut premium:', error);
            const errorEmbed = createEmbed(
                'Erreur',
                '#FF0000',
                'Une erreur est survenue lors de la vérification du statut premium.'
            );
            await interaction.reply({ embeds: [errorEmbed] });
        }
    },
};

async function checkPremiumStatus(guildId) {
    try {
        const sql = `SELECT premium FROM guilds WHERE guild_id = ?`;
        const row = await db.getAsync(sql, [guildId]);
        return row ? row.premium : false;
    } catch (err) {
        log.error('Erreur lors de la vérification du statut premium:', err);
        throw err;
    }
}

function createEmbed(title, color, description, footerText, fields = []) {
    return new EmbedBuilder()
        .setTitle(title)
        .setColor(color)
        .setDescription(description)
        .addFields(fields)
        .setFooter({ text: footerText })
        .setTimestamp();
}

// Add promisified version of db.get
const util = require('util');
db.getAsync = util.promisify(db.get).bind(db);