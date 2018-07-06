const fs = require("fs");
const Path = require("path");
const router = require("koa-router")();

const scanPath = require("../utils/system").scanPath;

// @block{userRoutes}:用户自定义路由
// @includes:path
// @includes:koa-router
// @includes:../utils/system.scanPath
console.log("用户定义的路由：");

// @steps{1}:扫描当前路径下除index.js以外的所有文件
let subPathAry = scanPath(__dirname, { ignores: ["index.js"] });

// @steps{2}:根据各个文件相对路径，require之后开辟相应的路由
subPathAry.map(file => {
    let pthStat = Path.parse(file);
    let routePath = `/${pthStat.dir.replace(Path.sep, "/")}`;
    console.log(routePath);
    let refIdx = require(`.${Path.sep}${file}`);
    router.use(routePath, refIdx.routes(), refIdx.allowedMethods());
});

// @steps{3}:将index.html视图文件作为根路由/的渲染页面
router.get("/", async ctx => {
    await ctx.render("index");
});
console.log("GET\t/");

module.exports = router;