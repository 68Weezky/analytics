const { default: mongoose, Schema } = require("mongoose");
const Team = require("./team");
const League = require("./league");

module.exports = class Season{
    static schema = new mongoose.Schema({
        name:String,
        league:String,
        matches:Array,
        status:String,
        goals:Array,
        shots:Array,
        standings:Array
    })

    static model = mongoose.model("season",this.schema);

    static store = (name,league) =>{
        Season.model.findOne({status:"Ongoing"}).then(result=>{
            if(result!==null){
                result.status="Closed";
                result.save();
            }
            
        })
        Season.model.find({name:name}).then(result=>{
            if(result.length>0){
                return;
            }else{
                const newSeason = new Season.model();
                newSeason.name = name;
                newSeason.status = "Ongoing"
                newSeason.league = league;
                newSeason.matches = [];
                newSeason.standings=[];
                newSeason.save();

               
                Team.model.find({league:league}).then(teams=>{
                    let count = 0; 
                    let matches=[]
                    let standings=[]
                    for(let t of teams){ 
                        let s={team:t.name,w:0,d:0,l:0,gf:0,ga:0}
                        standings.push(s);
                        for(let x of teams){
                            if(t!==x){                         
                             
                                matches = [...matches,{id:count,home:x.name,away:t.name,time:null}];
                                count+=1;
                            }
                        }
                    }  
                    Season.model.findOne({name:name}).then(result=>{
                        result.matches=[...result.matches,...matches];
                        result.standings=standings;
                        result.save();
                    })

             
                })
                
                League.model.findOne({name:league}).then(result=>{
                    result.currentSeason= name;
                    result.save();
                })
            
                
        
            }
        })
       
    }
}