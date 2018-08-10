<template>
    <el-container v-loading.fullscreen.lock="!$auth.ready()" class="content-layout">
        <el-header class="p-0" height="50">
            <nav v-if="loginUserId !== undefined" class="navbar navbar-expand-lg navbar-dark bg-dark">
                <a class="navbar-brand" href="#">Web钱包</a>
                <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent1" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                    <span class="navbar-toggler-icon"></span>
                </button>

                <div class="collapse navbar-collapse" id="navbarSupportedContent1">
                    <ul class="navbar-nav mr-auto">
                        <li class="nav-item">
                            <a class="nav-link" :class="{ active: actIdx === '/#/assets' }" href="/#/assets">资产</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" :class="{ active: actIdx === '/#/deposit' }" href="/#/deposit">充币</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" :class="{ active: actIdx === '/#/withdraw' }" href="/#/withdraw">提币</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" :class="{ active: actIdx === '/#/test' }" href="/#/test">测试</a>
                        </li>
                    </ul>
                    <ul class="my-2 my-lg-0">
                        <li class="nav-item">
                            <a class="nav-link" :class="{ active: actIdx === '/#/manage' }" href="/#/manage">管理</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="/#/">退出</a>
                        </li>
                    </ul>
                </div>
            </nav>
            <nav v-else class="navbar navbar-expand-lg navbar-dark bg-dark">
                <a class="navbar-brand"  :class="{ active: actIdx === '/#/' }" href="/#/">Web钱包</a>
                <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent2" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                    <span class="navbar-toggler-icon"></span>
                </button>

                <div class="collapse navbar-collapse" id="navbarSupportedContent2">
                    <ul class="navbar-nav mr-auto"></ul>
                    <ul class="navbar-nav my-2 my-lg-0">
                        <li class="nav-item">
                            <a class="nav-link" :class="{ active: actIdx === '/#/login' }" href="/#/login">登录</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" :class="{ active: actIdx === '/#/logup' }" href="/#/logup">注册</a>
                        </li>
                    </ul>
                </div>
            </nav>
        </el-header>
        <el-container class="h-100" direction="vertical">
            <slot/>
        </el-container>
    </el-container>
</template>

<script>
    import cookies from "../../utils/cookies"

	export default {
		data() {
			return {
				actIdx: "/#/",
				loginUserId: undefined
			}
		},
		methods: {
			doLogout() {
				cookies.clear("uuid");
				this.loginUserId = undefined;
            }
		},
        created() {
	        this.loginUserId = cookies.get("uuid");

            this.$auth.ready(function () {
                console.log('ready ' + this.context);
            });
        },
        mounted() {
            this.actIdx = `/${window.location.hash.split("?")[0]}`;
        }
	};
</script>