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
                            <el-input v-model="address" placeholder="充币地址" style="width: 400px">
                                <el-button slot="append">复制</el-button>
                            </el-input>
                        </div>
                    </div>
                </el-col>
            </el-row>
            <el-table
                    class="mt-3"
                    :data="deposits"
                    height="250"
                    style="width: 100%">
                <el-table-column
                        prop="id"
                        label="#"
                        width="100">
                </el-table-column>
                <el-table-column
                        prop="amount"
                        label="金额"
                        width="180">
                </el-table-column>
                <el-table-column
                        prop="create_time"
                        label="发现时间"
                        width="180">
                </el-table-column>
                <el-table-column
                        prop="height"
                        label="高度"
                        width="100">
                </el-table-column>
                <el-table-column
                        prop="tx_hash"
                        label="交易ID">
                </el-table-column>
                <el-table-column
                        prop="status"
                        label="状态"
                        width="100">
                </el-table-column>
            </el-table>
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
                address: "",
                deposits: [],
                testAmount: 0
			}
		},
        methods: {
	        handleAssetChange(address) {
                this.address = address;
                let cvsQRCode = document.getElementById("cvsQRCode");
                qrcode.toCanvas(cvsQRCode, this.address, { width: 400 });
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
			    this.address = this.assetAddresses[0].value;
			    this.selectedAsset = this.assetAddresses[0].label;
                let cvsQRCode = document.getElementById("cvsQRCode");
                qrcode.toCanvas(cvsQRCode, this.address, { width: 400 });

                this.deposits = (await axios.get("/api/v1/tx/deposit", {
                    params: {
                        asset: this.selectedAsset,
                        address: this.address
                    }
                })).data.data;
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