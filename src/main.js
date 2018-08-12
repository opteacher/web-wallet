import Vue from "vue";
import VueRouter from "vue-router";
import VueAxios from "vue-axios"
import ElementUI from "element-ui";
import 'element-ui/lib/theme-chalk/index.css';
import axios from "axios"
import routes from "./routes"

Vue.use(VueRouter);
Vue.use(VueAxios, axios);
// Vue.axios.defaults.baseURL = 'https://api-demo.websanova.com/api/v1';
Vue.use(ElementUI);

Vue.router = new VueRouter({ routes });

Vue.use(require('@websanova/vue-auth'), {
    auth:   require('@websanova/vue-auth/drivers/auth/basic.js'),
    http:   require('@websanova/vue-auth/drivers/http/axios.1.x.js'),
    router: require('@websanova/vue-auth/drivers/router/vue-router.2.x.js'),
	fetchData: { url: "/api/v1/user/log/stat" },
	refreshData: { url: "/api/v1/user/log/refs" }
});

new Vue({
    template: `
        <div v-loading.fullscreen.lock="!$auth.ready()">
            <router-view></router-view>
        </div>
    `,
    router: Vue.router
}).$mount("#app");