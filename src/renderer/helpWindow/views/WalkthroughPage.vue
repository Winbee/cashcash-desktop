<template>
    <div class="wrapper">
        <div class="header">
            <el-button
                class="back-button"
                type="primary"
                icon="el-icon-arrow-left"
                @click="goto('home-page')"
            ></el-button>
            <h2>{{ $t('App walkthrough') }}</h2>
        </div>
        <div class="main-block">
            <h2>{{ $t('Home page') }}</h2>
            <p>{{ $t('documentation.walkthrough.1') }}</p>
            <ul>
                <li>{{ $t('documentation.walkthrough.2') }}</li>
                <li>{{ $t('documentation.walkthrough.3') }}</li>
            </ul>
            <p>{{ $t('documentation.walkthrough.4') }}</p>

            <h2>{{ $t('Internal accounts page') }}</h2>
            <p>{{ $t('documentation.walkthrough.5') }}</p>
            <ul>
                <li>{{ $t('documentation.walkthrough.6') }}</li>
                <li>{{ $t('documentation.walkthrough.7') }}</li>
                <li>{{ $t('documentation.walkthrough.8') }}</li>
            </ul>

            <p>{{ $t('documentation.walkthrough.9') }}</p>

            <h2>{{ $t('External accounts page') }}</h2>
            <p>{{ $t('documentation.walkthrough.10') }}</p>
            <ul>
                <li>{{ $t('documentation.walkthrough.11') }}</li>
                <li>{{ $t('documentation.walkthrough.12') }}</li>
            </ul>

            <h2>{{ $t('Transactions page') }}</h2>
            <p>{{ $t('documentation.walkthrough.13') }}</p>

            <h2>{{ $t('Rates page') }}</h2>
            <p>{{ $t('documentation.walkthrough.14') }}</p>

            <h2>{{ $t('Budget page') }}</h2>
            <p>{{ $t('documentation.walkthrough.15') }}</p>
            <p>{{ $t('documentation.walkthrough.16') }}</p>
            <p>{{ $t('documentation.walkthrough.17') }}</p>
            <p>{{ $t('documentation.walkthrough.18') }}</p>

            <h2>{{ $t('Filter page') }}</h2>
            <p>{{ $t('documentation.walkthrough.19') }}</p>

            <h2>{{ $t('Rules page') }}</h2>
            <p>{{ $t('documentation.walkthrough.20') }}</p>

            <h2>{{ $t('Import page') }}</h2>
            <p>{{ $t('documentation.walkthrough.21') }}</p>
            <p>{{ $t('documentation.walkthrough.22') }}</p>
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
    display: flex;
    .back-button {
        padding: 10px;
        margin: 15px;
    }
}
.main-block {
    padding: 10px 15px;
}
</style>
