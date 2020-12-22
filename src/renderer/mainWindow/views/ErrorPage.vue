<template>
    <div>
        <el-table :data="errorList" stripe style="width: 100%" :show-header="false">
            <el-table-column prop="message" :label="$t('Message')"></el-table-column>
        </el-table>
    </div>
</template>

<script>
import Vue from 'vue';

export default Vue.extend({
    name: 'error-page',
    props: {
        errorList: Array,
    },
});
</script>

<style rel="stylesheet/scss" lang="scss" scoped></style>
