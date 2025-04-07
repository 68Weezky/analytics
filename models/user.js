const knex = require('../config/knex.js');
const bcrypt = require('bcryptjs');
const SALT_ROUNDS = 10;

module.exports = class User {
    static tableName = 'users';

    /**
     * Creates the users table if it doesn't exist
     */
    static async createTable() {
        const exists = await knex.schema.hasTable(this.tableName);
        if (!exists) {
            await knex.schema.createTable(this.tableName, (table) => {
                table.increments('id').primary();
                table.string('name').notNullable();
                table.string('email').notNullable().unique();
                table.string('rank').notNullable();
                table.string('password').notNullable();
                table.string('team').nullable(); // Added for team association
                table.timestamps(true, true); // created_at, updated_at
                
                // Add indexes for better query performance
                table.index(['email']);
                table.index(['rank']);
            });
            console.log(`${this.tableName} table created`);
        }
    }

    /**
     * Create a new user with hashed password
     * @param {String} name - User name
     * @param {String} email - User email
     * @param {String} league - League name
     * @param {String} rank - User role/rank
     * @param {String} password - Plain text password
     * @param {Object} [trx] - Optional transaction object
     * @returns {Promise<Object>} Result object
     */
    static async store(name, email, rank, password, trx = knex) {
        try {
            // Check if user already exists
            const existingUser = await trx(this.tableName)
                .where({ email })
                .first();

            if (existingUser) {
                return { success: false, message: "User already exists" };
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

            // Insert new user
            const [userId] = await trx(this.tableName).insert({
                name,
                email,
                rank,
                password: hashedPassword,
                created_at: knex.fn.now(),
                updated_at: knex.fn.now()
            });

            return { 
                success: true, 
                user: { 
                    id: userId, 
                    name, 
                    email, 
                    rank 
                } 
            };
        } catch (error) {
            console.error("User Creation Error:", error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Find user by query conditions
     * @param {Object} conditions - Query conditions
     * @returns {Promise<Object|null>} User record or null
     */
    static async query(conditions) {
        try {
            const user = await knex(this.tableName)
                .where(conditions)
                .first();
            
            return user || null;
        } catch (error) {
            console.error("Query Error:", error);
            throw error;
        }
    }

    /**
     * Verify user credentials
     * @param {String} email - User email
     * @param {String} password - Plain text password
     * @returns {Promise<Object>} Result object
     */
    static async verifyCredentials(email, password) {
        try {
            const user = await this.query({ email });
            
            if (!user) {
                return { success: false, message: "User not found" };
            }

            const passwordMatch = await bcrypt.compare(password, user.password);
            
            if (!passwordMatch) {
                return { success: false, message: "Unauthorized" };
            }

            // Return user data without password
            const { password: _, ...userData } = user;
            return { success: true, user: userData };
        } catch (error) {
            console.error("Verification Error:", error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Update user data
     * @param {Number} id - User ID
     * @param {Object} updates - Fields to update
     * @returns {Promise<Object>} Result object
     */
    static async update(id, updates) {
        try {
            // Hash new password if provided
            if (updates.password) {
                updates.password = await bcrypt.hash(updates.password, SALT_ROUNDS);
            }

            const count = await knex(this.tableName)
                .where({ id })
                .update({
                    ...updates,
                    updated_at: knex.fn.now()
                });
            
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
     * Get all users in a league
     * @param {String} league - League name
     * @returns {Promise<Array>} Array of user records
     */
    static async getByLeague(league) {
        try {
            return await knex(this.tableName)
                .where({ league })
                .select('id', 'name', 'email', 'rank', 'team', 'created_at');
        } catch (error) {
            console.error("Query Error:", error);
            throw error;
        }
    }
};
