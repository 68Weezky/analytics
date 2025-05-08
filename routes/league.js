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

async function getStats(standings, players, matches, teamMap = {}) {
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
            teamMatchStats: {},
            playerStats: [],
            averages: {
                goalsPerTeam: 0,
                pointsPerTeam: 0,
                passesPerMatch: 0,
                foulsPerMatch: 0,
                shotsPerMatch: 0
            },
            meta: {
                totalLeagues: Object.keys(standings).length,
                totalTeams: 0,
                totalPlayers: players?.length || 0,
                totalMatches: matches?.length || 0
            }
        };

        // Process matches to calculate team statistics
        if (matches?.length > 0) {
            // First, initialize teamMatchStats for all teams
            matches.forEach(match => {
                const { home_team, away_team } = match;
                if (!stats.teamMatchStats[home_team]) {
                    stats.teamMatchStats[home_team] = {
                        matches: [],
                        totalPasses: 0,
                        totalFouls: 0,
                        totalShots: 0,
                        matchesPlayed: 0
                    };
                }
                if (!stats.teamMatchStats[away_team]) {
                    stats.teamMatchStats[away_team] = {
                        matches: [],
                        totalPasses: 0,
                        totalFouls: 0,
                        totalShots: 0,
                        matchesPlayed: 0
                    };
                }
            });

            // Then process each match
            matches.forEach(match => {
                const { home_team, away_team, home_passes, away_passes, home_fouls, away_fouls, home_shots, away_shots } = match;
                
                // Add match to team's matches array
                stats.teamMatchStats[home_team].matches.push({
                    ...match,
                    isHome: true,
                    teamPasses: parseInt(home_passes) || 0,
                    teamFouls: parseInt(home_fouls) || 0,
                    teamShots: parseInt(home_shots) || 0,
                    totalPasses: (parseInt(home_passes) || 0) + (parseInt(away_passes) || 0),
                    totalFouls: (parseInt(home_fouls) || 0) + (parseInt(away_fouls) || 0),
                    totalShots: (parseInt(home_shots) || 0) + (parseInt(away_shots) || 0)
                });

                stats.teamMatchStats[away_team].matches.push({
                    ...match,
                    isHome: false,
                    teamPasses: parseInt(away_passes) || 0,
                    teamFouls: parseInt(away_fouls) || 0,
                    teamShots: parseInt(away_shots) || 0,
                    totalPasses: (parseInt(home_passes) || 0) + (parseInt(away_passes) || 0),
                    totalFouls: (parseInt(home_fouls) || 0) + (parseInt(away_fouls) || 0),
                    totalShots: (parseInt(home_shots) || 0) + (parseInt(away_shots) || 0)
                });

                // Update team totals
                stats.teamMatchStats[home_team].totalPasses += parseInt(home_passes) || 0;
                stats.teamMatchStats[home_team].totalFouls += parseInt(home_fouls) || 0;
                stats.teamMatchStats[home_team].totalShots += parseInt(home_shots) || 0;
                stats.teamMatchStats[home_team].matchesPlayed++;

                stats.teamMatchStats[away_team].totalPasses += parseInt(away_passes) || 0;
                stats.teamMatchStats[away_team].totalFouls += parseInt(away_fouls) || 0;
                stats.teamMatchStats[away_team].totalShots += parseInt(away_shots) || 0;
                stats.teamMatchStats[away_team].matchesPlayed++;
            });
        }

        // Process standings to update team statistics
        Object.keys(standings).forEach(league => {
            if (!standings[league]?.length) return;

            const leagueTeams = standings[league];
            stats.meta.totalTeams += leagueTeams.length;

            leagueTeams.forEach(team => {
                if (!stats.teamMatchStats[team.name]) {
                    stats.teamMatchStats[team.name] = {
                        matches: [],
                        totalPasses: 0,
                        totalFouls: 0,
                        totalShots: 0,
                        matchesPlayed: 0
                    };
                }

                // Update goals from standings
                stats.teamMatchStats[team.name].goalsScored = team.goals_for || 0;
                stats.teamMatchStats[team.name].goalsConceded = team.goals_against || 0;
                stats.teamMatchStats[team.name].matchesPlayed = team.games_played || 0;
            });
        });

        // Process players data
        if (players?.length > 0) {
            // Create team map if not provided
            const effectiveTeamMap = Object.keys(teamMap).length > 0 ? teamMap : 
                Object.keys(stats.teamMatchStats).reduce((map, team) => {
                    map[team] = team;
                    return map;
                }, {});

            // Process player statistics
            stats.playerStats = players.map(player => ({
                name: player.name,
                team: effectiveTeamMap[player.team_id] || 'Unknown Team',
                goals: player.goals || 0,
                assists: player.assists || 0,
                yellowCards: player.yellow_cards || 0,
                redCards: player.red_cards || 0,
                passes: player.passes || 0,
                fouls: player.fouls || 0,
                shots: player.shots || 0
            }));

            // Top scorers
            stats.topScorers = [...stats.playerStats]
                .filter(player => player.goals > 0)
                .sort((a, b) => b.goals - a.goals)
                .slice(0, 5);

            // Players with most cards
            stats.mostCards = [...stats.playerStats]
                .filter(player => (player.yellowCards > 0 || player.redCards > 0))
                .sort((a, b) => (b.yellowCards + b.redCards) - (a.yellowCards + a.redCards))
                .slice(0, 5);

            // Most assists
            stats.topAssisters = [...stats.playerStats]
                .filter(player => player.assists > 0)
                .sort((a, b) => b.assists - a.assists)
                .slice(0, 5);
        }

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

        // Calculate match averages if matches exist
        if (matches?.length > 0) {
            const totalPasses = Object.values(stats.teamMatchStats).reduce((sum, team) => sum + team.totalPasses, 0);
            const totalFouls = Object.values(stats.teamMatchStats).reduce((sum, team) => sum + team.totalFouls, 0);
            const totalShots = Object.values(stats.teamMatchStats).reduce((sum, team) => sum + team.totalShots, 0);

            stats.averages.passesPerMatch = totalPasses / matches.length;
            stats.averages.foulsPerMatch = totalFouls / matches.length;
            stats.averages.shotsPerMatch = totalShots / matches.length;
        }

        return stats;
    } catch (error) {
        console.error('Error generating stats:', error);
        throw error;
    }
}

