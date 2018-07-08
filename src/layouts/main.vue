<template>
    <el-container class="content-layout">
        <el-header>
            <el-menu v-if="loginUserId !== undefined" :default-active="activeIndex" class="el-menu-demo" mode="horizontal"
                     @select="handleSelect" router>
                <el-menu-item index="/">Web钱包</el-menu-item>
                <el-menu-item index="2">资产</el-menu-item>
                <el-menu-item index="3">充币</el-menu-item>
                <el-menu-item index="4">提币</el-menu-item>
                <el-menu-item index="/" class="float-right" @click="doLogout">退出</el-menu-item>
                <el-menu-item index="6" class="float-right">管理</el-menu-item>
            </el-menu>
            <el-menu v-else class="el-menu-demo" mode="horizontal" @select="handleSelect" router>
                <el-menu-item index="/">Web钱包</el-menu-item>
                <el-menu-item index="/logup" class="float-right">注册</el-menu-item>
                <el-menu-item index="/login" class="float-right">登录</el-menu-item>
            </el-menu>
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
				activeIndex: "1",
				loginUserId: undefined
			}
		},
		methods: {
			handleSelect(key, keyPath) {
				console.log(key);
			},
			handleNavClick(event) {
				console.log(event);
			},
			doLogout() {
				cookies.clear("uuid");
				this.loginUserId = undefined;
            }
		},
        created() {
	        this.loginUserId = cookies.get("uuid")
        }
	};
</script>