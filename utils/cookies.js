module.exports = {
	_cvtJSON(data) {
		try {
			data = JSON.parse(data);
		} catch(e) {
			return data;
		}
		return data;
	},
	get(name, take) {
		if(take === undefined) {
			take = false;
		}
		let keyAry = name.split(".");
		if(keyAry.length === 1) {
			let ret = Cookies.get(name);
			if(ret === undefined) {
				return ret;
			}
			ret = this._cvtJSON(ret);
			take && this.clear(name);
			return ret;
		}
		let key = keyAry.shift();
		let cookies = Cookies.get(key);
		if(cookies === undefined) { cookies = "{}"; }
		cookies = this._cvtJSON(cookies);
		let t = cookies;
		let ret = "";
		for(let i in keyAry) {
			let k = keyAry[i];
			if(!(k in t)) {
				return null;
			}
			if(i === keyAry.length - 1) {
				ret = t[k];
				if(take) {
					t[k] = undefined;
				}
				Cookies.set(key, cookies);
				break;
			} else {
				t = t[k];
			}
		}
		return ret;
	},
	clear(name) {
		let keyAry = name.split(".");
		if(keyAry.length === 1) {
			Cookies.remove(name, undefined);
			return;
		}
		let cookie = Cookies.get(keyAry[0]);
		if(cookie === undefined) { cookie = "{}"; }
		cookie = this._cvtJSON(cookie);
		delete cookie[keyAry[keyAry.length - 1]];
		Cookies.set(keyAry[0], cookie);
	},
	set(name, value) {
		let keyAry = name.split(".");
		if(keyAry.length === 1) {
			Cookies.set(name, value);
		} else {
			let key = keyAry.shift();
			let cookie = Cookies.get(key);
			if(cookie === undefined) { cookie = "{}"; }
			cookie = cvtJSON(cookie);
			let t = cookie;
			for(let i in keyAry) {
				let k = keyAry[i];
				if(!(k in t)) {
					t[k] = {};
				}
				if(i === keyAry.length - 1) {
					t[k] = value;
					break;
				} else {
					t = t[k];
				}
			}
			Cookies.set(key, cookie);
		}
	},
	getBack(cookies, name) {
		let cookie = cookies.get(name);
		if(cookie) {
			if(cookie.includes("%")) {
				cookie = decodeURI(cookie);
				cookie = cookie.replace(/%2C/g, ",");
			}
			try {
				return Promise.resolve(JSON.parse(cookie));
			} catch(e) {
				return Promise.reject("ERR_JSON");
			}
		} else {
			return Promise.reject("NO_COOKIE");
		}
	},
	async delBack(cookies, name, key) {
		let cookie = await this.getBack(cookies, name);
		if(key in cookie) {
			delete cookie[key];
			cookies.set(name, JSON.stringify(cookie));
		}
	}
};