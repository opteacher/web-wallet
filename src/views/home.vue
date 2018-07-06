<template>
    <main-layout>
        <div class="container-fluid pt-4">
            <el-row :gutter="20">
                <el-col :span="18" :offset="3">
                    <div class="grid-content bg-purple"></div>
                </el-col>
            </el-row>
        </div>
    </main-layout>
</template>

<script>
    import mainLayout from "../layouts/main"

    export default {
        components: {
            "main-layout": mainLayout
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