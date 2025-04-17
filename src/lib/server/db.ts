import knex from 'knex';
import config from '../../../knex';

const environment = process.env.NODE_ENV || 'development';
const connection = config[environment];

// For TypeScript users, you can define types for your tables
declare module 'knex/types/tables' {
  interface Tables {
    users: {
      id: number;
      name: string;
      email: string;
      rank: string;
      team: string|null;
      created_at: string;
      updated_at: string;
    };
    // Add other tables as needed
  }
}

export const db = knex(connection);
