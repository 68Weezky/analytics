const User= require("../models/user");
const League = require("../models/league");
const Team = require("../models/team");
const Player = require("../models/player");
const Season = require("../models/season");
const Match = require("../models/match");

module.exports.getStandings=async(req,res,next)=>{
    let season=await Season.model.findOne({status:'Ongoing'})
    let teams=await Team.model.find({})
    let rank=[]
    if (season) {
    for(x of season.standings){
        x.points=x.w*3+x.d
        rank.push(x)
    }
    }
    rank.sort((a, b) =>{
        if(b.points===a.points){
            return (b.gf-b.ga)-(a.gf-a.ga)
        }
        return b.points - a.points
        });

    res.render('user/index',
    {
        season:season,
        teams:teams,
        rank:rank,
        title:"standings"
    }
    )
}

module.exports.getTeams=async(req,res,next)=>{
    let season=await Season.model.findOne({status:'Ongoing'})
    let teams=await Team.model.find({})
    res.render('user/teams',
    {
        season:season,
        teams:teams,
        title:"standings"
    }
    )
}

module.exports.getMatches=async(req,res,next)=>{
    let season=await Season.model.findOne({status:'Ongoing'})
    let teams=await Team.model.find({})
    let matches=await Match.model.find({season:season.name})
    res.render('user/matches',
    {
        season:season,
        teams:teams,
        matches:matches,
        title:"Matches"
    }
    )
}

module.exports.getStats=async(req,res,next)=>{
    let season=await Season.model.findOne({status:'Ongoing'})
    let teams=await Team.model.find({})
    let matches=await Match.model.find({season:season.name})
    let players=await Player.model.find({status:"Reg"})
    let goalRank=[];
    for(x of players){
        goalRank.push({name:x.name, serial:x.serial, team:x.team, goals:x.goals.length})
    }
    goalRank.sort((a, b) => b.goals - a.goals);
    res.render('user/stats',
    {
        season:season,
        teams:teams,
        matches:matches,
        title:"Stats",
        goalRank:goalRank
    }
    )
}

module.exports.getViewTeam=async(req,res,next)=>{
    let name = req.params.name;
    let team =await Team.model.findOne({name:name})
    let teams =await Team.model.find({})
    let players =await Player.model.find({team:name})
    let matches =await Match.model.find({$or:[{home:name},{away:name}]})
    let season =await Season.model.findOne({status:"Ongoing"})
    const shotsArray = Object.values(team.shots);
    res.render('user/viewTeam',
    {
        matches:matches,
        players:players,
        team:team,
        teams:teams,
        season:season,
        title:"teams"
    })
}
