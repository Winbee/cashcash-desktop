<template>
    <div id="app">
        <router-view></router-view>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
    name: 'cashcash',
    data() {
        return {};
    },
    async beforeCreate(this: any) {},
    components: {},
});
</script>

<style lang="scss">
@import './styles/index.scss';
</style>
