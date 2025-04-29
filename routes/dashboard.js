const express = require('express');
const router = express.Router();

const url = process.env.DIRECTUS_URL;
const accessToken = process.env.DIRECTUS_TOKEN;

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

async function getEvents() {
    try {
        const response = await query(`/items/events`, {
            method: 'GET'
        });

        if (response.ok) {
            const productsData = await response.json();
            return productsData.data;
        } else {
            throw new Error('Failed to fetch products');
        }
    } catch (error) {
        console.error('Error fetching products:', error);
        throw error;
    }
}

async function getMatches() {
    try {
        const response = await query(`/items/matches`, {
            method: 'GET'
        });

        if (response.ok) {
            const productsData = await response.json();
            return productsData.data;
        } else {
            throw new Error('Failed to fetch products');
        }
    } catch (error) {
        console.error('Error fetching products:', error);
        throw error;
    }
}

async function getTeams() {
    try {
        const response = await query(`/items/teams`, {
            method: 'GET'
        });

        if (response.ok) {
            const productsData = await response.json();
            return productsData.data;
        } else {
            throw new Error('Failed to fetch products');
        }
    } catch (error) {
        console.error('Error fetching products:', error);
        throw error;
    }
}

async function getPlayers() {
    try {
        const response = await query(`/items/players`, {
            method: 'GET'
        });

        if (response.ok) {
            const productsData = await response.json();
            return productsData.data;
        } else {
            throw new Error('Failed to fetch products');
        }
    } catch (error) {
        console.error('Error fetching products:', error);
        throw error;
    }
}

async function getSeasons() {
    try {
        const response = await query(`/items/seasons`, {
            method: 'GET'
        });

        if (response.ok) {
            const productsData = await response.json();
            return productsData.data;
        } else {
            throw new Error('Failed to fetch products');
        }
    } catch (error) {
        console.error('Error fetching products:', error);
        throw error;
    }
}

async function getLeagues() {
    try {
        const response = await query(`/items/leagues`, {
            method: 'GET'
        });

        if (response.ok) {
            const productsData = await response.json();
            return productsData.data;
        } else {
            throw new Error('Failed to fetch products');
        }
    } catch (error) {
        console.error('Error fetching products:', error);
        throw error;
    }
}

// Report Form
router.get('/', async (req, res) => {
    user = req.session.user;

    const events = await getEvents();
    const matches = await getMatches();
    const teams = await getTeams();
    const players = await getPlayers();
    const seasons = await getSeasons();
    const leagues = await getLeagues();

    // Fetch matches data
    const matchesData = await getMatches();

    // Initialize standings object
    const standings = {};

    // Process match results to calculate standings
    matchesData.forEach(match => {
        const { league, home_team, away_team, home_goals, away_goals } = match;

        // Initialize league if not already present
        if (!standings[league]) {
            standings[league] = {};
        }

        // Initialize team stats if not already present
        if (!standings[league][home_team]) {
            standings[league][home_team] = {
                name: home_team,
                wins: 0,
                losses: 0,
                draws: 0,
                goals_for: 0,
                goals_against: 0,
                goal_difference: 0,
                points: 0,
                games_played: 0
            };
        }
        if (!standings[league][away_team]) {
            standings[league][away_team] = {
                name: away_team,
                wins: 0,
                losses: 0,
                draws: 0,
                goals_for: 0,
                goals_against: 0,
                goal_difference: 0,
                points: 0,
                games_played: 0
            };
        }

        // Update goals for and against
        standings[league][home_team].goals_for += home_goals;
        standings[league][home_team].goals_against += away_goals;
        standings[league][away_team].goals_for += away_goals;
        standings[league][away_team].goals_against += home_goals;

        // Determine match result and update stats
        if (home_goals > away_goals) {
            standings[league][home_team].wins++;
            standings[league][home_team].points += 3;
            standings[league][away_team].losses++;
        } else if (home_goals < away_goals) {
            standings[league][away_team].wins++;
            standings[league][away_team].points += 3;
            standings[league][home_team].losses++;
        } else {
            standings[league][home_team].draws++;
            standings[league][home_team].points += 1;
            standings[league][away_team].draws++;
            standings[league][away_team].points += 1;
        }

        standings[league][home_team].games_played++;
        standings[league][away_team].games_played++;
    });

    // Convert standings object to array for rendering
    const standingsArray = {};
    Object.keys(standings).forEach(league => {
        standingsArray[league] = Object.values(standings[league]);

        // Calculate goal difference
        standingsArray[league].forEach(team => {
            team.goal_difference = team.goals_for - team.goals_against;
        });

        // Sort standings by points (descending) and goal difference (descending)
        standingsArray[league].sort((a, b) => {
            if (b.points !== a.points) {
                return b.points - a.points;
            } else {
                return b.goal_difference - a.goal_difference;
            }
        });
    });

    res.render('dashboard', {
        user: user,
        events: events,
        matches: matches,
        teams: teams,
        players: players,
        seasons: seasons,
        leagues: leagues,
        standings: standingsArray // Pass the standings array to the template
    });
});

module.exports = router;