<template>
    <main-layout>
        <div class="container-fluid mt-5">
            <el-row :gutter="20">
                <el-col :span="8" :offset="8">
                    <div class="grid-content bg-purple p-3">
                        <el-form ref="form" :model="form">
                            <el-form-item>
                                <el-input v-model="form.username" placeholder="用户名"></el-input>
                            </el-form-item>
                            <el-form-item>
                                <el-input v-model="form.email" placeholder="邮箱"></el-input>
                            </el-form-item>
                            <el-form-item>
                                <el-input v-model="form.phone" placeholder="手机号">
                                    <el-button slot="append">发送验证码</el-button>
                                </el-input>
                            </el-form-item>
                            <el-form-item>
                                <el-input v-model="form.password" placeholder="密码"></el-input>
                            </el-form-item>
                            <el-form-item>
                                <el-input v-model="form.repeat" placeholder="重复密码"></el-input>
                            </el-form-item>
                            <el-form-item class="mb-0">
                                <el-button @click="doLogup" type="primary">注册</el-button>
                                <el-button @click="toLogin">已有账户，前往登陆</el-button>
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
    import axios from "axios"

	export default {
		data() {
			return {
				form: {
					username: "",
					email: "",
					phone: "",
					password: "",
					repeat: ""
				}
			}
		},
		components: {
			"main-layout": mainLayout
		},
		methods: {
			async doLogup() {
				let result = await axios.post("/api/v1/user", this.form);
				console.log(result);
				window.location.href = "/#/login"
            },
			toLogin() {
				window.location.href = "/#/login"
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