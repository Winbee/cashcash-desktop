<template>
    <div class="complex-form-item">
        <div class="left el-form-item__label">{{ label }}</div>
        <div :class="{ 'right': true, 'with-background': withBackground }">
            <slot></slot>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
    name: 'complex-form-item',
    components: {},
    props: {
        label: String,
        withBackground: Boolean,
    },
    data(this: any) {
        return {};
    },
    methods: {},
});
</script>
<style lang="scss" scoped>
.complex-form-item {
    display: flex;
    flex-flow: row;
    margin-bottom: 10px;

    .left {
        width: 120px;
        flex-shrink: 0;
    }
    .right {
        flex-grow: 1;
        display: flex;
        flex-flow: column;
    }
    .with-background {
        background-color: #f0f3f7;
        border-radius: 3px;
    }
}
</style>
