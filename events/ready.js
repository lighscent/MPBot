const { REST, Routes, Events, ActivityType, Collection } = require('discord.js');
const fs = require('fs').promises;
const path = require('path');
const log = require('../logger');

module.exports = {
    name: Events.ClientReady,
    once: true,
    async execute(client) {
        try {
            const commands = [];
            client.commands = new Collection();
            const foldersPath = path.join(__dirname, '../commands');
            const commandFolders = await fs.readdir(foldersPath);

            await Promise.all(commandFolders.map(async (folder) => {
                const commandsPath = path.join(foldersPath, folder);
                const commandFiles = (await fs.readdir(commandsPath)).filter(file => file.endsWith('.js'));

                await Promise.all(commandFiles.map(async (file) => {
                    const filePath = path.join(commandsPath, file);
                    const command = require(filePath);

                    if ('data' in command && 'execute' in command) {
                        client.commands.set(command.data.name, command);
                        commands.push(command.data.toJSON());
                        log.load(`⏳ Load command ${command.data.name}`);
                    } else {
                        log.error(`❌ Failed to load command ${file}`);
                    }
                }));
            }));

            const rest = new REST().setToken(process.env.TOKEN);
            log.load('⏳ Started refreshing application (/) commands.');
            await rest.put(
                Routes.applicationCommands(client.user.id),
                { body: commands },
            );
            log.info(`✔️  Successfully reloaded ${commands.length} application (/) commands.`);

            await client.user.setActivity({
                name: 'Private Messages',
                type: ActivityType.Watching,
            });

            log.info(`✔️  Logged in as ${client.user.tag}`);


            try {
                require('../tables.js')
            } catch (error) {
                log.error(error);
                console.error(error);
            }


        } catch (error) {
            log.error(error);
            console.error(error);
        }
    },
}