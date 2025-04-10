const knex = require('../config/knex');
const Player = require("../models/player");
const Team = require("../models/team");
const Season = require("../models/season");
const Match = require("../models/match");

module.exports = {
    // View Team Page
    getViewTeam: async (req, res) => {
        try {
            const reqTeam = req.session.user.team;
            
            const [players, team, teams, season] = await Promise.all([
                Player.query({ team: reqTeam }),
                Team.query({ name: reqTeam }),
                Team.query({ league: "Masters" }),
                Season.query({ status: "Ongoing" })
            ]);

            let matches = [];
            if (season) {
                matches = await Match.query(
                    knex.raw('(home = ? OR away = ?) AND season = ?', 
                    [reqTeam, reqTeam, season.name])
                );
            }

            res.render("admin/viewTeam", {
                title: "Team page",
                user: req.session.user,
                path: "/index",
                players: players || [],
                team: team || [],
                season: season || [],
                matches: matches || [],
                message: ""
            });
        } catch (error) {
            console.error(error);
            res.status(500).send("Server Error");
        }
    },

    // Add New Player
    postAddPlayer: async (req, res) => {
        try {
            const { name, dob, team, kit, league } = req.body;
            const status = "Pending";
            
            const result = await Player.store(name, new Date(dob), kit, team, league, status);
            
            if (result.success) {
                res.redirect("/admin/");
            } else {
                const [players, teams] = await Promise.all([
                    Player.query({ team }),
                    Team.query({ league: "Masters" })
                ]);
                
                res.render("admin/", {
                    title: "Team page",
                    user: req.session.user,
                    path: "/index",
                    players: players || [],
                    teams: teams || [],
                    message: "INVALID DETAILS"
                });
            }
        } catch (error) {
            console.error(error);
            res.status(500).send("Server Error");
        }
    },

    // View Player Page
    getViewPlayer: async (req, res) => {
        try {
            const player = await Player.query({ serial: req.params.playerSerial });
            
            if (player) {
                res.render("admin/viewPlayer", {
                    title: "Player",
                    user: req.session.user,
                    path: "/index",
                    player: player || []
                });
            } else {
                res.redirect("/admin/");
            }
        } catch (error) {
            console.error(error);
            res.redirect("/admin/");
        }
    },

    // Delete Player
    getDelPlayer: async (req, res) => {
        try {
            await Player.rm(req.params.playerSerial);
            res.redirect("/admin/");
        } catch (error) {
            console.error(error);
            res.redirect("/admin/");
        }
    },

    // Squad Selection Page
    getSquad: async (req, res) => {
        try {
            const teamName = req.params.matchTeam;
            const matchNo = req.params.matchNo;
            
            const [season, team, players, match] = await Promise.all([
                Season.query({ status: "Ongoing" }),
                Team.query({ name: teamName }),
                Player.query({ team: teamName, status: "Reg" }),
                Match.query(
                    knex.raw('number = ? AND season = ?', 
                    [matchNo, season.name])
                )
            ]);

            res.render("admin/squad", {
                players: players || [],
                team: team || [],
                match: match || []
            });
        } catch (error) {
            console.error(error);
            res.status(500).send("Server Error");
        }
    },

    // Update Squad for Match
    postSquad: async (req, res) => {
        try {
            const { selected, matchNo, ground } = req.body;
            const season = await Season.query({ status: "Ongoing" });
            const match = await Match.query(
                knex.raw('number = ? AND season = ?', 
                [matchNo, season.name])
            );

            let squad = ground === "Home" ? match.home_squad : match.away_squad;
            squad = JSON.parse(squad || '[]');

            const processSelection = (sel) => {
                const player = JSON.parse(sel);
                if (squad.length < 11 && !squad.some(p => p.serial === player.serial)) {
                    squad.push(player);
                }
            };

            if (Array.isArray(selected)) {
                selected.forEach(processSelection);
            } else if (selected) {
                processSelection(selected);
            }

            const updateField = ground === "Home" 
                ? { home_squad: JSON.stringify(squad) } 
                : { away_squad: JSON.stringify(squad) };

            await Match.update(match.id, updateField);
            res.redirect(req.headers.referer);
        } catch (error) {
            console.error(error);
            res.redirect(req.headers.referer);
        }
    }
};
