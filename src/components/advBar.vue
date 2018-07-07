<template>
    <div class="jumbotron jumbotron-fluid pt-0 pb-0">
        <el-carousel trigger="click" height="h-100">
            <el-carousel-item v-for="item in 4" :key="item">
                <h3>{{ item }}</h3>
            </el-carousel-item>
        </el-carousel>
    </div>
</template>

<script>

</script>