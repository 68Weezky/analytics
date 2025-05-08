require('dotenv').config();
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const session = require('express-session');
const webpush = require('web-push');
const path = require('path');
const bcrypt = require('bcryptjs');
const crypto = require('crypto')
const mailer = require('nodemailer');
const axios = require('axios');
const { Pool } = require('pg');
const multer = require('multer');
const pgSession = require('connect-pg-simple')(session);
const { createProxyMiddleware } = require('http-proxy-middleware');

// Directus API configuration
const saltRounds = 10;
const url = process.env.DIRECTUS_URL;
const accessToken = process.env.DIRECTUS_TOKEN;

// Proxy configuration
const apiProxy = createProxyMiddleware({
    target: 'http://0.0.0.0:8055/assets', // Target server where requests should be proxied
    changeOrigin: true, // Adjust the origin of the request to the target
});

// Use the proxy middleware for all requests to /api
app.use('/assets', apiProxy);

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json()); // Add JSON parsing middleware
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.use(session({ secret: 'secret', resave: false, saveUninitialized: true }));
// const upload = multer({ dest: __dirname + '/uploads/' });
app.use('/downloads', express.static('/'));

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'downloads/'); // Specify the directory to save the files
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname); // Specify the filename
    }
});

const upload = multer({ storage: storage });

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    ssl: { rejectUnauthorized: false },
});

app.use(session({
    store: new pgSession({
        pool: pool,
        tableName: 'session',
    }),
    secret: 'sqT_d_qxWqHyXS6Yk7Me8APygz3EjFE8',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 30 * 24 * 60 * 60 * 1000,
    },
}));

const checkSession = (req, res, next) => {
    if (req.session.user) {
        next(); // Continue to the next middleware or route
    } else {
        res.redirect('/login'); // Redirect to the login page if no session is found
    }
};

app.get('/', async (req, res) => {
    res.render('index', {});
})
const aboutRoutes = require('./routes/about');
app.use('/about', aboutRoutes);
const loginRoutes = require('./routes/login');
app.use('/login', loginRoutes);
const registerRoutes = require('./routes/register');
app.use('/register', registerRoutes);
const dashboardRoutes = require('./routes/dashboard')
app.use('/dashboard', checkSession, dashboardRoutes);
const adminRoutes = require('./routes/admin');
app.use('/admin', checkSession, adminRoutes);
const leagueRoutes = require('./routes/league');
app.use('/league-manager', checkSession, leagueRoutes);
const teamRoutes = require('./routes/team');
app.use('/team-manager', checkSession, teamRoutes);

