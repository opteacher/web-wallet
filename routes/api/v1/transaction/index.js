const _ = require("lodash");
const router = require("koa-router")();
const axios = require("axios");

const walletCfg = require("../../../../config/wallet");

router.post("/withdraw", async ctx => {
    try {
        // @_@：生成提币id
        let body = ctx.request.body;
        body.id = parseInt(Math.random() * 200000);
        body.value = parseFloat(body.value);

        let url = `${walletCfg.host}:${walletCfg.port}/api/withdraw/${body.asset}`;
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