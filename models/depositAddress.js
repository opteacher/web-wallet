const cfg = require("../config/mdl.json");
const db = require(`../databases/${cfg.type}`);

module.exports = db.defineModel({
	__modelName:    "deposit_address",
	address:        db.Types.String,
	belong_user:    db.Types.Number,
	inuse:          db.Types.Boolean,
	asset:          db.Types.String,
	balance:        db.Types.Decimal
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