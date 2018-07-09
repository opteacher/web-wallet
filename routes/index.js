const fs = require("fs");
const _ = require("lodash");
const Path = require("path");
const router = require("koa-router")();

const vwCfg = require("../config/vw");
const scanPath = require("../utils/system").scanPath;

// @block{userRoutes}:用户自定义路由
// @includes:path
// @includes:koa-router
// @includes:../utils/system.scanPath
console.log("API路由：");

// @steps{1}:扫描当前路径下除index.js以外的所有文件
let subPathAry = scanPath(__dirname, {ignores: ["index.js"]});

// @steps{2}:根据各个文件相对路径，require之后开辟相应的路由
subPathAry.map(file => {
	let pthStat = Path.parse(file);
	let preRoutePath = `/${pthStat.dir.replace(/\\/g, "/")}`;
    let refIdx = require(`./${file}`);
	let content = fs.readFileSync(Path.resolve(__dirname, file), "utf8");
    for(let i = content.indexOf("router."); i !== -1; i = content.indexOf("router.", i)) {
        i += "router.".length;
        let bracket = content.indexOf("(", i);
        if(bracket === -1) {
            continue;
        }
        let comma = content.indexOf(",", bracket);
        if(comma === -1) {
            continue;
        }
        let subRoutePath = content.substring(bracket + 1, comma);
        subRoutePath = subRoutePath.substring(1, subRoutePath.length - 1);
        let routePath = "";
        if(subRoutePath !== "/") {
            routePath = preRoutePath + subRoutePath;
        } else {
            routePath = preRoutePath;
        }
        let method = content.substring(i, bracket).toLocaleUpperCase();
        console.log(`${method}${method.length > 3 ? "" : "\t"}\t${routePath}`);
    }
    router.use(preRoutePath, refIdx.routes(), refIdx.allowedMethods());
});

// @steps{3}:将index.html视图文件作为根路由/的渲染页面
console.log("页面路由：");
router.get("/", async ctx => {
	await ctx.render("index");
});
console.log("GET\t\t/");

// @steps{4}:获取src下的index.js文件，开辟mithril路由
switch (vwCfg.front.toLocaleLowerCase()) {
    case "mithril":
        let content = fs.readFileSync(Path.resolve(__dirname, "../src/index.js"), "utf8");
        let routeStartIdx = content.indexOf("m.route(document.body");
        if(routeStartIdx !== -1) {
            let routeList = content.slice(routeStartIdx).match(/{[\w\W]*}/);
            if(routeList[0]) {
                routeList[0].replace("\n", "").slice(1, -1).split(",").map(r => {
                    console.log(`GET\t\t/#!${r.split(":")[0].trim().slice(1, -1)}`);
                });
            }
        }
        break;
	case "vuejs":
		for(let route of require("../src/main.js")) {
            console.log(`GET\t/#${route.path}`);
		}
		break;
    default:
}

module.exports = router;