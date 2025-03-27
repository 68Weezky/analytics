const { default: mongoose, Schema } = require("mongoose");
const User = require("./user");
const League = require("./league");
module.exports = class Team{

    static schema = new mongoose.Schema({
        name:{type:String},
        league:String,
        manager:String,
        badge:String,
        fouls:Array,
        goals:Array,
        shots:Array
    })

    static model = mongoose.model("team",this.schema);
    

    static store = (name,league,manager,email,password,badge)=>{
        const newTeam = new Team.model();
        newTeam.name = name;
        newTeam.league = league;
        newTeam.manager = manager;
        newTeam.badge=badge;
        Team.model.find({name:`${this.name}`}).then(
            async(data)=>{ 
                if(data.length===0){
                    User.store(manager,email,league,"team_manager",password);
                    try {
                        await User.model.updateOne({email:email},{ $set:{team:name}});
                    } catch (error) {
                        console.log(error)
                    } 
                   
                    await newTeam.save();
        
                    console.log("Saved Successfully")
                }else{
                   console.log(data+ " is in database")
                }  
            }
        ).catch(err=>console.log(err))

    }

    static query=(query,cb)=>{
        Team.model.find(query).then(result=>{
            cb(result[0]);
        }).catch(err=>{
            console.log(err);
        })
    }
}