const _ = require("lodash");
const fs = require("fs");
const Path = require("path");
const router = require("koa-router")();

const cfg = require("../config/doc.json");
const scanPath = require("../utils/system").scanPath;

// @block{docsGen}:文档生成器
// @type:function
// @includes:lodash
// @includes:fs
// @includes:path
// @includes:./system.scanPath
// @role:用于规范化生成文档的工具
// @description:基本格式：`@tag[{name}]:content`
//              标签-tag：用来描述当前节点的类型，有如下标签
//              共同类
//              * *includes*：依赖(文件依赖)
//              * *block*：块节点(在下个块节点之前的都是这个块的属性)
//              * *role*：作用(对块作用的描述)
//              * *desciption*：描述(使用MarkDown模式，允许折行)
//              * *detail*：细节描述(代码注释，需要指定object来附加到其他组件上去)
//              * *notice*：注意点(需要指定object来附加到其他组件上去)
//              * *steps*：步骤
//              * *todo*：未实现
//              * *examples*：示例
//              函数类
//              * *params*：参数
//              * *return*：返回值
//              对象类
//              * *type*：类型
//              类类
//              * *base*：基类
// @params{options}[object]:生成参数
//                          * path[```string```]：指定扫描的代码目录，**默认当前路径**
//                          * ignores[```array```]：指定忽略的文件和目录
function docsGen(options) {
	// @steps{1}:参数检测
	if (!options) {
		options = {};
	}
	if (!options.path) {
		options.path = __dirname;
	}

	// @steps{2}:定义常量
	//           * IgnoreFiles：忽略的文件
	//           * LineComment：单行注释标识
	//           * BlockCommentBegin：多行注释开始标识
	//           * BlockCommentEnd：多行注释结束标识
	//           * Keywords：关键字
	Object.defineProperty(this, "IgnoreFiles", {
		value: [
			"*.html",
			"*.css",
			".git",
			".DS_Store",
			"config",
			"node_modules",
			"package.json",
			"package-lock.json"
		].concat(options.ignores || []),
		writable: false
	});
	Object.defineProperty(this, "LineComment", {
		value: "//",
		writable: false
	});
	Object.defineProperty(this, "BlockCommentBegin", {
		value: "/*",
		writable: false
	});
	Object.defineProperty(this, "BlockCommentEnd", {
		value: "*/",
		writable: false
	});
	Object.defineProperty(this, "Keywords", {
		value: [
			"block",
			"includes",
			"role",
			"description",
			"detail",
			"notice",
			"steps",
			"params",
			"return",
			"type",
			"base"
		],
		writable: false
	});

	// @steps{3}:定义用于检测注释是否存在于字符串中
	// @detail{steps{3}}:原理就是统计双引、单引和折行号出现的次数：\
	//                   偶数就标识不在字符串内；奇数反之
	const checkInStr = preContent => {
		let numDbQuote = 0;
		let numSgQuote = 0;
		let numSpQuote = 0;
		for (let i = 0; i < preContent.length; ++i) {
			if (preContent[i] === "\"") {
				++numDbQuote;
			}
			if (preContent[i] === "\'") {
				++numSgQuote;
			}
			if (preContent[i] === "`") {
				++numSpQuote;
			}
		}
		return numDbQuote % 2 !== 0
			|| numSgQuote % 2 !== 0
			|| numSpQuote % 2 !== 0;
	};
	let docs = {};
	// @steps{4}:扫描指定的路径，并做相应忽略
	scanPath(options.path, {ignores: this.IgnoreFiles}).map(codeFile => {
		// @steps{4_1}:读取文件中的内容
		let content = fs.readFileSync(codeFile, "utf8");
		// @steps{4_2}:获取文件的相对路径
		let fileName = codeFile.replace(`${options.path}${Path.sep}`, "");
		// @steps{4_3}:定义收集数据用的变量
		let colDatas = [];
		let colData = {};
		// @steps{4_4}:定义流程过程中用到的临时变量
		let fmrLnIdx = -1;
		let curTagTtl = "";
		let inCode = false;
		let dontWrap = false;
		let inBlkCmt = false;
		// @steps{4_5}:定义用于调整注释的临时函数```adjustComment```
		// @detail{steps{4_5}}:主要用于调整换行和MD结构的转化
		const adjustComment = cmt => {
			let ret = [
				dontWrap ? "" : "\n\n",
				inCode ? "    " : "",
				cmt
			].join("");
			if (dontWrap) {
				dontWrap = false;
			}
			return ret;
		};
		// @steps{4_6}:定义用于调整detail和notice注释块的临时函数```adjustDtlNoc```
		const adjustDtlNoc = data => {
			return `\n\n>${
				data.tagTitle.toLowerCase() === "notice" ? "**注意：**" : ""
				}${data.content}`;
		};
		// @steps{4_7}:定义用于从注释中收集数据的函数```collectDataFmCmt```
		// @detail{steps{4_7}}:4\_7\_*是该函数的流程说明
		const collectDataFmCmt = (comment, lnIdx) => {
			// @steps{4_7_1}:如果结尾是**非换行符**，删掉该符号并将非换行变量标记为true
			if (comment[comment.length - 1] === "\\") {
				comment = comment.slice(0, -1);
				dontWrap = true;
			}

			// @steps{4_7_2}:定义data变量接受收集的数据，并用正则```/^@\w+/```查找tag名
			// @notice{steps{4_7_2}}:其实就是关键字keyword
			let data = {};
			let tagTitle = comment.match(/^@\w+/);
			let nxtIdx = 0;
			if (tagTitle && tagTitle.length > 0) {
				// @steps{4_7_2_1}:如果存在tag名，则收集之。 并且如果是block块，\
				//                 则将当前收集的数据对象压入数据数组，重置数据对象
				nxtIdx = tagTitle.index + tagTitle[0].length;
				data.tagTitle = tagTitle[0].slice(1);
				if (data.tagTitle.toLowerCase() === "block") {
					colDatas.push(colData);
					colData = {};
				}

				// @steps{4_7_2_2}:如果能够在tag名之后通过正则```/{(\w|{|})+}/```\
				//                 查找到obj名，则收集之
				if (comment[nxtIdx] === "{") {
					let tagObject = comment.slice(nxtIdx).match(/{(\w|{|})+}/);
					if (tagObject && tagObject.length > 0) {
						data.tagObject = tagObject[0].slice(1, -1);
						nxtIdx += tagObject[0].length;
					}
				}

				// @steps{4_7_2_3}:如果能够在obj名之后通过正则```/\[\w+\]/```\
				//                 查找到type名，则收集之
				if (comment[nxtIdx] === "[") {
					let type = comment.slice(nxtIdx).match(/\[\w+\]/);
					if (type && type.length > 0) {
						data.type = type[0].slice(1, -1);
						nxtIdx += type[0].length;
					}
				}

				// @steps{4_7_2_4}:收集冒号之后的正文
				if (comment[nxtIdx] === ":") {
					data.content = comment.slice(nxtIdx + 1);

					// @steps{4_7_2_4_1}:如果当前数据是detail或者notice
					if (data.tagTitle.toLowerCase() === "detail"
						|| data.tagTitle.toLowerCase() === "notice") {
						// @steps{4_7_2_4_1}:则收集它的tag对象，这个对象代表它描述的数据节点
						let idTag = data.tagObject;
						let idObj = idTag.match(/{\w+}/);
						if (idObj && idObj.length > 0) {
							// @steps{4_7_2_4_1_1}:如果它不但指定了对象，还指定的哪个对象，\
							//                     则遍历数据集找出来
							idTag = data.tagObject.slice(0, idObj.index);
							idObj = idObj[0].slice(1, -1);
							if (colData[idTag] instanceof Array) {
								for (let d of colData[idTag]) {
									if (d.object === idObj) {
										if (d.content) {
											// @steps{4_7_2_4_1_1_1}:找出来之后将detail或notice\
											//                       的内容以引用的形式附加上去
											d.content += adjustDtlNoc(data);
										}
										break;
									}
								}
							} else {
								colData[idTag].content += adjustDtlNoc(data);
							}
						} else {
							// @steps{4_7_2_4_1_2}:如果只指定了对象，则附加上去即可
							// @notice{steps{4_7_2_4_1_2}}:如果所附加的节点是个对象，\
							//                             则附加到节点的content上去
							if (colData[idTag].content) {
								colData[idTag].content += adjustDtlNoc(data);
							} else {
								colData[idTag] += adjustDtlNoc(data);
							}
						}
						// @steps{4_7_2_4_2}:如果是detail或notice节点，他们不属于最总数据，\
						//                   所以不需要收集，直接返回
						return;
					}
				}

				// @steps{4_7_2_5}:记录当前数据节点的相关信息，以备之后非节点行注释用
				fmrLnIdx = lnIdx;
				curTagTtl = data.tagTitle;
				curObjNam = data.tagObject || "";
				// @steps{4_7_2_6}:将数据根据有无tag对象汇入到最终内容中去
				let ctt = null;
				if (data.tagObject) {
					ctt = {
						object: data.tagObject,
						content: data.content,
						type: data.type
					}
				} else {
					ctt = data.content;
				}
				// @steps{4_7_2_7}:判断数据对象中是否存在这个节点
				if (data.tagTitle in colData) {
					// @steps{4_7_2_7_1}:如果存在，则将该属性转化为数据，一并保存
					if (colData[data.tagTitle] instanceof Array) {
						colData[data.tagTitle].push(ctt);
					} else {
						colData[data.tagTitle] = [
							colData[data.tagTitle], ctt
						];
					}
				} else {
					// @steps{4_7_2_7_2}:不存在，则简单添加
					colData[data.tagTitle] = ctt;
				}
			} else {
				// @steps{4_7_3}:如果是不包含tag的注释，则检测该行注释是否属于上一个tag
				if (fmrLnIdx !== -1) {
					++fmrLnIdx;
					if (fmrLnIdx === lnIdx) {
						// @steps{4_7_3_1}:如果该行数和上一个tag的预测行数是一致的，\
						//                 则表明当前行是上个tag的一部分
						let tmp = colData[curTagTtl];
						// @steps{4_7_3_2}:如果
						if (tmp instanceof Array) {
							tmp = tmp[tmp.length - 1];
						}

						let cmt = comment.trim();
						if (cmt === "```") {
							inCode = !inCode;
							return;
						}

						if (tmp.content) {
							tmp.content += adjustComment(cmt);
						} else {
							let content = tmp + adjustComment(cmt);
							tmp = colData[curTagTtl];
							if (tmp instanceof Array) {
								colData[curTagTtl][tmp.length - 1] = content;
							} else {
								colData[curTagTtl] = content;
							}
						}
					} else {
						fmrLnIdx = -1;
						curTagTtl = "";
					}
				}
			}
		};
		content.split("\n").map((line, lnIdx) => {
			let blkCmt = line.indexOf(this.BlockCommentEnd);
			if (blkCmt !== -1 && !checkInStr(line.slice(0, blkCmt))) {
				let cmt = _.trimStart(line.slice(0, blkCmt));
				inBlkCmt = false;
			}
			if (inBlkCmt) {
				let cmt = _.trimStart(line);
				return;
			}
			let lnCmt = line.indexOf(this.LineComment);
			if (lnCmt !== -1 && !checkInStr(line.slice(0, lnCmt))) {
				let slcLoc = lnCmt + this.LineComment.length;
				collectDataFmCmt(_.trimStart(line.slice(slcLoc)), lnIdx);
				return;
			}
			blkCmt = line.indexOf(this.BlockCommentBegin);
			if (blkCmt !== -1 && !checkInStr(line.slice(0, blkCmt))) {
				inBlkCmt = true;
				let slcLoc = blkCmt + this.BlockCommentBegin.length;
				let cmt = _.trimStart(line.slice(slcLoc));

			}
		});
		colDatas.shift();
		colDatas.push(colData);
		docs[fileName] = colDatas;
	});

	console.log("文档生成的路由：");
	let avaDocFiles = [];
	_.forIn(docs, (doc, file) => {
		_.remove(doc, itm => !itm.block);
		if (doc.length === 0) {
			return;
		}
		avaDocFiles.push(file);

		let pth = `/doc/v${cfg.version}/${file.split(".")[0]}`;
		router.get(pth, async ctx => {
			if (ctx.request.query.api !== undefined) {
				ctx.body = {data: [file, doc]};
			} else {
				await ctx.render("docs");
			}
		});
		console.log(`GET\t${pth}`);
	});
	router.get(`/doc`, async ctx => {
		ctx.body = {version: cfg.version};
	});
	console.log("GET\t/doc");
	router.get(`/doc/v${cfg.version}/`, async ctx => {
		await ctx.redirect(`/doc/v${cfg.version}/index`);
	});
	console.log(`GET\t/doc/v${cfg.version}/`);
	router.get(`/doc/v${cfg.version}/index`, async ctx => {
		await ctx.render("docs");
	});
	console.log(`GET\t/doc/v${cfg.version}/index`);
	router.get(`/doc/v${cfg.version}/file-list`, async ctx => {
		ctx.body = {data: avaDocFiles};
	});
	console.log(`GET\t/doc/v${cfg.version}/file-list`);

	return router;
}

module.exports = docsGen;