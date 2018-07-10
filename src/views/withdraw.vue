<template>
    <main-layout>
        <div class="container-fluid mt-5">
            <el-row :gutter="20">
                <el-col :span="8" :offset="8">
                    <div class="grid-content bg-purple p-4">
                        <el-form label-position="left" ref="form" :model="form" label-width="80px">
                            <el-form-item label="资产">
                                <el-select class="w-100" v-model="form.asset" placeholder="请选择资产" @change="handleChangeAsset">
                                    <el-option v-for="aa in avaAssets" :label="aa.asset" :value="aa.asset">
                                        <span style="float: left">{{ aa.asset }}</span>
                                        <span style="float: right; color: #8492a6; font-size: 13px">{{ aa.available }}</span>
                                    </el-option>
                                </el-select>
                            </el-form-item>
                            <el-form-item label="目标地址">
                                <el-col class="p-0" :span="18">
                                    <el-select class="w-100" v-model="form.target" placeholder="请选择转出地址">
                                        <el-option v-for="addr in addresses" :label="addr.address" :value="addr.address">
                                        </el-option>
                                    </el-select>
                                </el-col>
                                <el-col class="p-0" :span="6">
                                    <el-button class="w-100" @click="dialogVisible = true">添加地址</el-button>
                                </el-col>
                            </el-form-item>
                            <el-form-item label="金额">
                                <el-input v-model="form.value">
                                </el-input>
                            </el-form-item>
                            <el-form-item label="手续费">
                                <el-radio-group v-model="form.fee">
                                    <el-radio label="高">
                                    </el-radio>
                                    <el-radio label="低">
                                    </el-radio>
                                </el-radio-group>
                            </el-form-item>
                            <el-form-item>
                                <el-button type="primary" @click="sendTransfer">转账</el-button>
                            </el-form-item>
                        </el-form>
                        <el-dialog
                                title="添加地址"
                                :visible.sync="dialogVisible"
                                width="40%">
                            <el-table
                                    ref="singleTable"
                                    :data="addresses"
                                    highlight-current-row
                                    style="width: 100%"
                                    @current-change="handleAddressChgInDlg">
                                <el-table-column type="index" width="50">
                                </el-table-column>
                                <el-table-column property="address" label="地址">
                                </el-table-column>
                                <el-table-column property="desc" label="备注" width="120">
                                </el-table-column>
                            </el-table>
                            <span slot="footer" class="dialog-footer">
                                <el-button @click="generateNewAddress">生 成</el-button>
                                <el-button @click="dialogVisible = false">取 消</el-button>
                                <el-button type="primary" @click="dialogVisible = false">确 定</el-button>
                            </span>
                        </el-dialog>
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

	export default {
		data() {
			return {
                form: {
                    asset: "",
                    target: "",
                    value: 0,
                    fee: 0
                },
                avaAssets: [],
                addresses: [],
                dialogVisible: false
			}
		},
		methods: {
		    async handleChangeAsset(asset) {
		        this.form.asset = asset;
		        try {
                    this.addresses = (
                        await axios.get(`/api/v1/user/${cookies.get("uuid")}/withdraw/addresses?asset=${asset}`)
                    ).data.data;
                } catch (e) {

                }
            },
            async generateNewAddress() {
                this.addresses.push(
                    (
                        await axios.post(`/api/v1/user/${cookies.get("uuid")}/assets/${this.selAsset}/address`)
                    ).data.data
                );
            },
            handleAddressChgInDlg(val) {
                this.form.address = val.address;
            },
            async sendTransfer() {
		        let result = await axios.post(`/api/v1/transaction/withdraw`, this.form);
		        console.log(result);
            }
		},
		components: {
			"main-layout": mainLayout
		},
        async created() {
		    try {
                this.avaAssets = (
                    await axios.get(`/api/v1/user/${cookies.get("uuid")}/assets?empty=0`)
                ).data.data;
            } catch (e) {

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