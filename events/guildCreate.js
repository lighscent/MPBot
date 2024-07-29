const { Events } = require('discord.js');
const log = require('../logger.js');
const db = require('../db.js');

module.exports = {
    name: Events.GuildCreate,
    async execute(guild) {
        // guild_id, owner_id, premium
        const sql = `INSERT INTO guilds (guild_id, owner_id, premium) VALUES (?, ?, ?)`;
        const values = [guild.id, guild.ownerId, false];

        try {
            db.run(sql, values, (err) => {
                if (err) {
                    log.error('Erreur lors de l\'ajout de la guilde:', err);
                } else {
                    log.info(`Ajout de la guilde ${guild.name} (${guild.id})`);
                }
            });
        } catch (error) {
            log.error('Erreur lors de l\'ajout de la guilde:', error);
        }
    }
};