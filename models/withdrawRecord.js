const cfg = require("../config/mdl.json");
const db = require(`../databases/${cfg.type}`);

module.exports = db.defineModel({
    __modelName:    "withdraw_record",
    sender_user:    db.Types.Number,
    target:         db.Types.String,
    asset:          db.Types.String,
    value:          db.Types.Decimal
}, {
    router: {
        methods: [
            "GET",
            "ALL"
        ]
    }
});