<template>
    <div class="menu-wrapper">
        <template v-for="item in filteredRoutes">
            <router-link
                v-if="
                    hasOneShowingChildren(item.children) &&
                    !hasShowingChildren(item.children[0].children) &&
                    !item.alwaysShow
                "
                :to="item.path + '/' + item.children[0].path"
                :key="item.children[0].name"
            >
                <el-menu-item
                    :index="item.path + '/' + item.children[0].path"
                    :class="{
                        'submenu-title-noDropdown': !isNest,
                        isNormal: !item.children[0].meta.isHeader,
                    }"
                >
                    <svg-icon
                        v-if="item.children[0].meta && item.children[0].meta.icon"
                        :icon-class="item.children[0].meta.icon"
                        :class="{ big: item.children[0].meta.isHeader }"
                    ></svg-icon>
                    <span
                        v-if="item.children[0].meta && item.children[0].meta.title"
                        slot="title"
                        :class="{ h1: item.children[0].meta.isHeader }"
                        >{{ getTranslatedTitle(item.children[0].meta.title) }}</span
                    >
                </el-menu-item>
            </router-link>

            <el-submenu
                v-else
                :index="item.name || item.path"
                :key="item.name"
                :class="{ isNormal: !item.children[0].meta.isHeader }"
            >
                <template slot="title">
                    <svg-icon
                        v-if="item.meta && item.meta.icon"
                        :icon-class="item.meta.icon"
                    ></svg-icon>
                    <span v-if="item.meta && item.meta.title" slot="title">{{
                        getTranslatedTitle(item.meta.title)
                    }}</span>
                </template>

                <template v-for="child in item.children" v-if="!child.hidden">
                    <sidebar-item
                        :is-nest="true"
                        class="nest-menu"
                        v-if="
                            child.children &&
                            child.children.length > 0 &&
                            hasShowingChildren(child.children)
                        "
                        :routes="[child]"
                        :key="child.path"
                    ></sidebar-item>

                    <router-link v-else :to="item.path + '/' + child.path" :key="child.name">
                        <el-menu-item
                            :index="item.path + '/' + child.path"
                            :class="{ isNormal: !item.children[0].meta.isHeader }"
                        >
                            <svg-icon
                                v-if="child.meta && child.meta.icon"
                                :icon-class="child.meta.icon"
                            ></svg-icon>
                            <span v-if="child.meta && child.meta.title" slot="title">{{
                                getTranslatedTitle(child.meta.title)
                            }}</span>
                        </el-menu-item>
                    </router-link>
                </template>
            </el-submenu>
        </template>
    </div>
</template>

<script lang="ts">
import VueI18n from 'vue-i18n';
export default {
    name: 'SidebarItem',
    props: {
        routes: {
            type: Array,
        },
        isNest: {
            type: Boolean,
            default: false,
        },
    },
    computed: {
        filteredRoutes(this: any) {
            return this.routes.filter((item) => !item.hidden && item.children);
        },
    },
    methods: {
        hasOneShowingChildren(children) {
            const showingChildren = children.filter((item) => {
                return !item.hidden;
            });
            if (showingChildren.length === 1) {
                return true;
            }
            return false;
        },
        hasShowingChildren(children) {
            if (!children) {
                return false;
            }
            const showingChildren = children.filter((item) => {
                return !item.hidden;
            });
            return showingChildren.length !== 0;
        },
        getTranslatedTitle(this: any, title: string) {
            switch (title) {
                case 'Loading':
                    return this.$t('Loading');
                case 'Not found':
                    return this.$t('Not found');
                case 'Internal accounts':
                    return this.$t('Internal accounts');
                case 'External accounts':
                    return this.$t('External accounts');
                case 'Edit':
                    return this.$t('Edit');
                case 'Transactions':
                    return this.$t('Transactions');
                case 'Import File':
                    return this.$t('Import File');
                case 'Import transaction':
                    return this.$t('Import transaction');
                case 'Multi edit rule selection':
                    return this.$t('Multi edit rule selection');
                case 'Multi edit transaction':
                    return this.$t('Multi edit transaction');
                case 'Rates':
                    return this.$t('Rates');
                case 'Budget':
                    return this.$t('Budget');
                case 'Filters':
                    return this.$t('Filters');
                case 'Rules':
                    return this.$t('Rules');
                case 'Import':
                    return this.$t('Import');
                case 'Preferences':
                    return this.$t('Preferences');
                default:
                    return title;
            }
        },
    },
};
</script>

<style lang="scss" scoped></style>
