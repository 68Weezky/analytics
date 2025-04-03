const knex = require('../config/knex.js');
const Team = require("./team");

module.exports = class Match {
    static tableName = 'matches';

    /**
     * Creates the matches table if it doesn't exist
     */
    static async createTable() {
        const exists = await knex.schema.hasTable(this.tableName);
        if (!exists) {
            await knex.schema.createTable(this.tableName, (table) => {
                table.increments('id').primary();
                table.string('number').notNullable();
                table.string('home_team').notNullable();
                table.string('away_team').notNullable();
                table.datetime('match_time').notNullable();
                table.string('season').notNullable();
                table.json('home_squad').defaultTo(JSON.stringify([]));
                table.json('away_squad').defaultTo(JSON.stringify([]));
                table.json('fouls').defaultTo(JSON.stringify([]));
                table.json('goals').defaultTo(JSON.stringify([]));
                table.json('shots').defaultTo(JSON.stringify([]));
                table.json('score').nullable();
                table.timestamps(true, true);
                
                // Add indexes for better query performance
                table.index(['home_team', 'away_team']);
                table.index(['match_time']);
                table.index(['season']);
            });
            console.log(`${this.tableName} table created`);
        }
    }

    /**
     * Store a new match
     * @param {String} number - Match number
     * @param {String} home - Home team
     * @param {String} away - Away team
     * @param {Date} time - Match time
     * @param {String} season - Season identifier
     * @returns {Promise<Object>} Result object
     */
    static async store(number, home, away, time, season) {
        try {
            const [matchId] = await knex(this.tableName)
                .insert({
                    number,
                    home_team: home,
                    away_team: away,
                    match_time: time,
                    season,
                    home_squad: JSON.stringify([]),
                    away_squad: JSON.stringify([]),
                    fouls: JSON.stringify([]),
                    goals: JSON.stringify([]),
                    shots: JSON.stringify([]),
                    score: null
                });

            return { 
                success: true, 
                match: { 
                    id: matchId, 
                    number, 
                    home_team: home, 
                    away_team: away 
                } 
            };
        } catch (error) {
            console.error("Storage Error:", error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get match by ID
     * @param {Number} id - Match ID
     * @returns {Promise<Object|null>} Match record or null
     */
    static async getById(id) {
        try {
            const match = await knex(this.tableName)
                .where({ id })
                .first();
            
            if (match) {
                // Parse JSON fields
                return {
                    ...match,
                    home_squad: JSON.parse(match.home_squad),
                    away_squad: JSON.parse(match.away_squad),
                    fouls: JSON.parse(match.fouls),
                    goals: JSON.parse(match.goals),
                    shots: JSON.parse(match.shots),
                    score: match.score ? JSON.parse(match.score) : null
                };
            }
            return null;
        } catch (error) {
            console.error("Query Error:", error);
            throw error;
        }
    }

    /**
     * Update match data
     * @param {Number} id - Match ID
     * @param {Object} updates - Fields to update
     * @returns {Promise<Object>} Result object
     */
    static async update(id, updates) {
        try {
            // Convert array fields to JSON strings if they exist in updates
            const fieldsToJson = ['hSquad', 'aSquad', 'fouls', 'goals', 'shots', 'score'];
            const processedUpdates = {};
            
            for (const [key, value] of Object.entries(updates)) {
                if (fieldsToJson.includes(key)) {
                    processedUpdates[key.replace(/^hSquad$/, 'home_squad')
                                       .replace(/^aSquad$/, 'away_squad')] = JSON.stringify(value);
                } else {
                    processedUpdates[key] = value;
                }
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
     * Get all matches with optional filters
     * @param {Object} filters - Query filters
     * @returns {Promise<Array>} Array of match records
     */
    static async getAll(filters = {}) {
        try {
            let query = knex(this.tableName).select('*');
            
            // Apply filters
            if (filters.season) {
                query = query.where('season', filters.season);
            }
            if (filters.team) {
                query = query.where(function() {
                    this.where('home_team', filters.team)
                        .orWhere('away_team', filters.team);
                });
            }
            if (filters.dateFrom) {
                query = query.where('match_time', '>=', filters.dateFrom);
            }
            if (filters.dateTo) {
                query = query.where('match_time', '<=', filters.dateTo);
            }

            const matches = await query;
            return matches.map(match => ({
                ...match,
                home_squad: JSON.parse(match.home_squad),
                away_squad: JSON.parse(match.away_squad),
                fouls: JSON.parse(match.fouls),
                goals: JSON.parse(match.goals),
                shots: JSON.parse(match.shots),
                score: match.score ? JSON.parse(match.score) : null
            }));
        } catch (error) {
            console.error("Query Error:", error);
            throw error;
        }
    }
};
