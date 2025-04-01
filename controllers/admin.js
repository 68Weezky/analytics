const User= require("../models/user");
const League = require("../models/league");
const Team = require("../models/team");
const Player = require("../models/player");
const Season = require("../models/season");
const Match = require("../models/match");


const teamController = require("../controllers/team");
const { options } = require("../routes/admin");

module.exports.authenticate= (req, res, next) =>{
    if (req.session.user) next()
    else next('route')
  };

module.exports.getLogin=(req,res,next)=>{
    res.render('admin/sign-in',{message:" "});
};

module.exports.postLogin=(req,res,next)=>{
    const email = req.body.email.toLowerCase();
    const league = req.body.league;
    const password = req.body.password;

    User.query({email:email},user=>{
        if(!user){
            res.render('admin/sign-in',{message:"ERROR! TRY AGAIN"})
    
        }else if(user.password===password){
            // regenerate the session, which is good practice to help
            // guard against forms of session fixation
            req.session.regenerate((err)=>{
                if (err) next(err)
                // store user information in session, typically a user id
                req.session.user = user
                 // save the session before redirection to ensure page
                // load does not happen before session is saved
                req.session.save(err=>{
                    if (err) return next(err)
                    res.redirect(`/admin/`);
                })
            })   
              
        }else{
            res.render('admin/sign-in',{message:"ERROR! TRY AGAIN"})
        }
    })
};

module.exports.getRegister=(req,res,next)=>{
    res.render('admin/register');
};

module.exports.postRegister=(req,res,next)=>{
    const name = req.body.league;
    const admin = req.body.admin;
    const email = req.body.email.toLowerCase();
    const password = req.body.password;
    League.store(name,admin,email,password);
    res.redirect('/admin')
};

module.exports.getIndex=async(req,res,next)=>{
    try {
        let user,players,teams,season,matches;
        user=await User.model.findOne({_id:req.session.user._id});
        if(user.rank==="team_manager"){
            teamController.getViewTeam(req,res);
        }else{
            players=await  Player.model.find({});
            teams= await  Team.model.find({league:"Masters"});
            season= await Season.model.findOne({status:"Ongoing"});
            if (season) {
                matches= await Match.model.find({season:season.name});
            } else {
                matches = []
            }
            res.render('admin/index',
                {
                    title:"Index",
                    user:req.session.user,
                    message:"",
                    path:"/index",
                    players:players,
                    teams:teams,
                    season:season,
                    matches:matches
                }
            );

        }
    } catch (error) {
        console.log(error);
    }
};


module.exports.getAddUser=(req,res,next)=>{
    var message = "";
    if(req.query.exist){
        message="User already exists!"
    }
    res.render('admin/addUser',
        {
            title:"Add User",
             user:req.session.user,
             path:'/addUser',
             message:message
        }
    );
}
module.exports.postAddUser=(req,res,next)=>{
    const name= req.body.name;
    const email= req.body.email.toLowerCase();
    const league= req.body.league;
    const rank= req.body.rank;
    const password= req.body.password;

    User.query({email:email},result=>{
        if(!result){
            User.store(name,email,league,rank,password);
            res.redirect('/admin')
        }else{
            res.redirect('/admin/addUser?exist=True')
        }
        
    })
}

module.exports.postAddTeam=(req,res,next)=>{
    const team= req.body.name;
    const tm= req.body.manager;
    const email= req.body.email;
    const league= req.body.league;
    const password= req.body.password;
    const badge= req.body.badge;

    Team.store(team,league,tm,email,password,badge);
    
    res.redirect('/admin')
}

module.exports.postHandleRequests=(req,res,next)=>{
        Player.model.findOne({serial:req.body.serial}).then(player=>{
            if (req.body.action == 'Approve') {
                player.status="Reg";
                player.save()
            }else if (req.body.action == 'Decline') {
                player.status="Declined"
                player.save()
            }
        })
        res.redirect("/admin/")

    }

module.exports.postNewSeason=(req,res,next)=>{
    const season = req.body.season;
    const league = req.body.league;
    Season.store(season,league);
    res.redirect("/admin");
}

module.exports.postSetMatch=(req,res,next)=>{
    const match=req.body.match;
    const time=req.body.matchTime;

    if (!match) {
        res.redirect("/admin");
        return;
    }
  
    Season.model.findOne({status:"Ongoing"}).then(result=>{
        let setMatch={
            home: result.matches[match].home,
            away: result.matches[match].away,
            id: result.matches[match].id,
            time: time
        };
        result.matches[match]=setMatch;
        Match.store(setMatch.id,setMatch.home,setMatch.away,setMatch.time,result.name);
        result.save();
    })
    res.redirect("back")
}

module.exports.getPreMatch=async(req,res,next)=>{
    let match,season,players,hTeam,aTeam;
    let matchNo=req.params.matchNo;
    season=await Season.model.findOne({status:"Ongoing"});
    match= await Match.model.findOne({$and:[{number:matchNo,season:season.name}]});
    hTeam=await Team.model.findOne({name:match.home});
    aTeam=await Team.model.findOne({name:match.away});
    
    res.render('admin/preMatch',
    {
        match:match,
        season:season,
        hTeam:hTeam,
        aTeam:aTeam
    }
    )
}

