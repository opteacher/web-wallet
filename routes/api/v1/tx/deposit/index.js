const _ = require("lodash");
const router = require("koa-router")();
const axios = require("axios");
const moment = require("moment");

const walletCfg = require("../../../../../config/wallet");

router.get("/", async ctx => {
    try {
        let query = ctx.request.query;
        let url = `${walletCfg.host}:${walletCfg.port}/api/deposit/${query.asset}`;
        delete query.asset;
        let result = await axios.get(url, { params: query });
        if(result.status !== 200) {
            throw new Error(result.statusText);
        }
        result = result.data;
        if(result.code !== 200) {
            ctx.body = result;
            return;
        }
        result.data = result.data || [];

        ctx.body = {
            data: result.data.map(deposit => {
                deposit.create_time = moment(deposit.create_time).format("YYYY-MM-DD, hh:mm:ss a");
                return deposit;
            })
        };
    } catch (e) {
        ctx.body = {
            error: e.message ? e.message : JSON.stringify(e)
        };
    }
});

router.post("/test", async ctx => {
    try {
        let body = ctx.request.body;
        let url = `${walletCfg.host}:${walletCfg.port}/api/common/${body.asset}/transfer`;
        body.from = walletCfg.account;
        let result = await axios.post(url, body);
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