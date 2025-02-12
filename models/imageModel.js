const mysql = require('mysql2');
const dbConfig = require('../config/db');

const pool = mysql.createPool(dbConfig);

module.exports = {
    saveImage: (filename, diseaseInfo, callback) => {
        const query = 'INSERT INTO images (filename, disease_info) VALUES (?, ?)';
        pool.execute(query, [filename, diseaseInfo], (err, results) => {
            if (err) return callback(err);
            callback(null, results);
        });
    },
};
