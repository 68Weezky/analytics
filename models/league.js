const { default: mongoose } = require("mongoose");
const User = require("./user");

module.exports = class League {
    static schema = new mongoose.Schema({
        name: { type: String },
        admin: String,
        playerCount: Number,
        currentSeason: String
    }, { strict: false });

    static model = mongoose.model("league", this.schema);

    static query = (query, cb) => {
        League.model.find(query)
            .then(results => cb(results))
            .catch(err => {
                console.error("Query Error:", err);
                cb(null, err);
            });
    };

    static async store(name, adm, email, pass) {
        try {
            const exists = await League.model.exists({ name });
            
            if (exists) {
                console.log(`${name} league already exists`);
                return { success: false, message: "League already exists" };
            }

            const newLeague = new League.model({
                name,
                admin: email,
                playerCount: 0,
            });

            await User.store(adm, email, name, "admin", pass);
            await newLeague.save();
            
            console.log("League created successfully");
            return { success: true, league: newLeague };
        } catch (error) {
            console.error("Storage Error:", error);
            return { success: false, error: error.message };
        }
    }
<<<<<<< HEAD
}
=======
};
>>>>>>> 8e0b50c (2nd commit)