// League route
router.get('/', async (req, res) => {
    const user = req.session.user;

    try {
        // Fetch all data in parallel for better performance
        const [events, matches, teams, players, seasons, leagues] = await Promise.all([
            getEvents(),
            getMatches(),
            getTeams(),
            getPlayers(),
            getSeasons(),
            getLeagues()
        ]);

        // Create team lookup map
        const teamMap = {};
        teams.forEach(team => {
            teamMap[team.id] = team.name; // or team object if you need more info
        });

        // Initialize standings object
        const standings = {};

        // Process match results to calculate standings
        matches.forEach(match => {
            // Skip matches without a league
            if (!match.league) return;

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

        // Generate statistics
        const stats = await getStats(standingsArray, players, matches, teamMap);

        res.render('league', {
            user: user,
            events: events,
            matches: matches,
            teams: teams,
            players: players,
            seasons: seasons,
            leagues: leagues,
            stats: stats,
            standings: standingsArray
        });
    } catch (error) {
        console.error('Error in league route:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Get match by ID
router.get('/get-match/:id', async (req, res) => {
    try {
        const matchId = req.params.id;
        const response = await query(`/items/matches/${matchId}`, {
            method: 'GET'
        });

        if (response.ok) {
            const matchData = await response.json();
            res.json(matchData.data);
        } else {
            res.status(404).json({ message: 'Match not found' });
        }
    } catch (error) {
        console.error('Error fetching match:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Get player by ID
router.get('/get-player/:id', async (req, res) => {
    try {
        const playerId = req.params.id;
        const response = await query(`/items/players/${playerId}`, {
            method: 'GET'
        });

        if (response.ok) {
            const playerData = await response.json();
            res.json(playerData.data);
        } else {
            res.status(404).json({ message: 'Player not found' });
        }
    } catch (error) {
        console.error('Error fetching player:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;