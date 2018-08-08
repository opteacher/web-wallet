<template>
    <main-layout>
        <div class="container-fluid mt-5">
            <el-row :gutter="20">
                <el-col :span="12" :offset="6">
                    <div class="grid-content bg-purple p-4">
                        <el-select class="mb-3 w-100"
                                   placeholder="选择资产"
                                   v-model="selectedAsset"
                                   @change="handleAssetChange">
                            <el-option v-for="item in assetAddresses"
                                       :label="item.label"
                                       :value="item.label">
                                <span class="float-left">{{ item.label }}</span>
                                <span class="float-right">{{ item.value }}</span>
                            </el-option>
                        </el-select>
                        <el-input class="mb-3" v-model="depositAmount" placeholder="测试的金额">
                            <el-button slot="append" @click="testDeposit">测试充币</el-button>
                        </el-input>
                        <el-switch
                                v-model="enableMining"
                                active-text="挖矿"
                                active-color="#13ce66"
                                inactive-color="#ff4949"
                                @change="handleMinerChange">
                        </el-switch>
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
    import _ from "lodash"

    export default {
        data() {
            return {
                assetAddresses: [],
                selectedAsset: "",
                selectedAddress: "",
                depositAmount: 0,
                enableMining: false
            }
        },
        components: {
            "main-layout": mainLayout
        },
        methods: {
            async testDeposit() {
                this.$notify({
                    title: "提示",
                    type: "success",
                    message: (await axios.post("/api/v1/tx/deposit/test", {
                        asset: this.selectedAsset,
                        to: this.selectedAddress,
                        amount: parseFloat(this.depositAmount)
                    })).data.data,
                    duration: 0
                });
            },
            async handleAssetChange() {
                this.selectedAddress = _.find(this.assetAddresses, i => {
                    return i.label === this.selectedAsset
                }).value;

                try {
                    this.enableMining = (await axios.get(
                        `/api/v1/miner/${this.selectedAsset}`
                    )).data.data
                } catch (e) {

                }
            },
            async handleMinerChange() {
                if(this.selectedAsset === "") {
                    this.$message({
                        type: "warning",
                        message: "请先选择资产"
                    });
                    this.enableMining = !this.enableMining;
                    return
                }
                try {
                    let url = `/api/v1/miner/${this.selectedAsset}`;
                    let result = (await axios.put(url, {
                        enable: this.enableMining
                    })).data.data;
                    if(result) {
                        this.$message({
                            type: "success",
                            message: `${ this.enableMining ? "开启挖矿模式" : "关闭挖矿模式" }`
                        });
                    }
                } catch (e) {
                    this.$message({
                        type: "error",
                        message: e.message ? e.message : JSON.stringify(e)
                    });
                }
            }
        },
        async created() {
            try {
                let url = `/api/v1/user/${cookies.get("uuid")}/deposit/addresses`;
                this.assetAddresses = (await axios.get(url)).data.data.map(item => {
                    return {
                        label: item.asset,
                        value: item.address
                    }
                })
            } catch (e) {
                // @_@：页面上要对用户做交代
            }
        }
    }
</script>

<style>

</style>