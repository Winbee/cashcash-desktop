<template>
    <div class="app-wrapper" :class="classObj">
        <sidebar class="sidebar-container"></sidebar>
        <div class="main-container">
            <app-main></app-main>
        </div>
    </div>
</template>

<script lang="ts">
import Sidebar from './components/sidebar/Sidebar.vue';
import AppMain from './components/AppMain.vue';

export default {
    name: 'layout',
    components: {
        Sidebar,
        AppMain,
    },
    mixins: [],
    computed: {
        sidebarOpened(this: any) {
            return this.$store.state.App.sidebarOpened;
        },
        classObj(this: any) {
            return {
                hideSidebar: !this.sidebarOpened,
            };
        },
    },
};
</script>

<style lang="scss" scoped>
@import '../../styles/mixin.scss';

.app-wrapper {
    @include clearfix;
    position: relative;
    width: 100%;
    height: 100vh;
}
</style>
