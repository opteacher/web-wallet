const cookies = require("./cookies");

const message = {
	// @block{getErrContent}:从错误对象中获取描述
	// @params{err}[object]:错误对象
	// @return{ret}[string]:错误描述
	getErrContent: err => {
		let ret = {};
		if(typeof err === "string") {
			ret = err;
		} else if(err.message && typeof err.message === "string") {
			ret = err.message;
		} else if(err.content && typeof err.content === "string") {
			ret = err.content;
		}
		return ret;
	},

	genAlertBlk: msg => {
		if(msg.error) {
			return { cls: "alert-danger", msg: msg.error };
		} else if(msg.warning) {
			return { cls: "alert-warning", msg: msg.warning };
		} else if(msg.success) {
			return { cls: "alert-success", msg: msg.success };
		} else {
			return {
				cls: "alert-info",
				msg: msg.info || msg.content || msg.data
			};
		}
	},

	showAlertDlg: param => {
		let msg = null;
		if(typeof param === "boolean") {
			msg = cookies.get("financial-manager.message", take);
		} else if(param.success || param.error || param.warning || param.info) {
			msg = param;
		} else { return; }
		if($("#dlgAlert").length === 0 || !msg) { return; }
		const cls2ico = cls => {
			switch(cls) {
				case "alert-danger": return "glyphicon-remove-sign";
				case "alert-success": return "glyphicon-ok-sign";
				case "alert-warning":
				case "alert-info":
				default: return "glyphicon-info-sign";
			}
		}
		let cvtMsg = message.genAlertBlk(msg);
		$("#dlgAlert .modal-title").html(msg.success ? "提示" : "注意");
		$("#dlgAlert .modal-body").html([
			`<div class='alert ${cvtMsg.cls}'>`,
			`<span class='glyphicon ${cls2ico(cvtMsg.cls)}' 
                aria-hidden='true'></span>`,
			`<span class='sr-only'>${_.keys(msg)[0]}</span>`,
			` ${cvtMsg.msg}</div>`
		].join(""));
		$("#dlgAlert").modal();
	}
};

module.exports = message;