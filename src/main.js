import Vue from "vue";
import VueRouter from "vue-router";
import VueResource from "vue-resource"
import ElementUI from "element-ui";
import 'element-ui/lib/theme-chalk/index.css';
import home from "./views/home.vue"
import login from "./views/login"

Vue.use(VueResource);
Vue.use(VueRouter);
Vue.use(ElementUI);

const routes = [
    { path: "/",        component: home },
    { path: "/login",   component: login }
];

new Vue({
    router: new VueRouter({ routes })
}).$mount("#app");