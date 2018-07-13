<template>
    <main-layout>
        <div class="container-fluid mt-5">
            <el-row :gutter="20">
                <el-col :span="12" :offset="6">
                    <div class="grid-content bg-purple p-4">
                        <el-form label-position="left" ref="form" :model="form" label-width="80px">
                            <el-form-item label="资产">
                                <el-select class="w-100" v-model="form.asset" placeholder="请选择资产" @change="handleChangeAsset">
                                    <el-option
                                            v-for="aa in avaAssets"
                                            :key="aa.asset"
                                            :label="aa.asset"
                                            :value="aa.asset">
                                        <span style="float: left">{{ aa.asset }}</span>
                                        <span style="float: right; color: #8492a6; font-size: 13px">{{ aa.available }}</span>
                                    </el-option>
                                </el-select>
                            </el-form-item>
                            <el-form-item label="目标地址">
                                <el-col class="p-0" :span="18">
                                    <el-select class="w-100" v-model="form.target" placeholder="请选择转出地址">
                                        <el-option
                                                v-for="addr in addresses"
                                                :key="addr.address"
                                                :label="addr.address"
                                                :value="addr.address">
                                        </el-option>
                                    </el-select>
                                </el-col>
                                <el-col class="p-0" :span="6">
                                    <el-button class="w-100" @click="handleAddAddress">添加地址</el-button>
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
                            <el-row :gutter="10">
                                <el-col :span="12">
                                    <el-input v-model="newAddress.desc" placeholder="输入备注（可选）">
                                    </el-input>
                                </el-col>
                                <el-col :span="12">
                                    <el-input v-model="newAddress.address" placeholder="输入地址">
                                        <el-button slot="append" @click="addAddress">添加</el-button>
                                    </el-input>
                                </el-col>
                            </el-row>
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
            <el-table
                    class="mt-3"
                    :data="withdraws"
                    height="350"
                    style="width: 100%">
                <el-table-column
                        prop="id"
                        label="#"
                        width="100">
                </el-table-column>
                <el-table-column
                        prop="asset"
                        label="币种"
                        width="80">
                </el-table-column>
                <el-table-column
                        prop="amount"
                        label="金额"
                        width="180">
                </el-table-column>
                <el-table-column
                        prop="create_time"
                        label="发起时间"
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
                        prop="address"
                        label="目标地址">
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
    import ElRow from "element-ui/packages/row/src/row";

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
                dialogVisible: false,
                withdraws: [],
                newAddress: {
                    address: "",
                    desc: ""
                }
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
                        await axios.post(`/api/v1/user/${cookies.get("uuid")}/assets/${this.form.asset}/address`)
                    ).data.data
                );
            },
            handleAddressChgInDlg(val) {
                this.form.target = val.address;
            },
            async sendTransfer() {
		        let result = await axios.post(`/api/v1/tx/withdraw`, this.form);
	            this.$notify({
                    title: "提币成功",
                    message: `提币ID为：${result.data.data}`,
                    type: "success"
                });
            },
            async addAddress() {
		        if(this.newAddress.address === "") {
		            this.$message("请输入地址！");
                }
                let isValid = (await axios.get(`/api/v1/address/${this.newAddress.address}`, {
                    params: { asset: this.form.asset }
                })).data.data;
		        if(isValid) {
                    this.newAddress.belong_user = cookies.get("uuid");
                    this.newAddress.asset = this.form.asset;
		            await axios.post(`/api/v1/address`, this.newAddress);
		            this.addresses.push(this.newAddress);
		            this.$message({
                        message: "地址添加成功",
                        type: 'success'
                    });
                } else {
		            this.$message("请输入有效地址！");
                }
            },
            handleAddAddress() {
		        if(this.form.asset === "") {
		            this.$message("请现选择资产");
                    return;
                }
                this.dialogVisible = true
            }
		},
		components: {
            ElRow,
            "main-layout": mainLayout
		},
        async created() {
		    try {
                this.avaAssets = (
                    await axios.get(`/api/v1/user/${cookies.get("uuid")}/assets?empty=0`)
                ).data.data;

                this.withdraws = (
                    await axios.get(`/api/v1/tx/withdraw`, {
                        params: { sender_user: cookies.get("uuid") }
                    })
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