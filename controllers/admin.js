const knex = require('../config/knex');
const User = require("../models/user");
const League = require("../models/league");
const Team = require("../models/team");
const Player = require("../models/player");
const Season = require("../models/season");
const Match = require("../models/match");
const teamController = require("../controllers/team");
const userController = require("../controllers/user");
const leagueController = require("../controllers/league");
const adminController = require("../controllers/admin");

module.exports = {
    // Authentication Middleware
    authenticate: (req, res, next) => {
        if (req.session.user) next()
        else next('route')
    },

    // Login Handling
    getLogin: (req, res) => {
        res.render('admin/sign-in', { message: "Users Log in" });
    },

    postLogin: async (req, res) => {
        try {
            const { email, password } = req.body;
            const result = await User.verifyCredentials(email.toLowerCase(), password);
            
            if (!result.success) {
                return res.render('admin/sign-in', { message: "ERROR! TRY AGAIN" });
            }

            req.session.user = result.user;
            res.redirect('/users');
        } catch (err) {
            console.error(err);
            res.render('admin/sign-in', { message: "ERROR! TRY AGAIN" });
        }
    },

    // Registration Handling
    getRegister: (req, res) => {
        res.render('admin/register', {message: ""});
    },
    /**
    **/
    postRegister: async (req, res) => {
        try {
            const { name, email, password } = req.body;
            const result = await User.store(name, email, "user", password);
            if (result.success) {
                req.session.user = result.user;
                res.redirect('/users');
            } else {
                res.render('admin/register', { message: result.message });
            }
        } catch (err) {
            console.error(err);
            res.render('admin/register', { message: "Registration failed" });
        }
    },

    // Dashboard
    getIndex: async (req, res) => {
        try {
            const user = await User.query({ id: req.session.user.id });
            
            switch (user.rank) {
                case "team_manager":
                    return teamController.getViewTeam(req, res);
                case "user":
                    return userController.getStandings(req, res);
                case "league_manager":
                    return leagueController.getIndex(req, res);
            }

            const [players, teams, season] = await Promise.all([
                Player.query({}),
                Team.query({ league: "Masters" }),
                Season.query({ status: "Ongoing" })
            ]);

            const matches = season ? await Match.query({ season: season.name }) : [];

            res.render('admin/index', {
                title: "Index",
                user: req.session.user,
                message: "",
                path: "/index",
                players: players || [],
                teams: teams || [],
                season: season || [],
                matches: matches || []
            });
        } catch (err) {
            console.error(err);
            res.status(500).send("Server Error");
        }
    },

    // User Management
    getAddUser: (req, res) => {
        const message = req.query.exist ? "User already exists!" : "";
        res.render('admin/addUser', {
            title: "Add User",
            user: req.session.user,
            path: '/addUser',
            message
        });
    },

    postAddUser: async (req, res) => {
        try {
            const { name, email, league, rank, password } = req.body;
            const existingUser = await User.query({ email: email.toLowerCase() });
            
            if (existingUser) {
                return res.redirect('/admin/addUser?exist=True');
            }

            await User.store(name, email.toLowerCase(), league, rank, password);
            res.redirect('/admin');
        } catch (err) {
            console.error(err);
            res.redirect('/admin/addUser?exist=True');
        }
    },
    // Add this to your module.exports
getUsers: async (req, res) => {
    try {
        const users = await User.query({});
        res.render('admin/users', {
            title: "Manage Users",
            user: req.session.user,
            users: users || [],
            message: ""
        });
    } catch (err) {
        console.error(err);
        res.redirect('/admin');
    }
},
postUpdateUserRank: async (req, res) => {
    try {
        const { userId, newRank } = req.body;
        const currentUser = req.session.user;
        
        // Only allow admins to change ranks
        if (currentUser.rank !== 'admin') {
            return res.status(403).send("Unauthorized");
        }
        
        // Validate the new rank
        const validRanks = ['user', 'team_manager', 'league_manager', 'admin'];
        if (!validRanks.includes(newRank)) {
            return res.status(400).send("Invalid rank");
        }
        
        // Prevent demoting yourself
        if (userId === currentUser.id && newRank !== 'admin') {
            return res.status(400).send("Cannot demote yourself");
        }
        
        await User.update({ id: userId }, { rank: newRank });
        res.redirect('/admin/users');
    } catch (err) {
        console.error(err);
        res.redirect('/admin/users');
    }
},
    // Logout
    getLogout: (req, res) => {
        req.session.user = null;
        req.session.save(err => {
            if (err) throw err;
            req.session.regenerate(err => {
                if (err) throw err;
                res.redirect('/admin');
            });
        });
    }
};
