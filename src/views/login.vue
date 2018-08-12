<template>
    <main-layout>
        <div class="container-fluid mt-5">
            <el-row :gutter="20">
                <el-col :span="8" :offset="8">
                    <div class="grid-content bg-purple p-3">
                        <el-form ref="form" :model="form">
                            <el-form-item>
                                <el-input v-model="form.body.username" placeholder="用户名/邮箱/手机"></el-input>
                            </el-form-item>
                            <el-form-item>
                                <el-input v-model="form.body.password" placeholder="密码"></el-input>
                            </el-form-item>
                            <el-form-item label="">
                                <el-checkbox v-model="form.rememberMe" label="保存登陆信息" name="type"></el-checkbox>
                            </el-form-item>
                            <el-form-item class="mb-0">
                                <el-button @click="doLogin" type="primary">登录</el-button>
                                <el-button @click="toLogup">注册</el-button>
                            </el-form-item>
                        </el-form>
                    </div>
                </el-col>
            </el-row>
        </div>
    </main-layout>
</template>

<script>
	import mainLayout from "../layouts/main"
    import cookies from "../../utils/cookies"
    import uuidV4 from "uuid/v4"

	export default {
		data() {
			return {
				form: {
					body: {
						username: "",
						password: ""
                    },
                    rememberMe: false
				}
			}
		},
		components: {
			"main-layout": mainLayout
		},
		methods: {
			toLogup() {
				window.location.href = "/#/logup"
			},
			async doLogin() {
				try {
					await this.$auth.login({
						data: this.form,
						url: "/api/v1/user/log/in",
						rememberMe: this.form.rememberMe,
                        fetchUser: true,
						redirect: "/"
					});
                } catch (e) {
                    console.log(this.$auth.redirect());
					this.$notify.error({
						title: "错误",
						message: e.message ? e.message : JSON.stringify(e)
					})
				}
            }
		}
	}
</script>

<style>
    .bg-purple {
        background: #d3dce6;
    }

    .grid-content {
        border-radius: 4px;
        min-height: 36px;
    }
</style>