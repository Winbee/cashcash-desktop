<template>
    <div class="generic-input">
        <el-input
            :value="string"
            v-autosize="string"
            :placeholder="placeholder"
            clearable
            size="small"
            @input="onInput"
            @blur="onBlur"
            @keyup.enter.native="onBlur"
            @keyup.escape.native="onBlur"
            @clear="$emit('clear')"
            ref="el"
        />
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import i18n from '@/renderer/common/i18n/i18n';

export default Vue.extend({
    name: 'generic-input',
    components: {},
    props: {
        string: String,
        autofocus: Boolean,
        placeholder: {
            default: i18n.t('Description'),
            type: String,
        },
    },
    methods: {
        onInput(this: any, value) {
            this.$emit('update:string', value);
        },
        onBlur(this: any) {
            setTimeout(() => this.$emit('blur'), 100);
        },
    },
    mounted(this: any) {
        if (this.autofocus) {
            this.$refs.el.focus();
        }
    },
});
</script>

<style lang="scss" scoped></style>
