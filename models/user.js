const cfg = require("../config/mdl.json");
const db = require(`../databases/${cfg.type}`);
const crypto = require("crypto");

module.exports = db.defineModel({
	__modelName:    "user",
	username:       db.Types.String,
	password:       db.Types.String,
	email:          db.Types.String,
	phone:          db.Types.String,
	addresses:      []
}, {
	middle: {
		create: {
			before: function(doc) {
				let sha1 = crypto.createHash("sha1");
				sha1.update(doc.password);
				doc.password = sha1.digest("hex");
			}
		}
	},
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