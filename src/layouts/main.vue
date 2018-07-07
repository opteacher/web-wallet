<template>
    <el-container class="content-layout">
        <el-header>
            <el-menu v-if="loginUserId !== 0" :default-active="activeIndex" class="el-menu-demo" mode="horizontal" @select="handleSelect" router>
                <el-menu-item index="1" @click="handleNavClick">Web钱包</el-menu-item>
                <el-menu-item index="2">资产</el-menu-item>
                <el-menu-item index="3">充币</el-menu-item>
                <el-menu-item index="3">充币</el-menu-item>
                <el-menu-item index="5" class="float-right">退出</el-menu-item>
                <el-menu-item index="4" class="float-right">管理</el-menu-item>
            </el-menu>
            <el-menu v-else class="el-menu-demo" mode="horizontal" @select="handleSelect" router>
                <el-menu-item index="1" disabled="true">Web钱包</el-menu-item>
                <el-menu-item index="2" class="float-right">注册</el-menu-item>
                <el-menu-item index="/login" class="float-right">登录</el-menu-item>
            </el-menu>
        </el-header>
        <el-container class="h-100" direction="vertical">
            <slot/>
        </el-container>
    </el-container>
</template>

<script>
    export default {
        data() {
            return {
                activeIndex: "1",
                loginUserId: 0
            }
        },
        methods: {
            handleSelect(key, keyPath) {
                console.log(key);
            },
            handleNavClick(event) {
                console.log(event);
            }
        }
    };
</script>