const _ = require("lodash");
const router = require("koa-router")();
const axios = require("axios");
const moment = require("moment");

const walletCfg = require("../../../../../config/wallet");
const cfg = require("../../../../../config/mdl.json");
const db = require(`../../../../../databases/${cfg.type}`);
const { WithdrawRecord } = require("../../../../../models/index");

router.post("/", async ctx => {
    try {
        let body = ctx.request.body;
        // 保存进数据库表withdrawRecord
        let record = await db.save(WithdrawRecord, {
            sender_user: ctx.cookies.get("uuid"),
            target: body.target,
            asset: body.asset,
            value: body.value
        });
        body.id = record.id;
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

router.get("/", async ctx => {
    try {
        let query = ctx.request.query;

        let records = await db.select(WithdrawRecord, query, { selCols: ["id", "asset"] });
        let result = [];
        for(let record of records) {
            result.push((
                await axios.get(`${walletCfg.host}:${walletCfg.port}/api/withdraw/${record.asset}`, {
                    params: { id: record.id }
                })
            ).data.data[0]);
        }
        ctx.body = {
            data: result.map(withdraw => {
                withdraw.create_time = moment(withdraw.create_time).format("YYYY-MM-DD, hh:mm:ss a");
                return withdraw;
            })
        };
    } catch (e) {
        ctx.body = {
            error: e.message ? e.message : JSON.stringify(e)
        };
    }
});

module.exports = router;