<template>
    <main-layout>
        <adv-bar class="w-100 h-51"/>
        <div class="container-fluid">
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
	import advBar from "../components/advBar"

	export default {
		components: {
			"main-layout": mainLayout,
			"adv-bar": advBar
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