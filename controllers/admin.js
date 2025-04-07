const knex = require('../config/knex');
const User = require("../models/user");
const League = require("../models/league");
const Team = require("../models/team");
const Player = require("../models/player");
const Season = require("../models/season");
const Match = require("../models/match");
const teamController = require("../controllers/team");

module.exports = {
    // Authentication Middleware
    authenticate: (req, res, next) => {
        if (req.session.user) next()
        else next('route')
    },

    // Login Handling
    getLogin: (req, res) => {
        res.render('admin/sign-in', { message: "Admin Log in" });
    },

    postLogin: async (req, res) => {
        try {
            const { email, password } = req.body;
            const result = await User.verifyCredentials(email.toLowerCase(), password);
            
            if (!result.success) {
                return res.render('admin/sign-in', { message: "ERROR! TRY AGAIN" });
            }

            req.session.regenerate((err) => {
                if (err) throw err;
                req.session.user = result.user;
                req.session.save(err => {
                    if (err) throw err;
                    res.redirect('/admin/');
                });
            });
        } catch (err) {
            console.error(err);
            res.render('admin/sign-in', { message: "ERROR! TRY AGAIN" });
        }
    },

    // Registration Handling
    getRegister: (req, res) => {
        res.render('admin/register');
    },

    postRegister: async (req, res) => {
        try {
            const { league: name, admin, email, password } = req.body;
            const result = await League.store(name, admin, email.toLowerCase(), password);
            
            if (result.success) {
                res.redirect('/admin');
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
            
            if (user.rank === "team_manager") {
                return teamController.getViewTeam(req, res);
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
                players,
                teams,
                season,
                matches
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

    // Team Management
    postAddTeam: async (req, res) => {
        try {
            const { name: team, manager: tm, email, league, password, badge } = req.body;
            await Team.store(team, league, tm, email, password, badge);
            res.redirect('/admin');
        } catch (err) {
            console.error(err);
            res.redirect('/admin');
        }
    },

    // Player Request Handling
    postHandleRequests: async (req, res) => {
        try {
            const { serial, action } = req.body;
            const status = action === 'Approve' ? 'Reg' : 'Declined';
            await Player.update({ serial }, { status });
            res.redirect("/admin/");
        } catch (err) {
            console.error(err);
            res.redirect("/admin/");
        }
    },

    // Season Management
    postNewSeason: async (req, res) => {
        try {
            const { season, league } = req.body;
            await Season.store(season, league);
            res.redirect("/admin");
        } catch (err) {
            console.error(err);
            res.redirect("/admin");
        }
    },

    // Match Management
    postSetMatch: async (req, res) => {
        try {
            const { match: matchId, matchTime: time } = req.body;
            if (!matchId) return res.redirect("/admin");

            const season = await Season.query({ status: "Ongoing" });
            const matchData = season.matches[matchId];
            
            const setMatch = {
                home: matchData.home,
                away: matchData.away,
                id: matchData.id,
                time: time
            };

            await knex.transaction(async trx => {
                season.matches[matchId] = setMatch;
                await Season.update(season.id, { matches: season.matches }, trx);
                await Match.store(
                    setMatch.id,
                    setMatch.home,
                    setMatch.away,
                    setMatch.time,
                    season.name,
                    trx
                );
            });

            res.redirect("back");
        } catch (err) {
            console.error(err);
            res.redirect("/admin");
        }
    },

    // Match Preparation
    getPreMatch: async (req, res) => {
        try {
            const matchNo = req.params.matchNo;
            const season = await Season.query({ status: "Ongoing" });
            const match = await Match.query({ number: matchNo, season: season.name });
            const [hTeam, aTeam] = await Promise.all([
                Team.query({ name: match.home }),
                Team.query({ name: match.away })
            ]);

            res.render('admin/preMatch', {
                match,
                season,
                hTeam,
                aTeam
            });
        } catch (err) {
            console.error(err);
            res.redirect('/admin');
        }
    },

    // Match Handling
    getMatch: async (req, res) => {
        try {
            const matchNo = req.params.matchNo;
            const season = await Season.query({ status: "Ongoing" });
            const match = await Match.query({ number: matchNo, season: season.name });
            
            if (match.score || match.hSquad.length < 11 || match.aSquad.length < 11) {
                return res.redirect('/admin');
            }

            const [hTeam, aTeam] = await Promise.all([
                Team.query({ name: match.home }),
                Team.query({ name: match.away })
            ]);

            res.render('admin/match', {
                match,
                season,
                hTeam,
                aTeam
            });
        } catch (err) {
            console.error(err);
            res.redirect('/admin');
        }
    },

    // Match Results
    getMatchRes: async (req, res) => {
        try {
            const matchNo = req.params.matchNo;
            const season = await Season.query({ status: "Ongoing" });
            const match = await Match.query({ number: matchNo, season: season.name });
            
            if (!match.score) {
                return res.redirect('/admin');
            }

            const [hTeam, aTeam] = await Promise.all([
                Team.query({ name: match.home }),
                Team.query({ name: match.away })
            ]);

            const hShots = match.shots.filter(x => x.team === match.home);
            const aShots = match.shots.filter(x => x.team === match.away);
            const hGoals = match.goals.filter(x => x.team === match.home);
            const aGoals = match.goals.filter(x => x.team === match.away);

            res.render('admin/matchRes', {
                match,
                season,
                hTeam,
                aTeam,
                aShots,
                aGoals,
                hShots,
                hGoals
            });
        } catch (err) {
            console.error(err);
            res.redirect('/admin');
        }
    },

    // Match Processing
    postMatch: async (req, res) => {
        try {
            const matchNo = req.params.matchNo;
            const { goals, fouls, shots } = req.body;
            const parsedGoals = JSON.parse(goals);
            const parsedFouls = JSON.parse(fouls);
            const parsedShots = JSON.parse(shots);

            const season = await Season.query({ status: 'Ongoing' });
            const match = await Match.query({ number: matchNo, season: season.name });
            const score = { home: 0, away: 0 };

            await knex.transaction(async trx => {
                // Process shots
                for (const shot of parsedShots) {
                    const { player, team } = shot;
                    shot.season = season.name;
                    shot.match = matchNo;

                    // Update player shots
                    await Player.update(
                        { serial: player },
                        { shots: knex.raw('JSON_ARRAY_APPEND(shots, "$", ?)', [shot]) },
                        trx
                    );

                    // Update team shots
                    await Team.update(
                        { name: team },
                        { shots: knex.raw('JSON_ARRAY_APPEND(shots, "$", ?)', [shot]) },
                        trx
                    );

                    // Update season shots
                    const seasonShot = { ...shot };
                    delete seasonShot.season;
                    await Season.update(
                        { id: season.id },
                        { shots: knex.raw('JSON_ARRAY_APPEND(shots, "$", ?)', [seasonShot]) },
                        trx
                    );
                }

                // Process goals
                for (const goal of parsedGoals) {
                    goal.season = season.name;
                    goal.match = matchNo;
                    const { team } = goal;
                    team === match.home ? score.home++ : score.away++;

                    // Update player goals
                    await Player.update(
                        { serial: goal.player },
                        { goals: knex.raw('JSON_ARRAY_APPEND(goals, "$", ?)', [goal]) },
                        trx
                    );

                    // Update team goals
                    await Team.update(
                        { name: team },
                        { goals: knex.raw('JSON_ARRAY_APPEND(goals, "$", ?)', [goal]) },
                        trx
                    );

                    // Update season goals
                    const seasonGoal = { ...goal };
                    delete seasonGoal.season;
                    await Season.update(
                        { id: season.id },
                        { goals: knex.raw('JSON_ARRAY_APPEND(goals, "$", ?)', [seasonGoal]) },
                        trx
                    );
                }

                // Process fouls
                for (const foul of parsedFouls) {
                    foul.match = matchNo;
                    foul.season = season.name;
                    const { player, team } = foul;

                    // Update player fouls
                    await Player.update(
                        { serial: player },
                        { fouls: knex.raw('JSON_ARRAY_APPEND(fouls, "$", ?)', [foul]) },
                        trx
                    );

                    // Update team fouls
                    await Team.update(
                        { name: team },
                        { fouls: knex.raw('JSON_ARRAY_APPEND(fouls, "$", ?)', [foul]) },
                        trx
                    );
                }

                // Update match record
                await Match.update(
                    match.id,
                    {
                        goals: parsedGoals,
                        shots: parsedShots,
                        fouls: parsedFouls,
                        score
                    },
                    trx
                );

                // Update standings
                const standings = [...season.standings];
                const hIndex = standings.findIndex(x => x.team === match.home);
                const aIndex = standings.findIndex(x => x.team === match.away);
                
                if (hIndex !== -1 && aIndex !== -1) {
                    const h = standings[hIndex];
                    const a = standings[aIndex];
                    
                    h.gf += score.home;
                    h.ga += score.away;
                    a.gf += score.away;
                    a.ga += score.home;
                    
                    if (score.home === score.away) {
                        h.d += 1;
                        a.d += 1;
                    } else if (score.home > score.away) {
                        h.w += 1;
                        a.l += 1;
                    } else {
                        h.l += 1;
                        a.w += 1;
                    }
                    
                    standings[hIndex] = h;
                    standings[aIndex] = a;
                    
                    await Season.update(
                        { id: season.id },
                        { standings },
                        trx
                    );
                }
            });

            res.redirect("/admin");
        } catch (err) {
            console.error(err);
            res.redirect("/admin");
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
