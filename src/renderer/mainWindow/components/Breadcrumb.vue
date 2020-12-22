<template>
    <el-breadcrumb class="app-breadcrumb" separator=">">
        <transition-group name="breadcrumb">
            <el-breadcrumb-item v-for="(item, index) in filteredLevelList" :key="item.path">
                <router-link v-if="isLink(item, index, levelList)" :to="item.path"
                    >{{ item.meta.title }}
                </router-link>
                <span v-else class="no-redirect">{{ item.meta.title }}</span>
            </el-breadcrumb-item>
        </transition-group>
    </el-breadcrumb>
</template>

<script lang="ts">
import VueRouter, { Route } from 'vue-router';

export default {
    created(this: any) {
        this.getBreadcrumb();
    },
    data() {
        return {
            levelList: null,
        };
    },
    watch: {
        $route(this: any) {
            this.getBreadcrumb();
        },
    },
    computed: {
        filteredLevelList(this: any) {
            return this.levelList.filter((item) => item.meta.title);
        },
    },
    methods: {
        getBreadcrumb(this: any) {
            const inverseLevelList = [this.$route];

            let routePath = (this.$route as Route).path;
            routePath = this.removeLastPart(routePath);
            while (routePath.length > 0) {
                const parentRoute = (this.$router as VueRouter).resolve(routePath);
                if (parentRoute) {
                    inverseLevelList.push(parentRoute.route);
                    routePath = this.removeLastPart(routePath);
                }
            }
            this.levelList = inverseLevelList.filter((item) => item.meta.title).reverse();
        },
        removeLastPart(url: string): string {
            /*
            - \/ match a slash
            - (  start of a captured group within the match
            - [^\/] match a non-slash character
            - + match one of more of the non-slash characters
            - )  end of the captured group
            - \/? allow one optional / at the end of the string
            - $  match to the end of the string
            */
            return url.replace(/\/([^\/]+)\/?$/, '');
        },
        isLink(item: Route, index: number, levelList: Route[]): boolean {
            return item.meta.redirect !== 'noredirect' && index !== levelList.length - 1;
        },
    },
};
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.app-breadcrumb.el-breadcrumb {
    display: inline-block;
    font-size: 16px;
    line-height: 50px;
    margin-left: 20px;
    .no-redirect {
        color: #97a8be;
        cursor: text;
    }
}
</style>
