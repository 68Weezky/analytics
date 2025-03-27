const { default: mongoose } = require("mongoose");
module.exports = class User{
    
    static schema = new mongoose.Schema({
        name:{type:String},
        email:String,
        league:String,
        rank:String,
        password:String},
        { strict: false }
    );

    static model = mongoose.model("user",this.schema);
    
    static store=(name,email,league,rank,password)=>{
        const newUser = new User.model();
        newUser.name = name;
        newUser.email = email;
        newUser.league = league;
        newUser.rank = rank;
        newUser.password = password;
        
        newUser.save().catch(err=>{
            console.log(err);
        })
    }
    static query=(query,cb)=>{
        User.model.find(query).then(result=>{
            cb(result[0]);
        }).catch(err=>{
            console.log(err);
        })
    }
}