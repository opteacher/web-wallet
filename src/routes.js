import home from "./views/home"
import login from "./views/login"
import logup from "./views/logup"
import assets from "./views/assets"
import deposit from "./views/deposit"
import withdraw from "./views/withdraw"
import manage from "./views/manage"
import test from "./views/test"

export default [{
	path: "/",
	component: home,
	meta: {auth: false}
}, {
	path: "/login",
	component: login,
	meta: {auth: false}
}, {
	path: "/logup",
	component: logup,
	meta: {auth: false}
}, {
	path: "/assets",
	component: assets,
	meta: {
		auth: {redirect: "/login"}
	}
}, {
	path: "/deposit",
	component: deposit,
	meta: {
		auth: {redirect: "/login"}
	}
}, {
	path: "/withdraw",
	component: withdraw,
	meta: {
		auth: {redirect: "/login"}
	}
}, {
	path: "/manage",
	component: manage,
	meta: {
		auth: {redirect: "/login"}
	}
}, {
	path: "/test",
	component: test,
	meta: {
		auth: {redirect: "/login"}
	}
}];