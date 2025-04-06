// Importing necessary modules
const express = require("express");
const knex = require("./config/knex"); // Knex configuration file
const path = require("path");
const session = require('express-session');
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

// Import models with table creation functions
const User = require("./models/user");
const Team = require("./models/team");
const League = require("./models/league");
const Season = require("./models/season");
const Match = require("./models/match");
const Player = require("./models/player");

// Import route handlers
const adminRoutes = require("./routes/admin.js");
const userRoutes = require("./routes/user.js");

const port = 8500;
const app = express();

// Database initialization function
async function initializeDatabase() {
  try {
    // Test database connection
    await knex.raw("SELECT 1");
    console.log('Connected to MySQL database');

    // Create all tables in proper order to respect foreign key constraints
    await League.createTable();
    await User.createTable();
    await Team.createTable();
    await Season.createTable();
    await Player.createTable();
    await Match.createTable();

    console.log('All tables created successfully');
  } catch (err) {
    console.error('Database initialization failed:', err);
    process.exit(1); // Exit if database setup fails
  }
}

// Initialize database and start server
initializeDatabase().then(() => {
  // Session middleware
  app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 1000 * 60 * 60 * 24 }
  }));

  app.use(cookieParser());
  app.set('view engine', 'ejs');
  app.set('views', 'views');
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());
  app.use(express.static(path.join(__dirname, 'public')));

  // Routes
  app.use('/admin', adminRoutes);
  app.use('/', userRoutes);

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('error', {
        title: 'Error',
        message: 'Something went wrong on our end.',
        user: req.session.user
    });
});

// 404 Handler (after all other routes)
app.use((req, res) => {
    res.status(404).render('error', {
        title: 'Not Found',
        message: 'The page you requested could not be found.',
        user: req.session.user
    });
});

  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  knex.destroy().then(() => {
    console.log('Database connection closed');
    process.exit(0);
  });
});
