const router = require("koa-router")();

const cfg = require("../../../../config/mdl.json");
const db = require(`../../../../databases/${cfg.type}`);
const { User, DepositAddress } = require("../../../../models/index");

router.get("/:uid/addresses", async ctx => {
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

module.exports = router;