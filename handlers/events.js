// MPBot by light2k4 (https://discord.gg/YmA88jc7GF)
// Ce handler permet de charger les events du bot.

const fs = require('fs');
const path = require('path');
const client = require('../client');
const log = require('../logger');

const eventsPath = path.resolve(__dirname, '../events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

eventFiles.forEach(file => {
    const filePath = path.resolve(eventsPath, file);
    const event = require(filePath);

    if (event.name && event.execute) {
        const eventHandler = (...args) => event.execute(...args);
        if (event.once) {
            client.once(event.name, eventHandler);
        } else {
            client.on(event.name, eventHandler);
        }
        log.load(`⏳ Load event ${event.name}`);
    } else {
        log.error(`❌ Failed to load event ${file}`);
    }
});

const loadedEventCount = fs.readdirSync(eventsPath).length;
log.info(`✔️ Loaded ${loadedEventCount} events`);