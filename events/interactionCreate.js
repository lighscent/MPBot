const { Events } = require("discord.js");
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
