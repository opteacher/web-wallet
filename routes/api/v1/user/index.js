const _ = require("lodash");
const router = require("koa-router")();
const axios = require("axios");

const cfg = require("../../../../config/mdl.json");
const db = require(`../../../../databases/${cfg.type}`);
const walletCfg = require("../../../../config/wallet");
const { DepositAddress, Asset, WithdrawAddress } = require("../../../../models/index");

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
        let collectEmptyAsset = ctx.request.query.empty || true;
        collectEmptyAsset = !(!collectEmptyAsset
            || collectEmptyAsset.toLocaleLowerCase() === "false"
            || collectEmptyAsset === "0");

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

module.exports = router;