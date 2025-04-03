const knex = require('../config/knex.js');
const Team = require("./team");
const League = require("./league");

module.exports = class Season {
    static tableName = 'seasons';

    /**
     * Creates the seasons table if it doesn't exist
     */
    static async createTable() {
        const exists = await knex.schema.hasTable(this.tableName);
        if (!exists) {
            await knex.schema.createTable(this.tableName, (table) => {
                table.increments('id').primary();
                table.string('name').notNullable();
                table.string('league').notNullable();
                table.string('status').defaultTo('Ongoing');
                table.json('matches').defaultTo(JSON.stringify([]));
                table.json('goals').defaultTo(JSON.stringify([]));
                table.json('shots').defaultTo(JSON.stringify([]));
                table.json('standings').defaultTo(JSON.stringify([]));
                table.timestamps(true, true);
                
                // Add indexes
                table.index(['league']);
                table.index(['status']);
                table.unique(['name']); // Season names should be unique
            });
            console.log(`${this.tableName} table created`);
        }
    }

    /**
     * Create a new season with generated matches and standings
     * @param {String} name - Season name
     * @param {String} league - League name
     * @returns {Promise<Object>} Result object
     */
    static async store(name, league) {
        try {
            // Close any ongoing season in the same league
            await knex(this.tableName)
                .where({ league, status: 'Ongoing' })
                .update({ status: 'Closed' });

            // Check if season already exists
            const existingSeason = await knex(this.tableName)
                .where({ name })
                .first();

            if (existingSeason) {
                return { success: false, message: "Season already exists" };
            }

            // Start transaction
            return await knex.transaction(async (trx) => {
                // Create new season
                const [seasonId] = await trx(this.tableName).insert({
                    name,
                    league,
                    status: 'Ongoing',
                    matches: JSON.stringify([]),
                    standings: JSON.stringify([])
                });

                // Get all teams in the league
                const teams = await trx(Team.tableName)
                    .where({ league })
                    .select('name');

                if (teams.length === 0) {
                    throw new Error("No teams found in this league");
                }

                // Generate matches (round-robin)
                let matches = [];
                let count = 0;
                for (let i = 0; i < teams.length; i++) {
                    for (let j = i + 1; j < teams.length; j++) {
                        // Home and away matches
                        matches.push({
                            id: count++,
                            home: teams[i].name,
                            away: teams[j].name,
                            time: null,
                            status: 'Scheduled'
                        });
                        matches.push({
                            id: count++,
                            home: teams[j].name,
                            away: teams[i].name,
                            time: null,
                            status: 'Scheduled'
                        });
                    }
                }

                // Generate initial standings
                const standings = teams.map(team => ({
                    team: team.name,
                    w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0
                }));

                // Update season with matches and standings
                await trx(this.tableName)
                    .where({ id: seasonId })
                    .update({
                        matches: JSON.stringify(matches),
                        standings: JSON.stringify(standings)
                    });

                // Update league's current season
                await trx(League.tableName)
                    .where({ name: league })
                    .update({ current_season: name });

                return { 
                    success: true, 
                    season: { 
                        id: seasonId, 
                        name, 
                        league,
                        matchCount: matches.length,
                        teamCount: teams.length
                    } 
                };
            });
        } catch (error) {
            console.error("Season Creation Error:", error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get season by name
     * @param {String} name - Season name
     * @returns {Promise<Object|null>} Season data or null
     */
    static async getByName(name) {
        try {
            const season = await knex(this.tableName)
                .where({ name })
                .first();

            if (season) {
                return {
                    ...season,
                    matches: JSON.parse(season.matches),
                    goals: JSON.parse(season.goals),
                    shots: JSON.parse(season.shots),
                    standings: JSON.parse(season.standings)
                };
            }
            return null;
        } catch (error) {
            console.error("Query Error:", error);
            throw error;
        }
    }

    /**
     * Update season data
     * @param {Number} id - Season ID
     * @param {Object} updates - Fields to update
     * @returns {Promise<Object>} Result object
     */
    static async update(id, updates) {
        try {
            // Convert array/object fields to JSON strings
            const fieldsToJson = ['matches', 'goals', 'shots', 'standings'];
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
     * Get current season for a league
     * @param {String} league - League name
     * @returns {Promise<Object|null>} Current season or null
     */
    static async getCurrentSeason(league) {
        try {
            const season = await knex(this.tableName)
                .where({ league, status: 'Ongoing' })
                .first();

            if (season) {
                return {
                    ...season,
                    matches: JSON.parse(season.matches),
                    standings: JSON.parse(season.standings)
                };
            }
            return null;
        } catch (error) {
            console.error("Query Error:", error);
            throw error;
        }
    }

    /**
     * Close a season
     * @param {String} name - Season name
     * @returns {Promise<Object>} Result object
     */
    static async closeSeason(name) {
        try {
            const count = await knex(this.tableName)
                .where({ name })
                .update({ status: 'Closed' });
            
            return { 
                success: count > 0,
                updated: count 
            };
        } catch (error) {
            console.error("Update Error:", error);
            return { success: false, error: error.message };
        }
    }
};
