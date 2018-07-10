const cfg = require("../config/mdl.json");
const db = require(`../databases/${cfg.type}`);

module.exports = db.defineModel({
    __modelName:    "withdraw_address",
    address:        db.Types.String,
    belong_user:    db.Types.Number,
    asset:          db.Types.String,
    desc:           db.Types.String
}, {
    router: {
        methods: [
            "GET",
            "ALL",
            "POST",
            "PUT",
            "DELETE"
        ]
    }
});