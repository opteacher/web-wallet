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
	component: home
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
	meta: {auth: true}
}, {
	path: "/deposit",
	component: deposit,
	meta: {auth: true}
}, {
	path: "/withdraw",
	component: withdraw,
	meta: {auth: true}
}, {
	path: "/manage",
	component: manage,
	meta: {auth: true}
}, {
	path: "/test",
	component: test,
	meta: {auth: true}
}];