/***
 * 作者：opteacher
 * 日期：2018/07/06
 ***/
const path = require("path");
const Koa = require("koa");
// 用于旧版本模块的generator向async/await转换
const convert = require("koa-convert");
const bodyparser = require("koa-bodyparser");
const json = require("koa-json");
const logger = require("koa-logger");
const statc = require("koa-static");
const views = require("koa-views");
const cors = require("koa2-cors");

const docs = require("./docs/index")({ path: __dirname });
const router = require("./routes/index");

const app = new Koa();

// 跨域配置
app.use(cors());

// 路径解析
app.use(bodyparser());

// json解析
app.use(json());

// 日志输出
app.use(logger());

// 指定静态目录
app.use(statc(path.join(__dirname, "public")));

// 指定页面目录
app.use(views("./views", { extension: "html" }));

// 文档路由
app.use(docs.routes(), docs.allowedMethods());

// 路径分配
app.use(router.routes(), router.allowedMethods());

// 错误跳转
app.use(ctx => {
    ctx.status = 404;
    ctx.body = "error";
});

app.listen(process.env.PORT || 3000);