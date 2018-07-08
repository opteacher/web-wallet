const _ = require("lodash");
const mongoose = require("mongoose");
mongoose.Promise = global.Promise;

const cfg = require("../config/db").mongo;
const getErrContent = require("../utils/message").getErrContent;

// @block{Mongo}:mongodb的实例类
// @role:数据库操作类
// @includes:lodash
// @includes:mongoose
// @includes:../config/db.mongo
// @includes:../utils/error
// @type:class
// @description:常量：
//  * *Types*[`object`]：可用列类型
function Mongo() {
	this.config = cfg;
	this.models = {};
	Object.defineProperty(this, "Types", {
		value: {
			Id:         mongoose.Schema.Types.ObjectId,
			String:     String,
			Number:     Number,
			Date:       Date,
			Boolean:    Boolean
		},
		writable: false
	});
	Object.defineProperty(this, "Middles", {
		value: {
			select: "find",
			create: "save",
			update: "save",
			save:   "save",
			delete: "remove",
			before: "pre",
			doing:  "",
			after:  "post"
		},
		writable: false
	})
	Object.defineProperty(this, "getRefCollection", {
		value: mdlStruct => {
			let ret = {};
			_.forIn(mdlStruct, (v, k) => {
				let val = v;
				if(val instanceof Array) {
					val = val[0];
				}
				if(val.ref) { ret[k] = val.ref; }
			});
			return ret;
		},
		writable: false
	});
}

// @block{connect}:数据库连接方法
// @description:连接后方可操作数据库
// @type:function (prototype)
// @return{conn}[Promise]:连接Promise
Mongo.prototype.connect = function() {
	return mongoose.connect([
		"mongodb://",
		(this.config.username ? `${this.config.username}:` : ""),
		(this.config.password ? `${this.config.password}@` : ""),
		`${this.config.host}:`,
		`${this.config.port}/`,
		this.config.database
	].join(""), {
		useMongoClient: true,
		keepAlive: false
	});
}

// @block{defineModel}:定义模型
// @type:function (prototype)
// @params{struct}[object]:ORM结构
// @params{options}[object]:定义参数
//  * *router*[`object`]：路由参数
//      + *methods*[`array`]：需要生成的method方式
//      > 有GET/POST/PUT/DELETE/LINK/PROP（注：PROP可以指定是哪个属性）
//  * *middle*[`object`]：中间件，数据库操作前中后自定义操作
//      + *create*[`object`]：创建
//      + *update*[`object`]：更新
//      + *save*[`object`]：创建/更新
//      + *select*[`object`]：查询
//      + *delete*[`object`]：删除
//      > 每个中间件属性都可以定义before/doing/after三个子属性
// @notices:因为在mongoose中，创建/更新/保存都用的同\
//  一个save接口，所以这三个操作无法同时定义，待修复
Mongo.prototype.defineModel = function(struct, options) {
	if(!options) { options = {}; }
	if(!options.middle) { options.middle = {}; }

	let mdlName = struct.__modelName;
	delete struct.__modelName;

	if(!options.operate) { options.operate = {}; }
	const setOperate = name => {
		if(!options.operate[name]) {
			options.operate[name] = {
				columns: _.keys(struct)
			};
		}
	}
	setOperate("select");
	setOperate("update");
	setOperate("create");
	setOperate("delete");
	_.forIn(struct, (prop, name) => {
		if(prop.excludes) {
			prop.excludes.map(oper => {
				_.remove(options.operate[oper].columns, n => {
					return n === name;
				});
			});
			delete prop.excludes;
		}
	});

	let self = this;
	let schema = mongoose.Schema(struct);
	_.forIn(options.middle, (v, obs) => {
		if(!(obs in self.Middles)) { return; }
		_.forIn(v, (func, stage) => {
			if(!(stage in self.Middles)) { return; }
			switch(stage) {
				case "before":
					schema[self.Middles[stage]](
						self.Middles[obs], function(next) {
							func(this);
							next();
						}
					);
					break;
				case "doing":
					console.error("mongoose不支持doing中间件");
					break;
				case "after":
					schema[self.Middles[stage]](
						self.Middles[obs], func
					);
					break;
			}
		});
	});

	let model = mongoose.model(mdlName, schema);
	model.__extProperties = _.assign({
		infor: { modelName: mdlName },
	}, options);
	this.models[mdlName] = struct;
	return model;
}

