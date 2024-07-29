// MPBot by light2k4 (https://discord.gg/YmA88jc7GF)
// Ce fichier permet de gérer la base de données SQLite.

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.db');

db.runAsync = function (sql, params = []) {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
            if (err) {
                return reject(err);
            }
            resolve(this);
        });
    });
};

module.exports = db;