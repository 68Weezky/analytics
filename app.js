const express = require("express");
const path = require("path");
const session = require('express-session');
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

// Initialize Knex directly
const knex = require("./config/knex");

// Import models (now using plain Knex)
const User = require("./models/user");
const Team = require("./models/team");
const League = require("./models/league");
const Season = require("./models/season");
const Match = require("./models/match");
const Player = require("./models/player");

// Import routes
const adminRoutes = require("./routes/admin");
const userRoutes = require("./routes/user");
const authRoutes = require("./routes/auth");

const port = process.env.PORT || 8500;
const app = express();

// Database initialization
async function initializeDatabase() {
    try {
        // Test connection
        await knex.raw("SELECT 1");
        console.log('✅ Database connection established');

        // Check if tables exist, create if needed
        const hasUsers = await knex.schema.hasTable('users');
        if (!hasUsers) {
            await knex.schema.createTable('users', (table) => {
                table.increments('id').primary();
                table.string('name').notNullable();
                table.string('email').unique().notNullable();
                table.string('password').notNullable();
                table.string('rank').defaultTo('user');
                table.timestamps(true, true);
            });
            console.log('✅ Created users table');
        }

        // Add similar checks for other tables...

    } catch (err) {
        console.error('❌ Database initialization failed:', err);
        process.exit(1);
    }
}
// Set view engine
app.set('view engine', 'ejs'); // Or 'pug', 'handlebars', etc.

// Set views directory
app.set('views', path.join(__dirname, 'views'));


// Middleware setup
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

// Set static files directory
app.use(express.static(path.join(__dirname, 'public')));

// Set authentication routes
app.use('/auth', authRoutes);

// Set user routes
app.use('/', userRoutes);

// Set admin routes
app.use('/admin', adminRoutes);

// Health check endpoint
app.get('/health', async (req, res) => {
    try {
        await knex.raw('SELECT 1');
        res.json({
            status: 'ok',
            database: 'connected'
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            error: error.message
        });
    }
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('errors/500', {
        title: 'Server Error',
        message: 'Something went wrong!',
        user: req.user
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).render('errors/404', {
        title: 'Page Not Found',
        message: 'The page you requested could not be found.',
        user: req.user
    });
});

// Start server
async function startServer() {
    await initializeDatabase();

    app.listen(port, () => {
        console.log(`🚀 Server running on port ${port}`);
    });
}

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('Shutting down...');
    knex.destroy().then(() => {
        console.log('Database connection closed');
        process.exit(0);
    });
});

startServer();
