<template>
    <div class="wrapper">
        <h1 class="header">Documentation</h1>
        <div class="main-block">
            <div class="choice">
                <el-button
                    class="back-button"
                    type="primary"
                    icon="el-icon-arrow-right"
                    @click="goto('concept-page')"
                ></el-button>
                <h2>{{ $t('Key concepts') }}</h2>
            </div>
            <div class="choice">
                <el-button
                    class="back-button"
                    type="primary"
                    icon="el-icon-arrow-right"
                    @click="goto('walkthrough-page')"
                ></el-button>
                <h2>{{ $t('App walkthrough') }}</h2>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
    components: {},
    data() {
        return {};
    },
    methods: {
        goto(this: any, name: string) {
            this.$router.push({ name });
        },
    },
});
</script>

<style lang="scss" scoped>
.header {
    text-align: center;
}

.choice {
    display: flex;
    .back-button {
        padding: 10px;
        margin: 15px;
    }
}
</style>
