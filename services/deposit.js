const mdlCfg = require("../config/mdl");
const db = require(`../databases/${mdlCfg.type}`);
const { DepositAddress, Asset } = require("../models/index");
const walletCfg = require("../config/wallet");
const axios = require("axios");

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
    },
    async generateAllAssetsFor(uid) {
        let assets = await db.select(Asset, { deposit: true }, {
            selCols: ["symbol"]
        });
        let reqAry = [];
        for(let asset of assets) {
            let url = `${walletCfg.host}${
                walletCfg.port === 0 ? "" : `:${walletCfg.port}`
            }/api/deposit/${asset.symbol}/address`;
            let addrResp = await axios.get(url);
            if(addrResp.status !== 200) {
                throw new Error(addrResp.statusText);
            }
            addrResp = addrResp.data;
            if(addrResp.code !== 200) {
                ctx.body = addrResp;
                return;
            }
            reqAry.push(db.save(DepositAddress, {
                address: addrResp.data,
                belong_user: uid,
                asset: asset.symbol,
                available: 0,
                frozen: 0
            }, null, null));
        }
        await Promise.all(reqAry);
    }
};