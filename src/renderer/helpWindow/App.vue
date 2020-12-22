<template>
    <div id="app">
        <router-view></router-view>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
    name: 'Documentation',
    data() {
        return {};
    },
    async beforeCreate(this: any) {
        await this.$store.dispatch('App/init');
    },
    components: {},
});
</script>

<style lang="scss"></style>
