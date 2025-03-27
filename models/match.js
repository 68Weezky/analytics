const { default: mongoose, Schema } = require("mongoose");
const Team = require("./team");

module.exports=class Match{
   static schema= new mongoose.Schema({
        number:String,
        home:String,
        away:String,
        time:Date,
        season:String,
        hSquad:Array,
        aSquad:Array,
        fouls:Array,
        goals:Array,
        shots:Array,
        score:Object
        },
        {strict:false} 
   ) 

   static model = mongoose.model("match",this.schema);

   static store =(number,home,away,time,season)=>{
     const newMatch = new Match.model();
     newMatch.number=number;
     newMatch.home=home;
     newMatch.away=away;
     newMatch.time=time;
     newMatch.season=season;
     newMatch.hSquad=[];
     newMatch.aSquad=[];
     newMatch.save();
 
   }
}