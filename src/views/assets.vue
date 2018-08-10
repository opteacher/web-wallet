<template>
    <main-layout>
        <div class="container-fluid mt-3">
            <el-row :gutter="20">
                <el-col :span="18" :offset="3">
                    <el-table class="w-100" :data="tableData" stripe>
                        <el-table-column prop="asset" label="币种">
                        </el-table-column>
                        <el-table-column prop="available" label="可提金额">
                        </el-table-column>
                        <el-table-column prop="frozen" label="冻结">
                        </el-table-column>
                        <el-table-column label="操作">
                            <template slot-scope="scope">
                                <el-button size="mini" :disabled="!scope.row.deposit" @click="toDeposit">充币</el-button>
                                <el-button size="mini" :disabled="!scope.row.withdraw" @click="toWithdraw">提币</el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                    <el-table
                            class="mt-3"
                            :data="assetChanges"
                            height="350"
                            style="width: 100%">
                        <el-table-column
                                prop="type"
                                label="类型"
                                :filters="assetChgTypes">
                        </el-table-column>
                        <el-table-column
                                prop="amount"
                                label="资金变动">
                        </el-table-column>
                        <el-table-column
                                prop="asset"
                                label="资产"
                                :filters="assetTypes">
                        </el-table-column>
                        <el-table-column
                                prop="rel_id"
                                label="关联ID">
                        </el-table-column>
                        <el-table-column
                                prop="createdAt"
                                label="发起时间"
                                sortable>
                        </el-table-column>
                    </el-table>
                </el-col>
            </el-row>
        </div>
    </main-layout>
</template>

<script>
	import mainLayout from "../layouts/main"
    import cookies from "../../utils/cookies"
    import _ from "lodash"

	export default {
		data() {
			return {
				tableData: [],
                assetChanges: [],
                assetChgTypes: [],
                assetTypes: []
            }
        },
        methods: {
		    toDeposit() { window.location.href="/#/deposit"; },
            toWithdraw() { window.location.href="/#/withdraw"; }
        },
		components: {
			"main-layout": mainLayout
		},
        async created() {
		    try {
                this.tableData = (
                    await this.axios.get(`/api/v1/user/${cookies.get("uuid")}/assets`)
                ).data.data;

                this.assetChanges = (
                    await this.axios.get(`/api/v1/user/${cookies.get("uuid")}/assets/history`)
                ).data.data;
                this.assetChgTypes = _.unionBy(this.assetChanges.map(item => {
                    return { text: item.type, value: item.type };
                }), "value");
                this.assetTypes = _.unionBy(this.assetChanges.map(item => {
                    return { text: item.asset, value: item.asset };
                }), "value");
            } catch (e) {
                this.$notify.error({
                    title: "错误",
                    message: e.message ? e.message : JSON.stringify(e)
                })
            }
        }
	}
</script>