Mongo.prototype.select = function(model, condition, options) {
	if(!options) { options = {}; }
	if(!options.cvtId) { options.cvtId = true; }
	if(condition && condition.id && options.cvtId) {
		condition._id = condition.id;
		delete condition.id;
	}

	return this.connect().then(() => {
		let order_by = null;
		if(condition.order_by) {
			order_by = condition.order_by;
			delete condition.order_by;
		}
		let limit = null;
		if(condition.limit) {
			limit = condition.limit;
			delete condition.limit;
		}
		let selCols = model.__extProperties.operate.select.columns.join(" ");
		if(options.selCols) { selCols = options.selCols.join(" "); }
		let res = model.find(condition, selCols);
		if(order_by)    { res = res.sort(order_by); }
		if(limit)       { res = res.limit(Number.parseInt(limit)); }
		if(options.ext) {
			let mdlNam = model.__extProperties.infor.modelName;
			let mdlStruct = this.models[mdlNam];
			_.forIn(this.getRefCollection(mdlStruct), (colNam, prop) => {
				res = res.populate(prop);
			});
		}
		return res.exec();
	}).catch(error => { return getErrContent(error); });
}

Mongo.prototype.save = function(model, values, condition, options) {
	if(!options) { options = {}; }
	if(!options.cvtId) { options.cvtId = true; }
	if(!options.updMode) { options.updMode = "cover"; }
	if(condition && condition.id && options.cvtId) {
		condition._id = condition.id;
		delete condition.id;
	}

	return this.connect().then(() => {
		if(!condition) {
			return Promise.resolve();
		} else {
			return model.find(condition);
		}
	}).then(res => {
		if(!res) {
			res = new model(values);
			res = [ res.save() ];
		} else {
			res = res.map(obj => {
				_.forIn(values, (v, k) => {
					switch(options.updMode.toLowerCase()) {
						case "append":
							let propType = this.models[
								model.__extProperties.infor.modelName
								][k];
							if(propType instanceof String) {
								obj[k] += v;
							} else if(propType instanceof Array) {
								// https://github.com/Automattic/mongoose/issues/4455
								obj[k] = obj[k].concat([v]);
							} else if(propType instanceof Number) {
								obj[k] += v;
							} else {
								obj[k] = v;
							}
							break;
						case "cover":
						default:
							obj[k] = v;
					}
				});
				return obj.save();
			});
		}
		return Promise.all(res);
	}).catch(error => { return getErrContent(error); });
}

Mongo.prototype.delete = function(model, condition, options) {
	if(!options) { options = {}; }
	if(!options.cvtId) { options.cvtId = true; }
	if(condition && condition.id && options.cvtId) {
		condition._id = condition.id;
		delete condition.id;
	}

	return this.connect().then(() => {
		return model.remove(condition);
	}).catch(error => { return getErrContent(error); });
}

Mongo.prototype.genPreRoutes = function(models) {
	_.forIn(models, model => {
		let mdlNam = model.__extProperties.infor.modelName;
		let foreigns = this.getRefCollection(this.models[mdlNam]);
		_.forIn(foreigns, (colNam, prop) => {
			colNam = _.upperFirst(colNam);
			let prePath = [];
			prePath.push(prop);
			prePath.push(`${mdlNam}/:${mdlNam}_id`);
			if(!models[colNam].__extProperties.router.prePath) {
				models[colNam].__extProperties.router.prePath = [ prePath ];
			} else {
				models[colNam].__extProperties.router.prePath.push(prePath);
			}
		});
	});
}

module.exports = new Mongo();