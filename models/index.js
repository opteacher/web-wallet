const _ = require("lodash");
const router = require("koa-router")();

const cfg = require("../config/mdl.json");
const db = require(`../databases/${cfg.type}`);

// @block{modelRoutes}:模型生成路由
// @includes:lodash
// @includes:koa-router
// @includes:../db/数据库类型
// @includes:../config/mdl.json

// @steps{1}:引进所有模型
const exp = {
	"User": require("./user"),
    "Asset": require("./asset"),
	"DepositAddress": require("./depositAddress"),
	"WithdrawAddress": require("./withdrawAddress")
};
if(cfg.sync) {
	(async () => {
        await Promise.all(_.values(exp).map(model => db.sync(model)));
        console.log("数据库模型同步完毕");
	})();
}

// @steps{2}:根据模型之间的关系，生成前置路径
db.genPreRoutes(exp);

// @steps{3}:遍历所有模型
console.log("模型生成的路由：");
router.get(`/mdl/v${cfg.version}/model`, async ctx => {
	ctx.body = {version: cfg.version};
});
console.log(`GET\t\t/mdl/v${cfg.version}/model`);
_.forIn(exp, (model, apiNam) => {
	// @steps{3_1}:检测用户定义的模型参数是否包含了所需的信息
	if (!model.__extProperties) {
		console.error("模型未定义！");
		return;
	}
	if (!model.__extProperties.infor
		|| !model.__extProperties.infor.modelName) {
		console.error("模型定义有异常！");
		return;
	}
	if (!model.__extProperties.router) {
		model.__extProperties.router = {};
	}
	if (!model.__extProperties.router.methods) {
		model.__extProperties.router.methods = [];
	}

	// @steps{3_2}:定义所有用到的URL
	const modelName = model.__extProperties.infor.modelName;
	const GetUrl = `/mdl/v${cfg.version}/${modelName}/:id`;
	const AllUrl = `/mdl/v${cfg.version}/${modelName}s`;
	const PostUrl = `/mdl/v${cfg.version}/${modelName}`;
	const PutUrl = GetUrl;
	const DelUrl = GetUrl;
	const prePath = model.__extProperties.router.prePath;
	const LnkUrl = prePath ? `/mdl/v${cfg.version}/${prePath.map(pp => pp[1]).join("/")}/${modelName}/:id` : null;

	// @steps{3_3}:遍历用户要求的method接口
	model.__extProperties.router.methods.map(method => {
		// @steps{3_3_1}:如果method包含其他参数，将其与method本体分离
		// @detail{steps{3_3_1}}:主要用于PROP method
		let extAttr = {};
		if (typeof method === "object") {
			extAttr = _.cloneDeep(method);
			method = method.method;
			delete extAttr.method;
		}
		// @steps{3_3_2}:根据method跳转到相应的处理逻辑中
		switch (method.toLowerCase()) {
			case "get":
				// @steps{3_3_2_1}:*GET*：根据id查找，**会联表**
				router.get(GetUrl, async ctx => {
					ctx.body = {
						data: await db.select(model, {
							id: ctx.params.id
						}, {ext: true})
					};
				});
				console.log(`GET\t\t${GetUrl}`);
				break;
			case "all":
				// @steps{3_3_2_2}:*ALL*：查所有，**不会联表**
				router.get(AllUrl, async ctx => {
					ctx.body = {
						data: await db.select(model, ctx.query)
					};
				});
				console.log(`GET\t\t${AllUrl}`);
				break;
			case "post":
				// @steps{3_3_2_3}:*POST*：**使用form表单提交**
				router.post(PostUrl, async ctx => {
					ctx.body = {
						data: await db.save(model, ctx.request.body)
					};
				});
				console.log(`POST\t${PostUrl}`);
				break;
			case "put":
				// @steps{3_3_2_4}:*PUT*：同POST
				router.put(PutUrl, async ctx => {
					ctx.body = {
						data: await db.save(model, ctx.request.body, ctx.params)
					};
				});
				console.log(`PUT\t\t${PutUrl}`);
				break;
			case "delete":
				// @steps{3_3_2_5}:*DELETE*：同GET
				router.delete(DelUrl, async ctx => {
					ctx.body = {
						data: await db.delete(model, ctx.params)
					};
				});
				console.log(`DELETE\t${DelUrl}`);
				break;
			case "link":
				// @steps{3_3_2_6}:*LINK*：将对象关联到指定目标对象中（**对象已经被创建**）
				//                         ```
				//                         /mdl/vx/target/:tid/source/:sid
				//                         // 意味着source[sid]关联到target[tid]
				//                         ```
				LnkUrl && router.put(LnkUrl, async ctx => {
					let lstPre = prePath[prePath.length - 1];
					let prop = lstPre[0];
					let path = lstPre[1];
					let ary = path.split("/");
					if (ary.length !== 2) {
						ctx.body = "错误的路由前缀";
						return;
					}
					let colNam = ary[0];
					let pamId = ary[1].slice(1);
					let preMdl = exp[_.upperFirst(colNam)];
					let condition = {id: ctx.params[pamId]};
					let values = {};
					values[prop] = ctx.params.id;
					ctx.body = {
						data: await db.save(preMdl, values, condition, {
							updMode: "append"
						})
					};
				});
				LnkUrl && console.log(`LINK\t${LnkUrl}`);
				break;
			case "prop":
				// @steps{3_3_2_7}:*PROP*：根据列名，查询对象属性，**会联表**
				// @notice{steps{3_3_2_7}}:建议使用表名（可带复数）作为列名
				extAttr.properties && extAttr.properties.map(prop => {
					let PropUrl = `/mdl/v${cfg.version}/${modelName}/:id/${prop}`;
					router.get(PropUrl, async ctx => {
						ctx.body = {
							data: await db.select(model, {
								id: ctx.params.id
							}, {ext: true, selCols: [prop]})
						};
					});
					console.log(`PROP\t${PropUrl}`);
				});
				break;
		}
	});
});

module.exports = _.assign({
	index: router
}, exp);