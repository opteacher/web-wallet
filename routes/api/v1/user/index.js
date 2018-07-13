const _ = require("lodash");
const router = require("koa-router")();
const axios = require("axios");
const moment = require("moment");

const cfg = require("../../../../config/mdl.json");
const db = require(`../../../../databases/${cfg.type}`);
const walletCfg = require("../../../../config/wallet");
const { DepositAddress, Asset, WithdrawAddress, AssetChange } = require("../../../../models/index");

router.get("/:uid/deposit/addresses", async ctx => {
    try {
        ctx.body = {
            data: await db.select(DepositAddress, {
                belong_user: ctx.params.uid
            }, {
                selCols: ["asset", "address"]
            })
        };
    } catch (e) {
        ctx.body = {
            error: e.message ? e.message : JSON.stringify(e)
        };
    }
});

router.get("/:uid/withdraw/addresses", async ctx => {
    try {
        let conds = {
            belong_user: ctx.params.uid
        };
        if(ctx.request.query.asset) {
            conds.asset = ctx.request.query.asset;
        }
        ctx.body = {
            data: await db.select(WithdrawAddress, conds, {
                selCols: ["asset", "address", "desc"]
            })
        };
    } catch (e) {
        ctx.body = {
            error: e.message ? e.message : JSON.stringify(e)
        };
    }
});

router.get("/:uid/assets", async ctx => {
    try {
        let collectEmptyAsset = true;
        if(ctx.request.query.empty) {
	        collectEmptyAsset = !(!ctx.request.query.empty
		        || ctx.request.query.empty.toLowerCase() === "false"
		        || ctx.request.query.empty === "0");
        }

        let conds = {
            belong_user: ctx.params.uid
        };
        if(!collectEmptyAsset) {
            conds.available = [">", 0];
        }
        let result = await db.select(DepositAddress, conds, {
            selCols: ["asset", "available", "frozen"]
        }).map(item => {
            item = item.toJSON();
            item.available = parseFloat(item.available);
            item.frozen = parseFloat(item.frozen);
            return item;
        });
        let assets = await db.select(Asset, { deprecated: false }, null);
        for(let asset of assets) {
            let tmp = _.find(result, item => item.asset === asset.symbol);
            if(tmp) {
                tmp.withdraw = asset.withdraw;
                tmp.deposit = asset.deposit;
            } else if(collectEmptyAsset) {
                result.push({
                    asset: asset.symbol,
                    available: 0,
                    frozen: 0,
                    withdraw: asset.withdraw,
                    deposit: asset.deposit
                });
            }
        }
        ctx.body = {
            data: result
        };
    } catch (e) {
        ctx.body = {
            error: e.message ? e.message : JSON.stringify(e)
        };
    }
});

router.post("/:uid/assets/:asset/address", async ctx => {
    try {
        // 生成地址
        let asset = ctx.params.asset;
        let url = `${walletCfg.host}:${walletCfg.port}/api/deposit/${asset}/address`;
        let addrResp = await axios.get(url);
        if(addrResp.status !== 200) {
            throw new Error(addrResp.statusText);
        }
        addrResp = addrResp.data;
        if(addrResp.code !== 200) {
            ctx.body = addrResp;
            return;
        }

        // 绑定到用户提币地址表
        ctx.body = {
            data: await db.save(WithdrawAddress, {
                address: addrResp.data,
                belong_user: ctx.params.uid,
                asset: asset,
                desc: ctx.request.query.desc || ""
            }, null, null)
        };
    } catch (e) {
        ctx.body = {
            error: e.message ? e.message : JSON.stringify(e)
        };
    }
});

router.get("/:uid/assets/history", async ctx => {
    try {
        let result = await db.select(AssetChange, { belong_user: ctx.params.uid });
        ctx.body = {
            data: result.map(record => {
                record = record.toJSON();
                record.amount *= record.direction ? 1 : -1;
                record.rel_id = `${record.type}_${record.rel_id}`;
                record.createdAt = moment(record.createdAt).format("YYYY-MM-DD, hh:mm:ss a");
                return record;
            })
        };
    } catch (e) {
        ctx.body = {
            error: e.message ? e.message : JSON.stringify(e)
        };
    }
});

module.exports = router;