import { Knex } from 'knex';

declare global {
  namespace App {
    // interface Error {}
    // interface Locals {}
    // interface PageData {}
    interface Platform {
      db?: Knex;
    }
  }
}
export {};
