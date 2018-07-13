const cfg = require("../config/mdl.json");
const db = require(`../databases/${cfg.type}`);

module.exports = db.defineModel({
    __modelName:    "asset_change",
    type:           db.Types.String,
    amount:         db.Types.Decimal,
    belong_user:    db.Types.Number,
    asset:          db.Types.String,
    direction:      db.Types.Boolean,
    rel_id:         db.Types.Number,
}, {
    router: {
        methods: [
            "GET",
            "ALL"
        ]
    }
});