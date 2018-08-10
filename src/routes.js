import home from "./views/home"
import login from "./views/login"
import logup from "./views/logup"
import assets from "./views/assets"
import deposit from "./views/deposit"
import withdraw from "./views/withdraw"
import manage from "./views/manage"
import test from "./views/test"

export default [
    { path: "/", component: home },
    { path: "/login", component: login },
    { path: "/logup", component: logup },
    { path: "/assets", component: assets },
    { path: "/deposit", component: deposit },
    { path: "/withdraw", component: withdraw },
    { path: "/manage", component: manage },
    { path: "/test", component: test }
];