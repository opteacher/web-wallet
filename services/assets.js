const mdlCfg = require("../config/mdl");
const db = require(`../databases/${mdlCfg.type}`);
const { DepositAddress } = require("../models/index");

module.exports = {
    changeAvailable(asset, address, amount) {
        return this._changeWeight(asset, address, amount, "available");
    },
    changeFrozen(asset, address, amount) {
        return this._changeWeight(asset, address, amount, "frozen");
    },
    async _changeWeight(asset, address, amount, wgtName) {
        try {
            let weight = await db.select(DepositAddress, { asset, address }, { selCols: [wgtName] });
            if(!(weight instanceof Array)) {
                return Promise.reject(new Error("返回的类型有误，期待数组"));
            }
            weight = parseFloat(weight[0][wgtName]) + amount;
            return db.save(DepositAddress, { [wgtName]: weight }, { asset, address });
        } catch (e) {
            return Promise.reject(e);
        }
    },
    async updateWeight(asset, address, amount) {
        let weight = await db.select(DepositAddress, { asset, address }, {
            selCols: ["available", "frozen"]
        });
        if(!(weight instanceof Array)) {
            return Promise.reject(new Error("返回的类型有误，期待数组"));
        }
        weight = weight[0];
        return db.save(DepositAddress, {
            available: parseFloat(weight.available) + amount,
            frozen: parseFloat(weight.frozen) - amount
        }, { asset, address });
    }
};