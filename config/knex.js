require('dotenv').config();

const knex = require('knex');

console.log('DB Config:', { // Debug
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  database: process.env.DB_NAME
});

const config = {
  client: 'mysql2',
  connection: {
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'sports_analytics',
    charset: 'utf8mb4'
  },
  pool: { min: 2, max: 10 }
};

module.exports = knex(config); // ✅ Correct if no double-init elsewhere