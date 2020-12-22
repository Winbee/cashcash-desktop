<template>
    <div class="generic-navbar">
        <div class="navbar-content start">
            <slot name="start"></slot>
        </div>
        <div class="navbar-content end">
            <slot name="end"></slot>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
    name: 'generic-navbar',
    components: {},
    data() {
        return {
            showMenuBurger: false,
        };
    },
    methods: {
        toggleSidebar() {
            this.showMenuBurger = !this.showMenuBurger;
        },
    },
});
</script>

<style lang="scss" scoped>
.generic-navbar {
    display: flex;
    flex-flow: row;
    justify-content: space-between;
    padding-bottom: 13px;
}

.navbar-content {
    flex: 0 1 auto;
    /* Shorthand for:
            flex-grow: 0,
            flex-shrink: 1,
            flex-basis: auto
         */
    display: flex;
    flex-flow: row;

    &.start {
        flex-flow: flex-start;
        .item {
            margin-right: 5px;
        }
    }

    &.end {
        flex-flow: flex-end;
        .item {
            margin-left: 5px;
        }
    }
}
</style>
