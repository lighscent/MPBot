// MPBot by light2k4 (https://discord.gg/YmA88jc7GF)
// Cet event permet de gérer les interactions du bot.

const { Events, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js");
const log = require("../logger");
const db = require("../db");

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        try {
            if (!interaction.isChatInputCommand()) return;

            const command = interaction.client.commands.get(interaction.commandName);
            if (!command) {
                log.error(`❌ Command ${interaction.commandName} not found`);
                return interaction.reply({ content: 'This command is not available.', ephemeral: true });
            } else {
                if (!interaction.guild) {
                    const errorEmbed = new EmbedBuilder()
                        .setTitle('303 - Use in guild')
                        .setColor('#FF0000')
                        .setDescription('This command can only be used in a guild.');
                    const button = new ButtonBuilder()
                        .setLabel('Invite me')
                        .setStyle(ButtonStyle.Link)
                        .setURL(process.env.INVITE_URL);
                    const actionRow = new ActionRowBuilder().addComponents(button);
                    return await interaction.reply({ embeds: [errorEmbed], components: [actionRow] });
                }
            }

            await command.execute(interaction);
        } catch (error) {
            log.error(error);
            const errorMessage = 'There was an error while executing this command!\n Please try again later or contact the support\nhttps://discord.gg/YmA88jc7GF.';
            if (interaction.replied || interaction.deferred) {
                return interaction.followUp({ content: errorMessage, ephemeral: true });
            } else {
                return interaction.reply({ content: errorMessage, ephemeral: true });
            }
        }
    },
};
