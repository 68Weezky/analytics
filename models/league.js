const knex = require('../config/knex.js');
const User = require("./user");

module.exports = class League {
    static tableName = 'leagues';

    /**
     * Creates the leagues table if it doesn't exist
     */
    static async createTable() {
        const exists = await knex.schema.hasTable(this.tableName);
        if (!exists) {
            await knex.schema.createTable(this.tableName, (table) => {
                table.increments('id').primary();
                table.string('name').unique().notNullable();
                table.string('admin').notNullable(); // Stores email
                table.integer('player_count').defaultTo(0);
                table.string('current_season');
                table.timestamps(true, true);
            });
            console.log(`${this.tableName} table created`);
        }
    }

    /**
     * Query leagues
     * @param {Object} conditions - Query conditions
     * @returns {Promise<Array>} Array of league records
     */
    static async query(conditions = {}) {
        try {
            return await knex(this.tableName).where(conditions).select('*');
        } catch (error) {
            console.error("Query Error:", error);
            throw error;
        }
    }

    /**
     * Create a new league and admin user
     * @param {String} name - League name
     * @param {String} adm - Admin name
     * @param {String} email - Admin email
     * @param {String} pass - Admin password
     * @param {String} [season] - Current season (optional)
     * @returns {Promise<Object>} Result object
     */
    static async store(name, adm, email, pass, season = '2025') {
        try {
            // Check if league exists
            const exists = await knex(this.tableName)
                .where({ name })
                .first();
            
            if (exists) {
                console.log(`${name} league already exists`);
                return { success: false, message: "League already exists" };
            }

            // Use transaction to ensure both operations succeed or fail together
            return await knex.transaction(async (trx) => {
                // Create the league
                const [leagueId] = await trx(this.tableName)
                    .insert({
                        name,
                        admin: email,
                        player_count: 0,
                        current_season: season
                    });

                // Create the admin user
                await User.store(adm, email, name, "admin", pass, trx);

                console.log("League created successfully");
                return { 
                    success: true, 
                    league: { id: leagueId, name, admin: email } 
                };
            });
        } catch (error) {
            console.error("Storage Error:", error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Update a league
     * @param {Number} id - League ID
     * @param {Object} updates - Fields to update
     * @returns {Promise<Object>} Result object
     */
    static async update(id, updates) {
        try {
            const count = await knex(this.tableName)
                .where({ id })
                .update(updates);
            
            return { 
                success: count > 0,
                updated: count 
            };
        } catch (error) {
            console.error("Update Error:", error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Delete a league
     * @param {Number} id - League ID
     * @returns {Promise<Object>} Result object
     */
    static async delete(id) {
        try {
            const count = await knex(this.tableName)
                .where({ id })
                .del();
            
            return { 
                success: count > 0,
                deleted: count 
            };
        } catch (error) {
            console.error("Delete Error:", error);
            return { success: false, error: error.message };
        }
    }
};
