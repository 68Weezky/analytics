const { default: mongoose } = require("mongoose");
const User = require("./user");
module.exports = class League{

    static schema = new mongoose.Schema({
        name:{type:String},
        admin:String,
        playerCount:Number,
        currentSeason:String
    },
    {strict:false})

    static model = mongoose.model("league",this.schema);
    
    static query=(query,cb)=>{
        League.model.find(query).then(result=>{
            cb(result[0]);
        }).catch(err=>{
            console.log(err);
        })
    }


    static store= (name,adm,email,pass)=>{
        const newLeague = new League.model();
        newLeague.name = name;
        newLeague.admin = email;
        newLeague.playercount = 0;
        League.model.find({name:`${name}`}).then(
            (data)=>{ 
                if(data.length===0){
                    User.store(adm,email,name,"admin",pass);
                    newLeague.save();
                    console.log("Saved Successfully")
                }else{
                    console.log(data+ " is in database")
                }  
            }
        ).catch(err=>console.log(err))

    }
}
