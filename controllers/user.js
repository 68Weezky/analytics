const knex = require('../config/knex');
const User = require("../models/user");
const League = require("../models/league");
const Team = require("../models/team");
const Player = require("../models/player");
const Season = require("../models/season");
const Match = require("../models/match");

module.exports = {
    // Get Standings
    getStandings: async (req, res) => {
        try {
            const [season, teams] = await Promise.all([
                Season.query({ status: 'Ongoing' }),
                Team.query({})
            ]);

            let rank = [];
            if (season) {
                rank = season.standings.map(x => ({
                    ...x,
                    points: x.w * 3 + x.d
                })).sort((a, b) => {
                    if (b.points === a.points) {
                        return (b.gf - b.ga) - (a.gf - a.ga);
                    }
                    return b.points - a.points;
                });
            }

            res.render('user/index', {
                season,
                teams,
                rank,
                title: "standings"
            });
        } catch (error) {
            console.error(error);
            res.status(500).send("Server Error");
        }
    },

    // Get Teams List
    getTeams: async (req, res) => {
    try {
        const [season, teams] = await Promise.all([
            Season.query({ status: 'Ongoing' }) || null,
            Team.query({}) || [] // Fallback to empty array
        ]);

        // Debug logging
        console.log('Teams data:', teams);
        console.log('Is array:', Array.isArray(teams));

        res.render('user/teams', {
            season,
            teams: Array.isArray(teams) ? teams : [], // Double safety
            title: "Teams List" // More descriptive title
        });
    } catch (error) {
        console.error("Teams Error:", error);
        res.status(500).render('error', { 
            message: "Failed to load teams" 
        });
    }
},
    //     try {
    //         const [season, teams] = await Promise.all([
    //             Season.query({ status: 'Ongoing' }),
    //             Team.query({})
    //         ]);

    //         res.render('user/teams', {
    //             season,
    //             teams,
    //             title: "standings"
    //         });
    //     } catch (error) {
    //         console.error(error);
    //         res.status(500).send("Server Error");
    //     }
    // },

    // Get Matches List
    getMatches: async (req, res) => {
        try {
            const season = await Season.query({ status: 'Ongoing' });
            let matches = [];
            let teams = [];

            if (season) {
                [matches, teams] = await Promise.all([
                    Match.query({ season: season.name }),
                    Team.query({})
                ]);
            }

            res.render('user/matches', {
                season,
                teams,
                matches,
                title: "Matches"
            });
        } catch (error) {
            console.error(error);
            res.status(500).send("Server Error");
        }
    },

    // Get Statistics
    getStats: async (req, res) => {
        try {
            const season = await Season.query({ status: 'Ongoing' });
            let matches = [];
            let teams = [];
            let players = [];
            let goalRank = [];

            if (season) {
                [matches, teams, players] = await Promise.all([
                    Match.query({ season: season.name }),
                    Team.query({}),
                    Player.query({ status: "Reg" })
                ]);
            }

            goalRank = players.map(player => ({
                name: player.name,
                serial: player.serial,
                team: player.team,
                goals: player.goals ? JSON.parse(player.goals).length : 0
            })).sort((a, b) => b.goals - a.goals);

            res.render('user/stats', {
                season,
                teams,
                matches,
                title: "Stats",
                goalRank
            });
        } catch (error) {
            console.error(error);
            res.status(500).send("Server Error");
        }
    },

    // View Team Details
    getViewTeam: async (req, res) => {
        try {
            const name = req.params.name;
            const [team, teams, players, season] = await Promise.all([
                Team.query({ name }),
                Team.query({}),
                Player.query({ team: name }),
                Season.query({ status: "Ongoing" })
            ]);

            let matches = [];
            if (season) {
                matches = await Match.query(
                    knex.raw('home = ? OR away = ?', [name, name])
                );
            }

            res.render('user/viewTeam', {
                matches,
                players,
                team,
                teams,
                season,
                title: "teams"
            });
        } catch (error) {
            console.error(error);
            res.status(500).send("Server Error");
        }
    }
};
