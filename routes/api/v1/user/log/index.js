const router = require("koa-router")();
const axios = require("axios");

const cfg = require("../../../../../config/mdl.json");
const walletCfg = require("../../../../../config/wallet");
const db = require(`../../../../../databases/${cfg.type}`);
const { User, DepositAddress, Asset } = require("../../../../../models/index");

router.post("/up", async ctx => {
    try {
        let userResp = await db.save(User, ctx.request.body, null, null);
        let assets = await db.select(Asset, { deposit: true }, { selCols: ["symbol"] });
        let reqAry = [];
        for(let asset of assets) {
            let url = `${walletCfg.host}:${walletCfg.port}/api/deposit/${asset.symbol}/address`;
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
                belong_user: userResp.id,
                asset: asset.symbol,
                balance: 0
            }, null, null));
        }
        await Promise.all(reqAry);

        ctx.body = {
            data: userResp
        };
    } catch (e) {
        ctx.body = {
            error: e.message ? e.message : JSON.stringify(e)
        };
    }
});

module.exports = router;