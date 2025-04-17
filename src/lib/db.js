// src/lib/db.js
import knex from 'knex';
import config from '../../knexfile.js';

// Use the appropriate environment
const environment = process.env.NODE_ENV || 'development';
const connection = config[environment];

// Create the connection
const db = knex(connection);

export default db;
