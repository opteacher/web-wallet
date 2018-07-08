<template>
    <main-layout>
        <div class="container-fluid mt-5">
            <el-row :gutter="20">
                <el-col :span="12" :offset="6">
                    <div class="grid-content bg-purple p-2">
                        <el-cascader
                                class="w-100 mb-2"
                                :options="options"
                                v-model="selectedOptions"
                                @change="handleChange"
                                placeholder="选择币种">
                        </el-cascader>
                        <div class="text-center mb-1">
                            <img class="img-fluid rounded" data-src="holder.js/400x400" src=""/>
                        </div>
                        <el-input v-model="address" placeholder="充币地址">
                            <el-button slot="append">复制</el-button>
                        </el-input>
                    </div>
                </el-col>
            </el-row>
        </div>
    </main-layout>
</template>

<script>
	import mainLayout from "../layouts/main"
    import holder from "holderjs"

	export default {
		data() {
			return {
				selectedOptions: ""
			}
		},
        methods: {
	        handleChange() {

            }
        },
		components: {
			"main-layout": mainLayout
		},
        mounted() {
	        holder.run();
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