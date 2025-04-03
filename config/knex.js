const knex = require('knex');

const config = {
  client: 'mysql2',
  connection: {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'sports_analytics',
    charset: 'utf8mb4'
  },
  pool: {
    min: 2,
    max: 10
  },
  migrations: {
    tableName: 'knex_migrations',
    directory: './migrations'
  },
  seeds: {
    directory: './seeds'
  }
};

module.exports = knex(config);