// Query function for Directus API
async function query(path, config) {
    try {
        const res = await fetch(encodeURI(`${url}${path}`), {
            headers: {
                "Authorization": `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
            ...config
        });
        return res;
    } catch (error) {
        console.error('Error during fetch:', error);
        throw new Error('Database connection failed.');
    }
}

// Function to check if a user exists by email
async function userExists(email) {
    console.log("1________________________________")
    const res = await query(`/items/users?filter[email][_eq]=${email}`, {
        method: 'GET',
    });

    console.log("2________________________________", res)

    if (!res.ok) {
        throw new Error('Error checking user existence');
    }
    console.log("3________________________________")
    const data = await res.json();
    console.log("4________________________________", data)
    return data.data.length > 0; // Return true if user exists
}

// Function to register a user asynchronously
async function registerUser(userData) {
    try {
        let res = await query(`/items/users/`, {
            method: 'POST',
            body: JSON.stringify(userData) // Send user data in the request body
        });

        if (!res.ok) {
            // If the response is not ok, we can return the error response
            const errorResponse = await res.json();
            throw new Error(errorResponse.message || 'An error occurred during registration.');
        }

        return await res.json(); // Return parsed JSON response
    } catch (error) {
        console.error('Error registering user:', error);
        throw error; // Rethrow error for handling in the calling function
    }
}

// Handle User Submission
app.post('/register-user', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        console.log(req.body)

        // Check if the user already exists
        const exists = await userExists(email);
        if (exists) {
            return res.status(409).json({ error: 'This user email already exists' });
        }

        console.log("This user exists", exists)

        const hashedPassword = await bcrypt.hash(password, saltRounds);
        // Construct user data object
        const userData = {
            name,
            email,
            password: hashedPassword,
            role: role || "user",
        };

        // Register the user using the async function
        const newUser = await registerUser(userData);

        // Send success response with message
        return res.status(200).json({ message: 'Registration successful! Please log in.', newUser });
    } catch (error) {
        console.error('Error inserting user:', error);
        // Check if it's a connection error
        if (error.message === 'Database connection failed.') {
            return res.status(503).json({ error: 'An error occurred. Please try again later.' });
        }
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

async function loginUser(email) {
    try {
        // Query the database for a user with the given email and password
        const response = await query(`/items/users?filter[email][_eq]=${email}`, {
            method: 'SEARCH',
        });
        const users = await response.json(); // Extract JSON data from the response

        // Return the users found
        return users;
    } catch (error) {
        console.error('Error querying user data:', error);
        throw new Error('Error querying user data');
    }
}

// Login route
app.post('/login-user', async (req, res) => {
    try {
        const { email, password } = req.body;

        console.log(req.body)

        // Validate input
        if (!email || !password) {
            return res.status(400).json({ error: 'Please fill in all fields' });
        }

        // const userData = { email, password };

        // Fetch user data from Directus
        const usersResponse = await loginUser(email);

        // Check if users array is empty or not
        if (!usersResponse || !usersResponse.data || usersResponse.data.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = usersResponse.data[0];

        // console.log(user)
        const isPasswordValid = await bcrypt.compare(password, user.password); // Assuming user.password is the hashed password

        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Check user status
        if (user.role === "league-manager") {
            req.session.user = user; // Store user data in session
            return res.status(200).json({ message: 'Login successful', redirect: '/league-manager' });
        }
        else if (user.role === "admin") {
            req.session.user = user;
            return res.status(200).json({ message: 'Login successful', redirect: '/admin' });
        }
        else if (user.role === "team-manager") {
            req.session.user = user;
            return res.status(200).json({ message: 'Login successful', redirect: '/team-manager' });
        }
        else {
            req.session.user = user; // Store user data in session
            return res.status(200).json({ message: 'Login successful', redirect: '/dashboard' });
        }
    } catch (error) {
        // Handle internal server error
        console.error('Error logging in user:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

async function uploadEvents(userData) {
    try {
        // Use your custom query function to send the update query
        const res = await query(`/items/events/`, {
            method: 'POST', // Assuming you want to update an existing item
            body: JSON.stringify(userData) // Convert userData to JSON string
        });
        const updatedData = await res.json();
        return updatedData; // Return updated data
    } catch (error) {
        console.error('Error:', error);
        throw new Error('Failed to update');
    }
}

app.post('/submit-event', async (req, res) => {
    try {
        const { name, location, startDate, endDate, description } = req.body;

        const id = req.session.user.id;

        // Construct userData object with post information and picture path
        const userData = {
            user_id: id,
            name: name,
            location: location,
            description: description,
            start_date: startDate,
            end_date: endDate,
        };

        console.log(userData);

        // Update user data with the new post data
        const updatedData = await uploadEvents(userData);

        res.status(201).json({ message: 'Posted successfully', updatedData });
    } catch (error) {
        console.error('Error updating post:', error);
        res.status(500).json({ message: 'Failed to update post. Please try again.' });
    }
});

async function deleteEvent(itemData) {
    try {
        const response = await query(`/items/events/${itemData.id}`, {
            method: 'DELETE',
            body: JSON.stringify(itemData)
        });

        if (response.status === 204) {
            // 204 No Content response for successful deletion
            return { message: 'Deleted successfully' };
        } else {
            const updatedData = await response.json();
            return { message: 'Deleted successfully', updatedData };
        }
    } catch (error) {
        console.error('Error:', error);
        throw new Error('Failed to delete');
    }
}

app.post('/delete-event', async (req, res) => {
    try {
        const { id } = req.body;

        console.log(id)

        const eventData = {
            id: id
        }

        const updatedData = await deleteEvent(eventData);

        console.log("Updated", updatedData)

        res.status(201).json({ message: 'Deleted successfully', updatedData });
    } catch (error) {
        console.error('Error in deletion:', error);
        res.status(500).json({ message: 'Failed to delete. Please try again.' });
    }
});

async function uploadMatches(userData) {
    try {
        // Use your custom query function to send the update query
        const res = await query(`/items/matches/`, {
            method: 'POST', // Assuming you want to update an existing item
            body: JSON.stringify(userData) // Convert userData to JSON string
        });
        const updatedData = await res.json();
        return updatedData; // Return updated data
    } catch (error) {
        console.error('Error:', error);
        throw new Error('Failed to update');
    }
}

app.post('/submit-match', async (req, res) => {
    try {
        const { date, venue, homeTeam, awayTeam,league } = req.body;
        console.log(req.body)
        const id = req.session.user.id;

        // Construct userData object with post information and picture path
        const userData = {
            user_id: id,
            date: date,
            venue: venue,
            home_team: homeTeam,
            away_team: awayTeam,
            league: league
        };

        console.log(userData);

        // Update user data with the new post data
        const updatedData = await uploadMatches(userData);

        res.status(201).json({ message: 'Posted successfully', updatedData });
    } catch (error) {
        console.error('Error updating post:', error);
        res.status(500).json({ message: 'Failed to update post. Please try again.' });
    }
});

async function updateMatches(matchData) {
    try {
        // Use your custom query function to send the update query
        const res = await query(`/items/matches/${matchData.id}`, {
            method: 'PATCH', // Assuming you want to update an existing item
            body: JSON.stringify(matchData) // Convert userData to JSON string
        });
        const updatedData = await res.json();
        return updatedData; // Return updated data
    } catch (error) {
        console.error('Error:', error);
        throw new Error('Failed to update');
    }
}

app.post('/update-results', async (req, res) => {
    try {
        const {
            matchId,
            awayShots,
            homeShots,
            homeFouls,
            awayFouls,
            homeGoals,
            awayGoals,
            homePasses,
            awayPasses,
            finalScore
        } = req.body;

        const matchData = {
            id: matchId,
            away_shots: awayShots,
            home_shots: homeShots,
            home_fouls: homeFouls,
            away_fouls: awayFouls,
            home_goals: homeGoals,
            away_goals: awayGoals,
            home_passes: homePasses,
            away_passes: awayPasses,
            status: "completed",
            final_score: finalScore
        };

        // console.log(matchData);

        // Update user data with the new post data
        const updatedData = await updateMatches(matchData);

        res.status(201).json({ message: 'Updated successfully', updatedData });
    } catch (error) {
        console.error('Error updating post:', error);
        res.status(500).json({ message: 'Failed to update post. Please try again.' });
    }
}
);

async function deleteMatch(matchData) {
    try {
        const response = await query(`/items/matches/${matchData.id}`, {
            method: 'DELETE',
            body: JSON.stringify(matchData)
        });

        if (response.status === 204) {
            // 204 No Content response for successful deletion
            return { message: 'Deleted successfully' };
        } else {
            const updatedData = await response.json();
            return { message: 'Deleted successfully', updatedData };
        }
    } catch (error) {
        console.error('Error:', error);
        throw new Error('Failed to delete');
    }
}

app.post('/delete-match', async (req, res) => {
    try {
        const { id } = req.body;

        console.log(id)

        const matchData = {
            id: id
        }

        const updatedData = await deleteMatch(matchData);

        // console.log("Updated", updatedData)

        res.status(201).json({ message: 'Deleted successfully', updatedData });
    } catch (error) {
        console.error('Error in deletion:', error);
        res.status(500).json({ message: 'Failed to delete. Please try again.' });
    }
});

async function uploadTeams(userData) {
    try {
        // Use your custom query function to send the update query
        const res = await query(`/items/teams/`, {
            method: 'POST', // Assuming you want to update an existing item
            body: JSON.stringify(userData) // Convert userData to JSON string
        });
        const updatedData = await res.json();
        return updatedData; // Return updated data
    } catch (error) {
        console.error('Error:', error);
        throw new Error('Failed to update');
    }
}

app.post('/submit-team', async (req, res) => {
    try {
        const { name, season, league, number_of_players, manager } = req.body;

        // Construct userData object with post information and picture path
        const userData = {
            name: name,
            season: season,
            league: league,
            number_of_players: number_of_players,
            team_manager: manager,
        };

        console.log(userData);

        // Update user data with the new post data
        const updatedData = await uploadTeams(userData);

        res.status(201).json({ message: 'Posted successfully', updatedData });
    } catch (error) {
        console.error('Error updating post:', error);
        res.status(500).json({ message: 'Failed to update post. Please try again.' });
    }
});

async function deleteTeam(teamData) {
    try {
        const response = await query(`/items/teams/${teamData.id}`, {
            method: 'DELETE',
            body: JSON.stringify(teamData)
        });

        if (response.status === 204) {
            // 204 No Content response for successful deletion
            return { message: 'Deleted successfully' };
        } else {
            const updatedData = await response.json();
            return { message: 'Deleted successfully', updatedData };
        }
    } catch (error) {
        console.error('Error:', error);
        throw new Error('Failed to delete');
    }
}

app.post('/delete-team', async (req, res) => {
    try {
        const { id } = req.body;

        console.log(id)

        const teamData = {
            id: id
        }

        const updatedData = await deleteTeam(teamData);

        // console.log("Updated", updatedData)

        res.status(201).json({ message: 'Deleted successfully', updatedData });
    } catch (error) {
        console.error('Error in deletion:', error);
        res.status(500).json({ message: 'Failed to delete. Please try again.' });
    }
});

async function uploadPlayers(userData) {
    try {
        // Use your custom query function to send the update query
        const res = await query(`/items/players/`, {
            method: 'POST', // Assuming you want to update an existing item
            body: JSON.stringify(userData) // Convert userData to JSON string
        });
        const updatedData = await res.json();
        return updatedData; // Return updated data
    } catch (error) {
        console.error('Error:', error);
        throw new Error('Failed to update');
    }
}
app.post('/submit-player', async (req, res) => {
    try {
        const { name, age, team, position, jersey_number, manager } = req.body;

        // Construct userData object with post information and picture path
        const userData = {
            name: name,
            age: age,
            team: team,
            position: position,
            number: jersey_number,
            tm: manager,
        };

        console.log(userData);

        // Update user data with the new post data
        const updatedData = await uploadPlayers(userData);

        res.status(201).json({ message: 'Posted successfully', updatedData });
    } catch (error) {
        console.error('Error updating post:', error);
        res.status(500).json({ message: 'Failed to update post. Please try again.' });
    }
});

async function deletePlayer(playerData) {
    try {
        const response = await query(`/items/players/${playerData.id}`, {
            method: 'DELETE',
            body: JSON.stringify(playerData)
        });

        if (response.status === 204) {
            // 204 No Content response for successful deletion
            return { message: 'Deleted successfully' };
        } else {
            const updatedData = await response.json();
            return { message: 'Deleted successfully', updatedData };
        }
    } catch (error) {
        console.error('Error:', error);
        throw new Error('Failed to delete');
    }
}

app.post('/delete-player', async (req, res) => {
    try {
        const { id } = req.body;

        console.log(id)

        const playerData = {
            id: id
        }

        const updatedData = await deletePlayer(playerData);

        // console.log("Updated", updatedData)

        res.status(201).json({ message: 'Deleted successfully', updatedData });
    } catch (error) {
        console.error('Error in deletion:', error);
        res.status(500).json({ message: 'Failed to delete. Please try again.' });
    }
});

async function updatePlayers(playerData) {
    try {
        // Use your custom query function to send the update query
        const res = await query(`/items/players/${playerData.id}`, {
            method: 'PATCH', // Assuming you want to update an existing item
            body: JSON.stringify(playerData) // Convert userData to JSON string
        });
        const updatedData = await res.json();
        return updatedData; // Return updated data
    } catch (error) {
        console.error('Error:', error);
        throw new Error('Failed to update');
    }
}

app.post('/update-player', async (req, res) => {
    try {
        const { id, goals, red_cards, yellow_cards, manager } = req.body;

        console.log(id)

        const playerData = {
            id: id,
            goals: goals,
            red_cards: red_cards,
            yellow_cards: yellow_cards,
            tm: manager
        }

        const updatedData = await updatePlayers(playerData);

        // console.log("Updated", updatedData)

        res.status(201).json({ message: 'Deleted successfully', updatedData });
    } catch (error) {
        console.error('Error in deletion:', error);
        res.status(500).json({ message: 'Failed to delete. Please try again.' });
    }
});

async function uploadSeasons(userData) {
    try {
        // Use your custom query function to send the update query
        const res = await query(`/items/seasons/`, {
            method: 'POST', // Assuming you want to update an existing item
            body: JSON.stringify(userData) // Convert userData to JSON string
        });
        const updatedData = await res.json();
        return updatedData; // Return updated data
    } catch (error) {
        console.error('Error:', error);
        throw new Error('Failed to update');
    }
}

app.post('/submit-season', async (req, res) => {
    try {
        const {
            name,
            start_date,
            end_date,   
            number_of_teams,
            number_of_leagues,
            status
        } = req.body;

        // Construct userData object with post information and picture path
        const userData = {
            name: name,
            start_date: start_date,
            end_date: end_date,
            number_of_teams: number_of_teams,
            number_of_leagues: number_of_leagues,
            status: status
        };

        console.log(userData);

        // Update user data with the new post data
        const updatedData = await uploadSeasons(userData);

        console.log("Updated", updatedData);


        res.status(201).json({ message: 'Posted successfully', updatedData });
    } catch (error) {
        console.error('Error updating post:', error);
        res.status(500).json({ message: 'Failed to update post. Please try again.' });
    }
});

async function deleteSeason(seasonData) {
    try {
        const response = await query(`/items/seasons/${seasonData.id}`, {
            method: 'DELETE',
            body: JSON.stringify(seasonData)
        });

        if (response.status === 204) {
            // 204 No Content response for successful deletion
            return { message: 'Deleted successfully' };
        } else {
            const updatedData = await response.json();
            return { message: 'Deleted successfully', updatedData };
        }
    } catch (error) {
        console.error('Error:', error);
        throw new Error('Failed to delete');
    }
}
app.post('/delete-season', async (req, res) => {
    try {
        const { id } = req.body;

        console.log(id)

        const seasonData = {
            id: id
        }

        const updatedData = await deleteSeason(seasonData);

        // console.log("Updated", updatedData)

        res.status(201).json({ message: 'Deleted successfully', updatedData });
    } catch (error) {
        console.error('Error in deletion:', error);
        res.status(500).json({ message: 'Failed to delete. Please try again.' });
    }
});

async function updateSeasons(seasonData) {
    try {
        // Use your custom query function to send the update query
        const res = await query(`/items/seasons/${seasonData.id}`, {
            method: 'PATCH', // Assuming you want to update an existing item
            body: JSON.stringify(seasonData) // Convert userData to JSON string
        });
        const updatedData = await res.json();
        return updatedData; // Return updated data
    } catch (error) {
        console.error('Error:', error);
        throw new Error('Failed to update');
    }
}
app.post('/update-season', async (req, res) => {
    try {
        const { id, status } = req.body;

        console.log(id)

        const seasonData = {
            id: id,
            status: status
        }

        const updatedData = await updateSeasons(seasonData);

        // console.log("Updated", updatedData)

        res.status(201).json({ message: 'Deleted successfully', updatedData });
    } catch (error) {
        console.error('Error in deletion:', error);
        res.status(500).json({ message: 'Failed to delete. Please try again.' });
    }
});

async function uploadLeagues(userData) {
    try {
        // Use your custom query function to send the update query
        const res = await query(`/items/leagues/`, {
            method: 'POST', // Assuming you want to update an existing item
            body: JSON.stringify(userData) // Convert userData to JSON string
        });
        const updatedData = await res.json();
        return updatedData; // Return updated data
    } catch (error) {
        console.error('Error:', error);
        throw new Error('Failed to update');
    }
}
app.post('/submit-league', async (req, res) => {    
    try {
        const { name, season, number_of_matches, status, end_date, start_date, number_of_teams } = req.body;

        // Construct userData object with post information and picture path
        const userData = {
            name: name,
            season: season,
            number_of_matches: number_of_matches,
            status: status,
            start_date: start_date,
            end_date: end_date,
            number_of_teams: number_of_teams
        };

        console.log(userData);

        // Update user data with the new post data
        const updatedData = await uploadLeagues(userData);

        res.status(201).json({ message: 'Posted successfully', updatedData });
    } catch (error) {
        console.error('Error updating post:', error);
        res.status(500).json({ message: 'Failed to update post. Please try again.' });
    }
});

async function deleteLeague(leagueData) {
    try {
        const response = await query(`/items/leagues/${leagueData.id}`, {
            method: 'DELETE',
            body: JSON.stringify(leagueData)
        });

        if (response.status === 204) {
            // 204 No Content response for successful deletion
            return { message: 'Deleted successfully' };
        } else {
            const updatedData = await response.json();
            return { message: 'Deleted successfully', updatedData };
        }
    } catch (error) {
        console.error('Error:', error);
        throw new Error('Failed to delete');
    }
}
app.post('/delete-league', async (req, res) => {
    try {
        const { id } = req.body;

        console.log(id)

        const leagueData = {
            id: id
        }

        const updatedData = await deleteLeague(leagueData);

        // console.log("Updated", updatedData)

        res.status(201).json({ message: 'Deleted successfully', updatedData });
    } catch (error) {
        console.error('Error in deletion:', error);
        res.status(500).json({ message: 'Failed to delete. Please try again.' });
    }
});

async function updateLeagues(leagueData) {
    try {
        // Use your custom query function to send the update query
        const res = await query(`/items/leagues/${leagueData.id}`, {
            method: 'PATCH', // Assuming you want to update an existing item
            body: JSON.stringify(leagueData) // Convert userData to JSON string
        });
        const updatedData = await res.json();
        return updatedData; // Return updated data
    } catch (error) {
        console.error('Error:', error);
        throw new Error('Failed to update');
    }
}

app.post('/update-league', async (req, res) => {
    try {
        const { id, status } = req.body;

        console.log(id)

        const leagueData = {
            id: id,
            status: status
        }

        const updatedData = await updateLeagues(leagueData);

        // console.log("Updated", updatedData)

        res.status(201).json({ message: 'Deleted successfully', updatedData });
    } catch (error) {
        console.error('Error in deletion:', error);
        res.status(500).json({ message: 'Failed to delete. Please try again.' });
    }
});

async function updateUsers(userData) {
    try {
        // Use your custom query function to send the update query
        const res = await query(`/items/users/${userData.id}`, {
            method: 'PATCH', // Assuming you want to update an existing item
            body: JSON.stringify(userData) // Convert userData to JSON string
        });
        const updatedData = await res.json();
        return updatedData; // Return updated data
    } catch (error) {
        console.error('Error:', error);
        throw new Error('Failed to update');
    }
}
app.post('/update-user', async (req, res) => {
    try {
        const { id, name, email, role, password } = req.body;

        // Create base user data without password
        const userData = {
            id,
            name,
            email,
            role
        };

        // Only hash and include password if it's provided
        if (password && password.trim() !== '') {
            const hashedPassword = await bcrypt.hash(password, saltRounds);
            userData.password = hashedPassword;
        }

        const updatedData = await updateUsers(userData);

        res.status(201).json({ message: 'Updated successfully', updatedData });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ message: 'Failed to update user. Please try again.' });
    }
});

async function deleteUser(userData) {
    try {
        const response = await query(`/items/users/${userData.id}`, {
            method: 'DELETE',
            body: JSON.stringify(userData)
        });

        if (response.status === 204) {
            // 204 No Content response for successful deletion
            return { message: 'Deleted successfully' };
        } else {
            const updatedData = await response.json();
            return { message: 'Deleted successfully', updatedData };
        }
    } catch (error) {
        console.error('Error:', error);
        throw new Error('Failed to delete');
    }
}

app.post('/delete-user', async (req, res) => {
    try {
        const { id } = req.body;

        console.log(id)

        const userData = {
            id: id
        }

        const updatedData = await deleteUser(userData);

        // console.log("Updated", updatedData)

        res.status(201).json({ message: 'Deleted successfully', updatedData });
    } catch (error) {
        console.error('Error in deletion:', error);
        res.status(500).json({ message: 'Failed to delete. Please try again.' });
    }
});

// Logout route
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        res.redirect('/login');
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
