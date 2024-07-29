// MPBot by light2k4 (https://discord.gg/YmA88jc7GF)
// Ce fichier permet de créer les tables de la base de données.

const db = require('./db.js')

const tables = [
    {
        name: 'guilds',
        columns: [
            'guild_id VARCHAR(20) PRIMARY KEY',
            'owner_id VARCHAR(20) NOT NULL',
            'premium BOOLEAN DEFAULT 0',
            'buy_date DATETIME',
            'expire_date DATETIME',
            'license_key VARCHAR(255)',
            'payement_method VARCHAR(255)'
        ]
    },
    {
        name: 'premium_keys',
        columns: [
            'key VARCHAR(20) PRIMARY KEY',
            'created_date DATETIME DEFAULT CURRENT_TIMESTAMP',
            'expiration_date DATETIME',
            'used BOOLEAN DEFAULT 0',
            'used_by_user VARCHAR(20)',
            'used_for_guild VARCHAR(20)',
            'used_date DATETIME'
        ]
    }
]

tables.forEach(table => {
    const columns = table.columns.join(', ')
    db.run(`CREATE TABLE IF NOT EXISTS ${table.name} (${columns})`)
})