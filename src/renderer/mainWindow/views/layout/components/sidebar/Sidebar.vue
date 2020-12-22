<template>
    <div>
        <scroll-bar>
            <el-menu
                mode="vertical"
                :show-timeout="200"
                :default-active="$route.meta.activeMenuPath || $route.path"
                :collapse="!sidebarOpened"
                background-color="#304156"
                text-color="#bfcbd9"
                active-text-color="#409EFF"
            >
                <sidebar-item :routes="routes"></sidebar-item>
            </el-menu>
        </scroll-bar>
        <div class="hamburger-container">
            <hamburger :toggleClick="toggleSideBar" :isActive="sidebarOpened"></hamburger>
        </div>
    </div>
</template>

<script lang="ts">
import SidebarItem from './SidebarItem.vue';
import ScrollBar from '../../../../components/ScrollBar.vue';
import Hamburger from '../../../../components/Hamburger.vue';

export default {
    components: {
        SidebarItem,
        ScrollBar,
        Hamburger,
    },
    computed: {
        sidebarOpened(this: any) {
            return this.$store.state.App.sidebarOpened;
        },
        routes(this: any) {
            return this.$router.options.routes;
        },
    },
    methods: {
        toggleSideBar(this: any) {
            this.$store.dispatch('App/toggleSideBar');
        },
    },
};
</script>

<style lang="scss" scoped>
.hamburger-container {
    position: absolute;
    bottom: 6px;
    right: 0px;
    z-index: 1;
    background-color: #b8c6d8;
    width: 15px;
    border-bottom-left-radius: 5px;
    border-top-left-radius: 5px;
}
</style>
