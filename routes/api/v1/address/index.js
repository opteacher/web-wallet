const _ = require("lodash");
const router = require("koa-router")();
const axios = require("axios");

const assetsSvc = require("../../../../services/assets");

router.put("/:address", async ctx => {
    try {
        let result = {};
        let resp = {};
        let asset = ctx.request.body.asset;
        let address = ctx.params.address;
        if(ctx.request.body.available) {
            result = await assetsSvc.changeAvailable(asset, address, ctx.request.body.available);
            resp.available = result[0].available;
        }
        if(ctx.request.body.frozen) {
            result = await assetsSvc.changeFrozen(asset, address, ctx.request.body.frozen);
            resp.frozen = result[0].frozen;
        }
        ctx.body = {
            data: resp
        };
    } catch (e) {
        ctx.body = {
            error: e.message ? e.message : JSON.stringify(e)
        };
    }
});

module.exports = router;