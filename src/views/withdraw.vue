<template>
    <main-layout>
        <div class="container-fluid mt-5">
            <el-row :gutter="20">
                <el-col :span="12" :offset="6">
                    <div class="grid-content bg-purple p-2">
                        <el-dropdown class="mb-2 w-100" @click="handleAssetChange" trigger="click">
                            <el-button class="w-100 text-left">
                                {{ selectedOption.asset }}<i class="el-icon-arrow-down el-icon--right float-right"></i>
                            </el-button>
                            <el-dropdown-menu slot="dropdown">
                                <el-dropdown-item v-for="item in assetAddresses" :key="item.id">
                                    {{ item.asset }}
                                </el-dropdown-item>
                            </el-dropdown-menu>
                        </el-dropdown>
                        <div class="text-center mb-1">
                            <canvas id="cvsQRCode" class="img-fluid rounded"></canvas>
                        </div>
                        <div class="text-center">
                            <el-input v-model="selectedOption.address" placeholder="充币地址" style="width: 400px">
                                <el-button slot="append">复制</el-button>
                            </el-input>
                        </div>
                    </div>
                </el-col>
            </el-row>
        </div>
    </main-layout>
</template>

<script>
	import mainLayout from "../layouts/main"
	import axios from "axios"
	import cookies from "../../utils/cookies"
	import qrcode from "qrcode"

	export default {
		data() {
			return {
				assetAddresses: [],
				selectedOption: {}
			}
		},
		methods: {
			handleAssetChange() {
			}
		},
		components: {
			"main-layout": mainLayout
		},
		async created() {
			try {
				let url = `/api/v1/user/${cookies.get("uuid")}/addresses`;
				this.assetAddresses = (await axios.get(url)).data.data;
				this.selectedOption = this.assetAddresses[0];
				let cvsQRCode = document.getElementById("cvsQRCode");
				qrcode.toCanvas(cvsQRCode, this.selectedOption.address, { width: 400 });
			} catch (e) {
				// @_@：页面上要对用户做交代
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