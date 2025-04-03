const knex = require('../config/knex.js');
const League = require("./league");
const Team = require("./team");

module.exports = class Player {
    static tableName = 'players';

    /**
     * Creates the players table if it doesn't exist
     */
    static async createTable() {
        const exists = await knex.schema.hasTable(this.tableName);
        if (!exists) {
            await knex.schema.createTable(this.tableName, (table) => {
                table.increments('id').primary();
                table.string('serial').unique();
                table.string('name').notNullable();
                table.date('dob').notNullable();
                table.integer('kit_number').unsigned();
                table.string('team').notNullable();
                table.string('email');
                table.string('status').defaultTo('active');
                table.json('fouls').defaultTo(JSON.stringify([]));
                table.json('goals').defaultTo(JSON.stringify([]));
                table.json('shots').defaultTo(JSON.stringify([]));
                table.timestamps(true, true);
                
                // Add indexes for better query performance
                table.index(['serial']);
                table.index(['team']);
                table.index(['name']);
                table.unique(['kit_number', 'team']); // Unique kit number per team
            });
            console.log(`${this.tableName} table created`);
        }
    }

    /**
     * Store a new player
     * @param {String} name - Player name
     * @param {Date} dob - Date of birth
     * @param {Number} kit - Kit number
     * @param {String} team - Team identifier
     * @param {String} league - League name
     * @param {String} status - Player status
     * @returns {Promise<Object>} Result object
     */
    static async store(name, dob, kit, team, league, status = 'active') {
        try {
            // Check if player already exists (either same name+dob or same kit+team)
            const existingPlayer = await knex(this.tableName)
                .where(function() {
                    this.where({ name, dob })
                        .orWhere({ kit_number: kit, team });
                })
                .first();

            if (existingPlayer) {
                return { success: false, message: "Player already exists" };
            }

            // Start transaction
            return await knex.transaction(async (trx) => {
                // Get league to generate serial
                const leagueData = await trx(League.tableName)
                    .where({ name: league })
                    .first();

                if (!leagueData) {
                    throw new Error("League not found");
                }

                // Generate serial (first 3 letters of team + player count)
                const serial = team.substring(0, 3) + leagueData.player_count;

                // Insert new player
                const [playerId] = await trx(this.tableName).insert({
                    serial,
                    name,
                    dob,
                    kit_number: kit,
                    team,
                    status,
                    fouls: JSON.stringify([]),
                    goals: JSON.stringify([]),
                    shots: JSON.stringify([])
                });

                // Update league player count
                await trx(League.tableName)
                    .where({ name: league })
                    .increment('player_count', 1);

                return { 
                    success: true, 
                    player: { 
                        id: playerId, 
                        serial, 
                        name, 
                        team 
                    } 
                };
            });
        } catch (error) {
            console.error("Storage Error:", error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Remove a player by serial number
     * @param {String} serial - Player serial number
     * @returns {Promise<Object>} Result object
     */
    static async rm(serial) {
        try {
            const deleted = await knex(this.tableName)
                .where({ serial })
                .del();
            
            if (deleted) {
                console.log(`Player ${serial} REMOVED`);
                return { success: true, deleted };
            }
            return { success: false, message: "Player not found" };
        } catch (error) {
            console.error("Delete Error:", error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Query players
     * @param {Object} conditions - Query conditions
     * @returns {Promise<Object|null>} Player record or null
     */
    static async query(conditions) {
        try {
            const player = await knex(this.tableName)
                .where(conditions)
                .first();
            
            if (player) {
                // Parse JSON fields
                return {
                    ...player,
                    fouls: JSON.parse(player.fouls),
                    goals: JSON.parse(player.goals),
                    shots: JSON.parse(player.shots)
                };
            }
            return null;
        } catch (error) {
            console.error("Query Error:", error);
            throw error;
        }
    }

    /**
     * Update player data
     * @param {String} serial - Player serial number
     * @param {Object} updates - Fields to update
     * @returns {Promise<Object>} Result object
     */
    static async update(serial, updates) {
        try {
            // Convert array fields to JSON strings if they exist in updates
            const fieldsToJson = ['fouls', 'goals', 'shots'];
            const processedUpdates = {};
            
            for (const [key, value] of Object.entries(updates)) {
                if (fieldsToJson.includes(key)) {
                    processedUpdates[key] = JSON.stringify(value);
                } else {
                    processedUpdates[key] = value;
                }
            }

            const count = await knex(this.tableName)
                .where({ serial })
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
     * Get all players for a team
     * @param {String} team - Team identifier
     * @returns {Promise<Array>} Array of player records
     */
    static async getByTeam(team) {
        try {
            const players = await knex(this.tableName)
                .where({ team })
                .select('*');
            
            return players.map(player => ({
                ...player,
                fouls: JSON.parse(player.fouls),
                goals: JSON.parse(player.goals),
                shots: JSON.parse(player.shots)
            }));
        } catch (error) {
            console.error("Query Error:", error);
            throw error;
        }
    }
};
