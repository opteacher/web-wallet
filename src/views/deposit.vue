<template>
    <main-layout>
        <div class="container-fluid mt-5">
            <el-row :gutter="20">
                <el-col :span="12" :offset="6">
                    <div class="grid-content bg-purple p-2">
                        <el-select class="mb-2 w-100"
                                   placeholder="选择资产"
                                   v-model="selectedAsset"
                                   @change="handleAssetChange">
                            <el-option v-for="item in assetAddresses"
                                       :key="item.value"
                                       :label="item.label"
                                       :value="item.value">
                            </el-option>
                        </el-select>
                        <div class="text-center mb-1">
                            <canvas id="cvsQRCode" class="img-fluid rounded"></canvas>
                        </div>
                        <div class="text-center">
                            <el-input v-model="selectedAddress" placeholder="充币地址" style="width: 400px">
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
                selectedAsset: "",
                selectedAddress: ""
			}
		},
        methods: {
	        handleAssetChange(address) {
                this.selectedAddress = address;
                let cvsQRCode = document.getElementById("cvsQRCode");
                qrcode.toCanvas(cvsQRCode, this.selectedAddress, { width: 400 });
            }
        },
		components: {
			"main-layout": mainLayout
		},
        async created() {
		    try {
		        let url = `/api/v1/user/${cookies.get("uuid")}/deposit/addresses`;
                this.assetAddresses = (await axios.get(url)).data.data.map(item => {
                    return {
                        label: item.asset,
                        value: item.address
                    };
                });
			    this.selectedAddress = this.assetAddresses[0].value;
			    this.selectedAsset = this.assetAddresses[0].label;
                let cvsQRCode = document.getElementById("cvsQRCode");
                qrcode.toCanvas(cvsQRCode, this.selectedAddress, { width: 400 });
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