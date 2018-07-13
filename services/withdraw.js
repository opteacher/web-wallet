const mdlCfg = require("../config/mdl");
const db = require(`../databases/${mdlCfg.type}`);
const { WithdrawRecord } = require("../models/index");

module.exports = {
    findRecord(conditions) {
        return db.select(WithdrawRecord, conditions).then(result => {
            return Promise.resolve(result.map(record => record.toJSON()));
        });
    }
};