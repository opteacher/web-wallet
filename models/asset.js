const cfg = require("../config/mdl.json");
const db = require(`../databases/${cfg.type}`);

module.exports = db.defineModel({
	__modelName:    "asset",
	name:           db.Types.String,
	symbol:         db.Types.String,
	withdraw:       db.Types.Boolean,
	deposit:        db.Types.Boolean,
	deprecated:		db.Types.Boolean
}, null);