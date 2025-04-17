// migrations/XXXXXX_create_initial_tables.js
export async function up(knex) {
  await knex.schema.createTable('users', (table) => {
    table.increments('id').primary();
    table.string('name').notNullable();
    table.string('email').notNullable().unique();
    table.string('rank').notNullable().defaultTo('user');
    table.string('team').nullable();
    table.timestamps(true, true);
  });

  await knex.schema.createTable('matches', (table) => {
    table.increments('id').primary();
    table.string('home_team').notNullable();
    table.string('away_team').notNullable(); // Changed from text() to string()
    table.integer('match_time').unsigned().notNullable();
    
    // Fixed foreign key reference (venue was undefined)
    table.integer('venue_id').unsigned().references('id').inTable('users');
    
    table.string('results').notNullable();
    table.timestamps(true, true);
  });

  await knex.schema.createTable('teams', (table) => {
    table.increments('id').primary();
    table.string('name').notNullable().unique();
    table.string('manager').notNullable();
    table.integer('players').notNullable();
    table.timestamps(true, true);
  });
}

export async function down(knex) {
  // Drop tables in reverse order to respect foreign key constraints
  await knex.schema.dropTable('teams');
  await knex.schema.dropTable('matches');
  await knex.schema.dropTable('users');
}