module.exports.getMatch=async(req,res,next)=>{
    let match,season,hTeam,aTeam;
    let matchNo=req.params.matchNo;
    season=await Season.model.findOne({status:"Ongoing"});
    match= await Match.model.findOne({$and:[{number:matchNo,season:season.name}]});
    hTeam=await Team.model.findOne({name:match.home});
    aTeam=await Team.model.findOne({name:match.away});
    if(typeof match.score != 'undefined'){
        return res.redirect('/admin')
    }
    if(match.hSquad.length<11||match.aSquad.length<11){
        return res.redirect('back')
    }
    res.render('admin/match',
    {
        match:match,
        season:season,
        hTeam:hTeam,
        aTeam:aTeam
    }
    )
}

module.exports.getMatchRes=async(req,res,next)=>{
  
    let match,season,hTeam,aTeam;
    let matchNo=req.params.matchNo;
    season=await Season.model.findOne({status:"Ongoing"});
    match= await Match.model.findOne({$and:[{number:matchNo,season:season.name}]});
    hTeam=await Team.model.findOne({name:match.home});
    aTeam=await Team.model.findOne({name:match.away});
    let hShots=[];let aShots=[];let hGoals=[];let aGoals=[];
    for(x of match.shots){
        if(x.team==match.home){
            hShots.push(x)
        }else{
            aShots.push(x)
        }
    }
    for(x of match.goals){
        if(x.team==match.home){
            hGoals.push(x)
        }else{
            aGoals.push(x)
        } 
    }
    if(typeof match.score == 'undefined'){
        return res.redirect('/admin')
    }
 
    res.render('admin/matchRes',
    {
        match:match,
        season:season,
        hTeam:hTeam,
        aTeam:aTeam,
        aShots:aShots,
        aGoals:aGoals,
        hShots:hShots,
        hGoals:hGoals
    }
    )
}

module.exports.postMatch=async(req,res,next)=>{
    let goals,fouls,shots,matchNo;
    matchNo=req.params.matchNo;
    goals=JSON.parse(req.body.goals);      
    fouls=JSON.parse(req.body.fouls);
    shots=JSON.parse(req.body.shots);
    let season =await Season.model.findOne({status:'Ongoing'});
    let match=await Match.model.findOne({number:matchNo,season:season.name});
    let score={home:0,away:0};
    for(let shot of shots){
        const {player,team}=shot
        shot.season=season.name;
        shot.match=matchNo;
        //STORE PLAYER SHOT
        let p=await Player.model.findOne({serial:player})
        if('shots' in p ){
            p.shots.push(shot)
        }else{
            p.shots=[shot]
        }
        try {
          await p.save();
        } catch (error) {
            console.error(error)
        }
        
        //STORE TEAM SHOT
        let t=await Team.model.findOne({name:team})
        if('shots' in t){
            t.shots.push(shot)
        }else{
            t.shots=[shot]
        }
        await t.save();

        // STORE SEASON SHOTS
        let s={...shot}
        delete s.season
        if('shots' in season){
            season.shots.push(s)
        }else{
            season.shots=[shot]
        }
        try {
          await season.save()
        } catch (error) {
            console.error(error);
        }
   

    }
    for(let goal of goals){
        goal.season=season;
        goal.match=matchNo;
        let {player,team}=goal;
        if(team==match.home){
            score.home+=1
        }else{
            score.away+=1
        }
        //STORE SEASON GOAL
        let g={...goal}
        delete g.season
        if('goals' in season){
            season.goals.push(g)
        }else{
            season.goals=[g]
        }
       await season.save()

        goal.season=season.name;
        //STORE PLAYER GOAL
        let p=await Player.model.findOne({serial:player})
        if('goals' in p){
            p.goals.push(goal)
        }else{
            p.goals=[goal]
        }
       await p.save();
        //STORE TEAM GOAL
        let t=await Team.model.findOne({name:team})
        if('goals' in t){
            t.goals.push(goal)
        }else{
            t.goals=[goal]
        }
       await t.save();
    }
    for(let foul of fouls){
        foul.match=matchNo
        let{player,team}=foul;
        foul.season=season.name;
        let p=await Player.model.findOne({serial:player})
        if('fouls' in p){
            p.fouls.push(foul)
        }else{
            p.fouls=[foul]
        }
       await p.save()

        let t=await Team.model.findOne({name:team})
        if('fouls' in t){
            t.fouls.push(foul)
        }else{
            t.fouls=[foul]
        }
        await t.save()
    }
    //STORE MATCH RESULTS
    match.goals=[...goals]
    match.shots=[...shots]
    match.fouls=[...fouls]
    match.score=score;
    match.save()

    //UPDATE STANDINGS
    let hIndex=season.standings.findIndex(x=>x.team==match.home)
    let aIndex=season.standings.findIndex(x=>x.team==match.away)
    let h=season.standings[hIndex];
    let a= season.standings[aIndex];
    h.gf+=score.home;
    h.ga+=score.away;
    a.gf+=score.away;
    a.ga+=score.home;
    if(score.home==score.away){
        h.d+=1;
        a.d+=1
    }else if(score.home>score.away){
        h.w+=1;
        a.l+=1
    }else{
       h.l+=1;    
       a.w+=1;
    }
    let val=season.standings;
    val.splice(hIndex,1,h)
    val.splice(aIndex,1,a)
    Season.model.updateOne(
        {_id:season.id},{standings:val}
    ).then(res=>console.log(res))
   
    res.redirect("/admin")
}

module.exports.getLogout=(req,res,next)=>{
    req.session.user = null
    req.session.save(err=>{
    if (err) next(err)
    // regenerate the session, which is good practice to help
    // guard against forms of session fixation
    req.session.regenerate(function (err) {
      if (err) next(err)
      res.redirect('/admin')
    })
  })
}
