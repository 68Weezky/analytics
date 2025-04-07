const knex = require('../config/knex.js');
const User = require("./user");
const League = require("./league");

module.exports = class Team {
    static tableName = 'teams';

    /**
     * Creates the teams table if it doesn't exist
     */
    static async createTable() {
        const exists = await knex.schema.hasTable(this.tableName);
        if (!exists) {
            await knex.schema.createTable(this.tableName, (table) => {
                table.increments('id').primary();
                table.string('name').notNullable();
                table.string('league').notNullable();
                table.string('manager').notNullable();
                table.string('badge');
                table.json('fouls').defaultTo(JSON.stringify([]));
                table.json('goals').defaultTo(JSON.stringify([]));
                table.json('shots').defaultTo(JSON.stringify([]));
                table.timestamps(true, true);

                // Add indexes
                table.index(['league']);
                table.index(['name']);
                table.unique(['name', 'league']); // Team names should be unique within a league
            });
            console.log(`${this.tableName} table created`);
        }
    }

    /**
     * Create a new team and associated manager user
     * @param {String} name - Team name
     * @param {String} league - League name
     * @param {String} manager - Manager name
     * @param {String} email - Manager email
     * @param {String} password - Manager password
     * @param {String} badge - Team badge URL
     * @returns {Promise<Object>} Result object
     */
    static async store(name, league, manager, email, password, badge = null) {
        try {
            // Check if team already exists
            const existingTeam = await knex(this.tableName)
                .where({ name, league })
                .first();

            if (existingTeam) {
                return { success: false, message: "Team already exists in this league" };
            }

            // Start transaction
            return await knex.transaction(async (trx) => {
                // Create team
                const [teamId] = await trx(this.tableName).insert({
                    name,
                    league,
                    manager,
                    badge,
                    fouls: JSON.stringify([]),
                    goals: JSON.stringify([]),
                    shots: JSON.stringify([])
                });

                // Create manager user and associate with team
                const userResult = await User.store(
                    manager,
                    email,
                    league,
                    "team_manager",
                    password,
                    trx  // Pass transaction
                );

                if (!userResult.success) {
                    throw new Error("Failed to create manager user");
                }

                // Update user with team association
                await trx(User.tableName)
                    .where({ email })
                    .update({ team: name });

                return {
                    success: true,
                    team: {
                        id: teamId,
                        name,
                        league,
                        manager
                    }
                };
            });
        } catch (error) {
            console.error("Team Creation Error:", error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get team by query conditions
     * @param {Object} conditions - Query conditions
     * @returns {Promise<Object|null>} Team record or null
     */
    static async query(conditions) {
        try {
            const team = await knex(this.tableName)
                .where(conditions)
                .first();

            if (team) {
                return {
                    ...team,
                    fouls: JSON.parse(team.fouls),
                    goals: JSON.parse(team.goals),
                    shots: JSON.parse(team.shots)
                };
            }
            return null;
        } catch (error) {
            console.error("Query Error:", error);
            throw error;
        }
    }

    /**
     * Update team data
     * @param {Number} id - Team ID
     * @param {Object} updates - Fields to update
     * @returns {Promise<Object>} Result object
     */
    static async update(id, updates) {
        try {
            // Convert array fields to JSON strings
            const fieldsToJson = ['fouls', 'goals', 'shots'];
            const processedUpdates = {};

            for (const [key, value] of Object.entries(updates)) {
                processedUpdates[key] = fieldsToJson.includes(key)
                    ? JSON.stringify(value)
                    : value;
            }

            const count = await knex(this.tableName)
                .where({ id })
                .update(processedUpdates);

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
     * Get all teams in a league
     * @param {String} league - League name
     * @returns {Promise<Array>} Array of team records
     */
    static async getByLeague(league) {
        try {
            const teams = await knex(this.tableName)
                .where({ league })
                .select('*');

            return teams.map(team => ({
                ...team,
                fouls: JSON.parse(team.fouls),
                goals: JSON.parse(team.goals),
                shots: JSON.parse(team.shots)
            }));
        } catch (error) {
            console.error("Query Error:", error);
            throw error;
        }
    }

    /**
     * Delete a team
     * @param {Number} id - Team ID
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
