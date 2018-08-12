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
                belong_user: userResp.id,
                asset: asset.symbol,
                available: 0,
                frozen: 0
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

router.post("/in", async ctx => {
    // 签发token
    ctx.body = {
        data: "abcd"
    };
});

router.get("/stat", async ctx => {
	// 从请求头中获取token并验证
    console.log(ctx.request.params);
    ctx.set("authorization", "0xabcd");
    ctx.body = {
        data: "1234"
    }
});

router.get("/refs", async ctx => {
	// 如果token过期，重新签发
    ctx.body = {
        data: "0xabcd"
    }
});

module.exports = router;