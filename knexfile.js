// knexfile.js
import 'dotenv/config';

const config = {
  development: {
    client: 'mysql2',
    connection: {
      host: process.env.DB_HOST || '127.0.0.1',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      port: process.env.DB_PORT || 3306
      // Note: We removed the database name from here
    },
    pool: {
      afterCreate: (conn, done) => {
        conn.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'analytics'}`, (err) => {
          if (err) return done(err);
          conn.changeUser({database: process.env.DB_NAME || 'analytics'}, (err) => {
            if (err) return done(err);
            console.log(`Connected to database: ${process.env.DB_NAME || 'analytics'}`);
            done();
          });
        });
      }
    },
    migrations: {
      directory: './migrations',
      tableName: 'knex_migrations'
    },
    seeds: {
      directory: './seeds'
    }
  },
  production: {
    client: 'mysql2',
    connection: process.env.DATABASE_URL, // for services like Heroku
    migrations: {
      directory: './migrations',
      tableName: 'knex_migrations'
    },
    seeds: {
      directory: './seeds'
    }
  }
};

export default config;
