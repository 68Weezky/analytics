const express = require('express');
const router = express.Router();

const url = process.env.DIRECTUS_URL;
const accessToken = process.env.DIRECTUS_TOKEN;

// Create team lookup map
const teamMap = {};
teams.forEach(team => {
    teamMap[team.id] = team.name; // or team object if you need more info
});
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

async function getUsers() {
    try {
        const response = await query(`/items/users`, {
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
async function getStats(standings, players, teamMap = {}) {
    try {
        if (!standings || Object.keys(standings).length === 0) {
            throw new Error('No standings data provided');
        }

        // Initialize stats object
        const stats = {
            topTeams: [],
            topScorers: [],
            bestDefenses: [],
            highestScoringTeams: [],
            leagueStats: {},
            averages: {
                goalsPerTeam: 0,
                pointsPerTeam: 0
            },
            meta: {
                totalLeagues: Object.keys(standings).length,
                totalTeams: 0,
                totalPlayers: players?.length || 0
            }
        };

        // Process standings to find top teams across all leagues
        const allTeams = [];
        let totalGoals = 0;
        let totalPoints = 0;

        Object.keys(standings).forEach(league => {
            if (!standings[league]?.length) return;

            const leagueTeams = standings[league];
            stats.meta.totalTeams += leagueTeams.length;

            // Calculate league totals
            const leagueGoals = leagueTeams.reduce((sum, team) => sum + (team.goals_for || 0), 0);
            const leaguePoints = leagueTeams.reduce((sum, team) => sum + (team.points || 0), 0);

            // Get top 3 teams in each league
            const leagueTopTeams = [...leagueTeams]
                .sort((a, b) => (b.points || 0) - (a.points || 0))
                .slice(0, 3);

            // Store league-specific stats
            stats.leagueStats[league] = {
                totalTeams: leagueTeams.length,
                topTeams: leagueTopTeams,
                highestScoringTeam: leagueTeams.reduce((max, team) => 
                    (team.goals_for || 0) > (max.goals_for || 0) ? team : max, leagueTeams[0]),
                bestDefense: leagueTeams.reduce((min, team) => 
                    (team.goals_against || Infinity) < (min.goals_against || Infinity) ? team : min, leagueTeams[0]),
                averageGoals: leagueGoals / leagueTeams.length,
                averagePoints: leaguePoints / leagueTeams.length
            };

            // Accumulate for overall stats
            totalGoals += leagueGoals;
            totalPoints += leaguePoints;
            allTeams.push(...leagueTeams);
        });

        // Calculate overall averages
        if (stats.meta.totalTeams > 0) {
            stats.averages.goalsPerTeam = totalGoals / stats.meta.totalTeams;
            stats.averages.pointsPerTeam = totalPoints / stats.meta.totalTeams;
        }

        // Sort and get overall top teams (top 5)
        stats.topTeams = [...allTeams]
            .sort((a, b) => (b.points || 0) - (a.points || 0) || 
                          (b.goal_difference || 0) - (a.goal_difference || 0))
            .slice(0, 5);

        // Process players data
        if (players?.length > 0) {
            // Create team map if not provided
            const effectiveTeamMap = Object.keys(teamMap).length > 0 ? teamMap : 
                allTeams.reduce((map, team) => {
                    map[team.id] = team.name;
                    return map;
                }, {});

            // Top scorers
            stats.topScorers = [...players]
                .filter(player => player.goals > 0)
                .sort((a, b) => (b.goals || 0) - (a.goals || 0))
                .slice(0, 5)
                .map(player => ({
                    ...player,
                    team_name: effectiveTeamMap[player.team_id] || 'Unknown Team'
                }));

            // Top assisters (if data exists)
            if (players.some(p => p.assists !== undefined)) {
                stats.topAssisters = [...players]
                    .filter(player => player.assists > 0)
                    .sort((a, b) => (b.assists || 0) - (a.assists || 0))
                    .slice(0, 5)
                    .map(player => ({
                        ...player,
                        team_name: effectiveTeamMap[player.team_id] || 'Unknown Team'
                    }));
            }

            // Clean sheets (for goalkeepers/defenders)
            if (players.some(p => p.clean_sheets !== undefined)) {
                stats.mostCleanSheets = [...players]
                    .filter(player => player.clean_sheets > 0)
                    .sort((a, b) => (b.clean_sheets || 0) - (a.clean_sheets || 0))
                    .slice(0, 5);
            }
        }

        // Best defenses (lowest goals against)
        stats.bestDefenses = [...allTeams]
            .filter(team => team.goals_against !== undefined)
            .sort((a, b) => (a.goals_against || Infinity) - (b.goals_against || Infinity))
            .slice(0, 5);

        // Highest scoring teams
        stats.highestScoringTeams = [...allTeams]
            .filter(team => team.goals_for !== undefined)
            .sort((a, b) => (b.goals_for || 0) - (a.goals_for || 0))
            .slice(0, 5);

        return stats;
    } catch (error) {
        console.error('Error generating stats:', error);
        throw error;
    }
}

// Report Form
router.get('/', async (req, res) => {
    const user = req.session.user;

    const events = await getEvents();
    const matches = await getMatches();
    const teams = await getTeams();
    const players = await getPlayers();
    const seasons = await getSeasons();
    const leagues = await getLeagues();
    const usersData = await getUsers();

    // console.log('Usres', usersData);

    const users = usersData.filter(filteredUser =>
        String(filteredUser.id) !== String(user.id)
    );

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
    // Generate stats
    const stats = await getStats(standings, players, teamMap);  


    res.render('admin', {
        user: user,
        events: events,
        matches: matches,
        teams: teams,
        players: players,
        seasons: seasons,
        leagues: leagues,
        stats: stats,
        standings: standingsArray,
        users: users
    });
});

module.exports = router;