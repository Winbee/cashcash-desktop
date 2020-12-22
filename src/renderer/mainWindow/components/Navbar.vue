<template>
    <div class="navbar-wrapper">
        <div class="line first-line">
            <div class="left">
                <slot name="first-line-left"></slot>
            </div>
            <div class="right">
                <slot name="first-line-right"></slot>
            </div>
        </div>
        <div class="line second-line">
            <div class="left">
                <slot name="second-line-left"></slot>
            </div>
            <div class="right">
                <slot name="second-line-right"></slot>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
export default {
    components: {},
};
</script>

<style lang="scss" scoped>
.navbar-wrapper {
    z-index: 5;
    background: #f5f7fa;
    box-shadow: 0 2px 4px -1px rgba(0, 0, 0, 0.2), 0 4px 5px 0 rgba(0, 0, 0, 0.14),
        0 1px 10px 0 rgba(0, 0, 0, 0.12);
}

.line {
    flex: 0 1 auto;
    /* Shorthand for:
            flex-grow: 0,
            flex-shrink: 1,
            flex-basis: auto
         */
    display: flex;
    flex-flow: row;
    padding: 10px 20px 5px;
    justify-content: space-between;

    .left {
        display: flex;
        flex-flow: row;
        justify-content: flex-start;
        align-items: center;
        width: 100%;
        margin-right: 10px;
    }

    .right {
        display: flex;
        flex-flow: row;
        justify-content: flex-end;
        align-items: center;
    }
}
</style>
