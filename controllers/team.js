// Importing required models
const Player = require("../models/player"); // Player model
const Team = require("../models/team"); // Team model
const Season = require("../models/season"); // Season model
const Match = require("../models/match"); // Match model

// Function to render the team view page
module.exports.getViewTeam = async (req, res, next) => {
    try {
        // Declare variables to store data
        let players, team, teams, matches, season;

        // Get the team of the logged-in user from the session
        const reqTeam = req.session.user.team;

        // Fetch players belonging to the user's team
        players = await Player.model.find({ team: req.session.user.team });

        // Fetch the team details based on the team name
        team = await Team.model.findOne({ name: reqTeam });

        // Fetch all teams in the "Masters" league
        teams = await Team.model.find({ league: "Masters" });

        // Fetch the ongoing season
        season = await Season.model.findOne({ status: "Ongoing" });

        // Fetch matches involving the user's team in the ongoing season
        matches = await Match.model.find({
            $and: [
                {
                    $or: [
                        { home: reqTeam }, // Matches where the team is home
                        { away: reqTeam }, // Matches where the team is away
                    ],
                },
                { season: season.name }, // Matches in the ongoing season
            ],
        });

        // Render the 'admin/viewTeam' view with the fetched data
        res.render("admin/viewTeam", {
            title: "Team page", // Page title
            user: req.session.user, // User data from session
            path: "/index", // Path for navigation
            players: players, // List of players
            team: team, // Team details
            teams: teams, // List of teams
            matches: matches, // List of matches
            message: "", // Empty message placeholder
        });
    } catch (error) {
        // Handle errors if any
        console.log(error);
    }
};

// Function to add a new player
module.exports.postAddPlayer = (req, res, next) => {
    // Extract player details from the request body
    const name = req.body.name;
    const dob = new Date(req.body.dob);
    const team = req.body.team;
    const kit = req.body.kit;
    const league = req.body.league;
    const status = "Pending"; // Default status for new players

    // Store the new player in the database
    Player.store(name, dob, kit, team, league, status, (success) => {
        if (success === true) {
            // Redirect to the admin page if successful
            res.redirect("/admin/");
        } else {
            // Render the admin page with an error message if unsuccessful
            res.render("admin/", {
                title: "Team page",
                user: req.session.user,
                path: "/index",
                players: players,
                message: "INVALID DETAILS",
            });
        }
    });
};

// Function to render the player view page
module.exports.getViewPlayer = (req, res, next) => {
    // Extract the player serial number from the request parameters
    const serial = req.params.playerSerial;

    // Query the player details using the serial number
    Player.query({ serial: serial }, (player) => {
        if (player) {
            // Render the 'admin/viewPlayer' view with the player details
            res.render("admin/viewPlayer", {
                title: "Player", // Page title
                user: req.session.user, // User data from session
                path: "/index", // Path for navigation
                player: player, // Player details
            });
        } else {
            // Redirect to the admin page if the player is not found
            res.redirect("/admin/");
        }
    });
};

// Function to delete a player
module.exports.getDelPlayer = (req, res, next) => {
    // Remove the player using the serial number from the request parameters
    Player.rm(req.params.playerSerial);

    // Redirect to the admin page after deletion
    res.redirect("/admin/");
};

// Function to render the squad page
module.exports.getSquad = async (req, res, next) => {
    try {
        // Declare variables to store data
        let players, match, teamName, matchNo, team, season;

        // Extract team name and match number from the request parameters
        teamName = req.params.matchTeam;
        matchNo = req.params.matchNo;

        // Fetch the ongoing season
        season = await Season.model.findOne({ status: "Ongoing" });

        // Fetch the team details based on the team name
        team = await Team.model.findOne({ name: teamName });

        // Fetch registered players for the team
        players = await Player.model.find({ team: teamName, status: "Reg" });

        // Fetch the match details based on the match number and season
        match = await Match.model.findOne({
            $and: [{ number: matchNo }, { season: season.name }],
        });

        // Render the 'admin/squad' view with the fetched data
        res.render("admin/squad", {
            players: players, // List of players
            team: team, // Team details
            match: match, // Match details
        });
    } catch (error) {
        // Handle errors if any
        console.log(error);
    }
};

// Function to update the squad for a match
module.exports.postSquad = async (req, res, next) => {
    try {
        // Declare variables to store data
        let matchNo, match, squad, selected, season;

        // Extract selected players and match number from the request body
        selected = req.body.selected;
        matchNo = req.body.matchNo;

        // Fetch the ongoing season
        season = await Season.model.findOne({ status: "Ongoing" });

        // Fetch the match details based on the match number and season
        match = await Match.model.findOne({
            $and: [{ number: matchNo }, { season: season.name }],
        });

        // Determine which squad (home or away) to update
        if (req.body.ground == "Home") {
            squad = match.hSquad; // Home squad
        } else if (req.body.ground == "Away") {
            squad = match.aSquad; // Away squad
        }

        // Add selected players to the squad if the squad has less than 11 players
        if (typeof selected == "string" && squad.length < 11) {
            let obj = JSON.parse(selected); // Parse the selected player details
            const res = squad.some(
                (x) => x.name === obj.name && x.serial === obj.serial
            ); // Check if the player is already in the squad
            if (!res) {
                squad.push(obj); // Add the player to the squad if not already present
            }
        } else {
            // Handle multiple selected players
            for (let i = 0; i < selected.length; i++) {
                if (squad.length < 11) {
                    let obj = JSON.parse(selected[i]); // Parse each selected player
                    const res = squad.some(
                        (x) => x.name === obj.name && x.serial === obj.serial
                    ); // Check if the player is already in the squad
                    if (res) {
                        continue; // Skip if the player is already in the squad
                    } else {
                        squad.push(obj); // Add the player to the squad
                    }
                }
            }
        }

        // Save the updated match details
        match.save();

        // Redirect back to the previous page
        res.redirect(req.headers.referer);
    } catch (error) {
        // Handle errors if any
        console.log(error);
    }
};
