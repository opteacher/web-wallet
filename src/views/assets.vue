<template>
    <main-layout>
        <div class="container-fluid mt-3">
            <el-row :gutter="20">
                <el-col :span="18" :offset="3">
                    <div class="grid-content bg-purple">
                        <el-table class="w-100" :data="tableData" stripe>
                            <el-table-column prop="asset" label="币种">
                            </el-table-column>
                            <el-table-column prop="available" label="可提金额">
                            </el-table-column>
                            <el-table-column prop="frozen" label="冻结">
                            </el-table-column>
                            <el-table-column label="操作">
                                <template slot-scope="scope">
                                    <el-button size="mini" :disabled="!scope.row.deposit">充币</el-button>
                                    <el-button size="mini" :disabled="!scope.row.withdraw">提币</el-button>
                                </template>
                            </el-table-column>
                        </el-table>
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
				tableData: []
            }
        },
		components: {
			"main-layout": mainLayout
		},
        async created() {
		    this.tableData = (
                await axios.get(`/api/v1/user/${cookies.get("uuid")}/assets`)
            ).data.data;
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