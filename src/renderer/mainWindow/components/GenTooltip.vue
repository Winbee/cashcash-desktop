<template>
    <el-tooltip
        effect="dark"
        :content="content"
        :placement="placement || 'bottom'"
        :disabled="c_disabled"
    >
        <slot></slot>
    </el-tooltip>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
    name: 'gen-tooltip',
    components: {},
    props: {
        content: String,
        placement: String,
    },
    data(this: any) {
        return {};
    },
    computed: {
        c_disabled(this: any) {
            return false;
        },
    },
    methods: {},
});
</script>
