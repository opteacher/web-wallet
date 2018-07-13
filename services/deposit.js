const mdlCfg = require("../config/mdl");
const db = require(`../databases/${mdlCfg.type}`);
const { DepositAddress } = require("../models/index");

module.exports = {
    findAddressByUser(uid, asset) {
        let conds = { belong_user: uid };
        if(asset) { conds.asset = asset; }
        let optns = { selCols: ["address"] };
        return db.select(DepositAddress, conds, optns).then(result => {
            return Promise.resolve(result.map(record => record.toJSON().address));
        });
    },
    findUserByAddress(address, asset) {
        let conds = { address, asset };
        let optns = { selCols: ["belong_user"] };
        return db.select(DepositAddress, conds, optns).then(result => {
            if(result.length === 0) {
                return Promise.reject(`根据地址：${address}，未找到所属用户`);
            }
            return Promise.resolve(result[0].belong_user);
        });
    }
};