const { default: mongoose } = require("mongoose");
const League = require("./league");
const Team = require("./team");
module.exports = class Player{
    
    static schema = mongoose.Schema({
        serial:String,
        name:String,
        dob:Date,
        kit:Number,
        team:String,
        email:String,
        status:String,
        fouls:Array,
        goals:Array,
        shots:Array
        },
        {strict:false}
    );

    static model = mongoose.model("player",this.schema);

    static store=(name,dob,kit,team,league,status,success)=>{
        const newPlayer = new Player.model();
        newPlayer.name=name;
        newPlayer.dob=dob;
        newPlayer.kit=kit;
        newPlayer.team=team;
        newPlayer.status=status
        
        Player.query(({name:name,dob:dob}||{kit:kit,team:team}),result=>{
            if(!result){
                var serial;
                newPlayer.save().catch(err=>{
                    console.log(err);
                })
                
                League.model.findOne({name:league}).then(
                    (data)=>{
            
                        serial=team.substring(0,3)+data.playerCount;
                        
                        newPlayer.serial=serial;
                        newPlayer.save()
                        data.playerCount+=1;
                        data.save();
                       
                    }
                ).catch(err=>console.log(err))
               
                success(true);
            }else{
                success(false);
            }
        })
       
    }
    
    static rm=(serial)=>{
        Player.model.findOneAndDelete({serial:serial}).then(doc=>{
            console.log(doc+"REMOVED")
        }

        )
    }
    static query=(query,cb)=>{
        Player.model.find(query).then(result=>{
            cb(result[0]);
        }).catch(err=>{
            console.log(err);
        })
    }
}
