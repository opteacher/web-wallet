const _ = require("lodash");
const crypto = require("crypto");
const uuidv4 = require("uuid/v4");
const jwt = require("jsonwebtoken");
const ms = require("ms");
const router = require("koa-router")();

const cfg = require("../../../../../config/mdl.json");
const db = require(`../../../../../databases/${cfg.type}`);
const { User } = require("../../../../../models/index");
const depositSvc = require("../../../../../services/deposit");
const Const = require("../../../../../config/const");
const jwtCfg = require("../../../../../config/jwt");

// @block{api_v1_user_log_up}:用户注册
// @params{request_body}[object]:登录表单
//                  * *username*[```string```]：用户名
//                  * *password*[```string```]：密码
// @return{response_body}[object]:登录结果
//                  * *data*[```number```]：操作结果
//                  * *error*[```string```]：错误消息（跟data二选一）
router.post("/up", async ctx => {
    // @step{1}:收集请求参数
    let reqBody = ctx.request.body;
    // @step{2}:查询数据库，判断用户是否重复
    let result = await db.select(Users, {
        username: reqBody.username
    });
    if(result.length > 0) {
        ctx.throw(Const.USER_EXISTS, "failed", "用户名已经存在");
    }
    // @step{3}:插入数据库
    result = await db.save(User, reqBody, null, null);
    // @step{4}:为新创建的用户生成地址
    await depositSvc.generateAllAssetsFor(result.id);
    // @step{4}:返回
    if(typeof result === "string") {
        ctx.throw(Const.SAVE_USER_FAILED, "failed", `持久化用户数据失败：${result}`);
    } else {
        ctx.body = {data: "success"}
    }
});

// @block{api_v1_user_log_in}:用户登录
// @params{request_body}[object]:登录表单
//                  * *username*[```string```]：用户名
//                  * *password*[```string```]：密码
// @return{response_body}[object]:登录结果
//                  * *data*[```number```]：操作结果
//                  * *error*[```string```]：错误消息（跟data二选一）
router.post("/in", async ctx => {
    // @step{1}:收集请求参数
    let reqBody = ctx.request.body;
    // @step{2}:查询数据库，判断用户身份
    let result = await db.select(User, {
        username: reqBody.username
    });
    if(result.length !== 1) {
        ctx.throw(Const.NO_SUCH_USER, "failed", "用户名不存在");
    }
    let dbUser = result[0];
    // @step{3}:检查密码
    let sha1 = crypto.createHash("sha1");
    sha1.update(reqBody.password);
    if(dbUser.password !== sha1.digest("hex")) {
        ctx.throw(Const.WRONG_PASSWORD, "failed", "错误的登录密码");
    }
    // @step{4}:生成jwt填入response头部
    let payload = _.clone(jwtCfg);
    let secret = payload.secret;
    let options = { expiresIn: payload.exp };
    delete payload.exp;
    delete payload.secret;
    payload.sub = reqBody.username;
    payload.aud = reqBody.audience || "weixin";
    payload.iat = Date.now();
    payload.jti = uuidv4();
    let token = jwt.sign(payload, secret, options);
    ctx.set("authorization", token);
    // @step{5}:返回
    ctx.body = {data: "success"}
});

// @block{api_v1_user_log_up}:用户状态
// @return{response_body}[object]:登录结果
//                  * *data*[```number```]：操作结果
//                  * *error*[```string```]：错误消息（跟data二选一）
router.get("/stat", async ctx => {
    // @step{1}:从头部获取授权token
    let token = ctx.get("authorization");
    if(!token) {
        ctx.throw(Const.NOT_LOGIN, "failed", "未登录");
    }
    // @step{2}:验证token合法
    let payload = {
        issuer: jwtCfg.iss,
        audience: ctx.request.query.audience || "weixin"
    };
    let decoded = {};
    try {
        decoded = jwt.verify(token, jwtCfg.secret, payload);
    } catch (e) {
        ctx.throw(Const.WRONG_TOKEN, "failed", `登录token验证失败：${e.message || JSON.stringify(e)}`);
    }
    // @step{3}:获取token中的用户信息
    let result = "succeed";
    if(decoded.payload && decoded.payload.aud) {
        result = decoded.payload.aud;
    }
    ctx.body = {data: result}
});

// @block{api_v1_user_log_up}:刷新会话
// @return{response_body}[object]:登录结果
//                  * *data*[```number```]：操作结果
//                  * *error*[```string```]：错误消息（跟data二选一）
router.get("/refs", async ctx => {
    // @step{1}:从头部获取授权token
    let token = ctx.get("authorization");
    if(!token) {
        ctx.throw(Const.NOT_LOGIN, "failed", "未登录");
    }
    // @step{2}:检查token是否过期
    let decoded = {};
    try {
        decoded = jwt.decode(token, {complete: true})
    } catch (e) {
        ctx.throw(Const.WRONG_TOKEN, "failed", `登录token验证失败：${e.message || JSON.stringify(e)}`);
    }
    let payload = decoded.payload;
    let duration = Date.now() - payload.iat;
    let expiresIn = jwtCfg.exp;
    if(typeof expiresIn === "string") {
        expiresIn = ms(expiresIn);
    }
    if(expiresIn > duration) {
        ctx.body = {
            status: Const.OPR_SUCCEED,
            result: "succeed",
            message: "token还未过期"
        };
        return;
    }
    // @step{3}:过期则重新签发token
    console.log("token过期，重新签发");
    payload.iat = Date.now();
    payload.jti = uuidv4();
    token = jwt.sign(payload, jwtCfg.secret, {expiresIn: payload.exp});
    ctx.set("authorization", token);
    // @step{4}:返回
    ctx.body = {data: "success"}
});

module.exports = router;