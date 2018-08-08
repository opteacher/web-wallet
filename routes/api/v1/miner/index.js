const _ = require("lodash");
const router = require("koa-router")();
const axios = require("axios");

const assetsSvc = require("../../../../services/assets");
const walletCfg = require("../../../../config/wallet");
const cfg = require("../../../../config/mdl.json");
const db = require(`../../../../databases/${cfg.type}`);
const { WithdrawAddress } = require("../../../../models/index");

router.get("/:asset", async ctx => {
    try {
        let url = `${walletCfg.host}${
            walletCfg.port === 0 ? "" : `:${walletCfg.port}`
        }/api/test/${ctx.params.asset}/mining`;
        let result = await axios.get(url);
        if(result.status !== 200) {
            throw new Error(result.statusText);
        }
        ctx.body = {
            data: result.data.data
        };
    } catch (e) {
        ctx.body = {
            error: e.message ? e.message : JSON.stringify(e)
        };
    }
});

/***
 * enable:
 * speed[option]:
 */
router.put("/:asset", async ctx => {
    try {
        let url = `${walletCfg.host}${
            walletCfg.port === 0 ? "" : `:${walletCfg.port}`
        }/api/test/${ctx.params.asset}/mining`;
        let result = await axios.put(url, ctx.request.body);
        if(result.status !== 200) {
            throw new Error(result.statusText);
        }
        result = result.data;
        if(result.code !== 200) {
            ctx.body = result;
            return;
        }
        ctx.body = {
            data: result.data
        };
    } catch (e) {
        ctx.body = {
            error: e.message ? e.message : JSON.stringify(e)
        };
    }
});

module.exports = router;