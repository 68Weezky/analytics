const knex = require('../config/knex');
const User = require("../models/user");
// const League = require("../models/league");
// const Team = require("../models/team");
// const Player = require("../models/player");
// const Season = require("../models/season");
// const Match = require("../models/match");

module.exports = {
    /**
     * Default landing page
     */
    getIndex: async (req, res) => {
        try {
            res.render('user/index', {
                title: 'User Home',
                user: req.user
            });
        } catch (error) {
            console.error('Error rendering user index:', error);
            res.status(500).render('error/500', {
                title: 'Error',
                message: 'Failed to load page',
                user: req.user || null
            });
        }
    },
    
    /**
     * Render user dashboard
     */
    getUserDashboard: async (req, res) => {
        try {
            res.render('user/userPage', {
                title: 'User Dashboard',
                user: req.user
            });
        } catch (error) {
            console.error('Error rendering user dashboard:', error);
            res.status(500).render('error/500', {
                title: 'Error',
                message: 'Failed to load dashboard',
                user: req.user || null
            });
        }
    },

    /**
     * Render API docs
     */
    getApiDocs: async (req, res) => {
        try {
            res.render('user/api-docs', {
                title: 'API Documentation',
                user: req.user
            });
        } catch (error) {
            console.error('Error rendering API docs:', error);
            res.status(500).render('error/500', {
                title: 'Error',
                message: 'Failed to load API documentation',
                user: req.user || null
            });
        }
    },

    /**
     * Get current user profile (API endpoint)
     */
getCurrentUser: async (req, res) => {
    try {
        // Fetch fresh data from database instead of using req.user
        const user = await User.query().findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        // Return only public-facing user data
        const { id, username, email, createdAt } = user;
        res.json({ id, username, email, createdAt });
    } catch (error) {
        console.error('Error getting user profile:', error);
        res.status(500).json({ 
            message: 'Error fetching user profile',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
},
    // /**
    //  * Get standings data
    //  */
    // getStandings: async (req, res) => {
    //     try {
    //         const [season, teams] = await Promise.all([
    //             Season.query({ status: 'Ongoing' }),
    //             Team.query({})
    //         ]);

    //         let rank = [];
    //         if (season) {
    //             rank = season.standings.map(x => ({
    //                 ...x,
    //                 points: x.w * 3 + x.d
    //             })).sort((a, b) => {
    //                 if (b.points === a.points) {
    //                     return (b.gf - b.ga) - (a.gf - a.ga);
    //                 }
    //                 return b.points - a.points;
    //             });
    //         }

    //         res.render('user/standings', {
    //             season,
    //             teams,
    //             rank,
    //             title: "Standings",
    //             user: req.user
    //         });
    //     } catch (error) {
    //         console.error(error);
    //         res.status(500).render('error/500', {
    //             title: 'Error',
    //             message: 'Failed to load standings',
    //             user: req.user || null
    //         });
    //     }
    // },

    // /**
    //  * Get teams list
    //  */
    // getTeams: async (req, res) => {
    //     try {
    //         const [season, teams] = await Promise.all([
    //             Season.query({ status: 'Ongoing' }) || null,
    //             Team.query({}) || []
    //         ]);

    //         res.render('user/teams', {
    //             season,
    //             teams: Array.isArray(teams) ? teams : [],
    //             title: "Teams List",
    //             user: req.user
    //         });
    //     } catch (error) {
    //         console.error("Teams Error:", error);
    //         res.status(500).render('error/500', {
    //             title: 'Error',
    //             message: 'Failed to load teams',
    //             user: req.user || null
    //         });
    //     }
    // },

    // /**
    //  * Get matches list
    //  */
    // getMatches: async (req, res) => {
    //     try {
    //         const season = await Season.query({ status: 'Ongoing' });
    //         let matches = [];
    //         let teams = [];

    //         if (season) {
    //             [matches, teams] = await Promise.all([
    //                 Match.query({ season: season.name }),
    //                 Team.query({})
    //             ]);
    //         }

    //         res.render('user/matches', {
    //             season,
    //             teams,
    //             matches,
    //             title: "Matches",
    //             user: req.user
    //         });
    //     } catch (error) {
    //         console.error(error);
    //         res.status(500).render('error/500', {
    //             title: 'Error',
    //             message: 'Failed to load matches',
    //             user: req.user || null
    //         });
    //     }
    // },

    // /**
    //  * Get statistics
    //  */
    // getStats: async (req, res) => {
    //     try {
    //         const season = await Season.query({ status: 'Ongoing' });
    //         let matches = [];
    //         let teams = [];
    //         let players = [];
    //         let goalRank = [];

    //         if (season) {
    //             [matches, teams, players] = await Promise.all([
    //                 Match.query({ season: season.name }),
    //                 Team.query({}),
    //                 Player.query({ status: "Reg" })
    //             ]);
    //         }

    //         goalRank = players.map(player => ({
    //             name: player.name,
    //             serial: player.serial,
    //             team: player.team,
    //             goals: player.goals ? JSON.parse(player.goals).length : 0
    //         })).sort((a, b) => b.goals - a.goals);

    //         res.render('user/stats', {
    //             season,
    //             teams,
    //             matches,
    //             title: "Statistics",
    //             goalRank,
    //             user: req.user
    //         });
    //     } catch (error) {
    //         console.error(error);
    //         res.status(500).render('error/500', {
    //             title: 'Error',
    //             message: 'Failed to load statistics',
    //             user: req.user || null
    //         });
    //     }
    // },

    // /**
    //  * View team details
    //  */
    // getViewTeam: async (req, res) => {
    //     try {
    //         const name = req.params.teamId; // Changed from name to teamId to match route
    //         const [team, teams, players, season] = await Promise.all([
    //             Team.query({ name }),
    //             Team.query({}),
    //             Player.query({ team: name }),
    //             Season.query({ status: "Ongoing" })
    //         ]);

    //         let matches = [];
    //         if (season) {
    //             matches = await Match.query(
    //                 knex.raw('home = ? OR away = ?', [name, name])
    //             );
    //         }

    //         res.render('user/team-view', {
    //             matches,
    //             players,
    //             team,
    //             teams,
    //             season,
    //             title: team ? team.name : "Team Details",
    //             user: req.user
    //         });
    //     } catch (error) {
    //         console.error(error);
    //         res.status(500).render('error/500', {
    //             title: 'Error',
    //             message: 'Failed to load team details',
    //             user: req.user || null
    //         });
    //     }
    // }
};
