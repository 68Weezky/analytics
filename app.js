// Importing necessary modules
const express = require("express"); 
const mongoose = require("mongoose"); 
const path = require("path"); 
const session = require('express-session'); 
const bodyParser = require("body-parser"); 
const cookieParser = require("cookie-parser")

// Importing route handlers
const adminRoutes = require("./routes/admin.js");
const userRoutes = require("./routes/user.js"); 

// Setting up the server port and MongoDB connection URI
const port = 8500;
const mongoURI = 'mongodb://localhost:27017/sportsAnalytics';

// Initializing the Express application
const app = express();

// Connecting to MongoDB using Mongoose
mongoose.connect(mongoURI);

// Handling MongoDB connection events
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:')); // Logs any connection errors
db.once('open', () => {
  console.log('Connected to MongoDB'); // Logs successful connection
});

// Setting up session middleware
app.use(session({
  secret: 'keyboard cat', // Secret key for signing the session ID cookie
  resave: false, // Prevents the session from being saved back to the store if it wasn't modified
  saveUninitialized: true, // Saves uninitialized sessions (new but not modified)
  cookie: { maxAge: 1000 * 60 * 60 * 24 } // Sets the session cookie to expire after 24 hours
}));

// Using cookie-parser middleware
app.use(cookieParser());

// Setting up the view engine (EJS) and views directory
app.set('view engine', 'ejs'); 
app.set('views', 'views');

// Middleware for parsing URL-encoded request bodies
app.use(bodyParser.urlencoded({ extended: false }));

// Serving static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Mounting route handlers
app.use('/admin', adminRoutes); // Routes for admin functionality
app.use('/', userRoutes); // Routes for user functionality

// Starting the server and listening on the specified port
app.listen(port, () => {
  console.log(`Listening at port ${port}`); // Logs the port the server is running on
});
