<template>
    <button
        class="el-button gen-button"
        @click="handleClick"
        :disabled="buttonDisabled || loading"
        :autofocus="autofocus"
        :type="nativeType"
        :class="[
            type ? 'el-button--' + type : '',
            buttonSize ? 'el-button--' + buttonSize : '',
            {
                'is-disabled': buttonDisabled,
                'is-loading': loading,
                'is-plain': plain,
                'is-round': round,
                'is-circle': circle,
            },
        ]"
    >
        <i class="el-icon-loading" v-if="loading"></i>
        <i :class="icon" v-if="icon && !loading"></i>
        <span v-if="$slots.default">
            <slot></slot>
        </span>
    </button>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
    name: 'gen-button',
    components: {},
    props: {
        type: {
            type: String,
            default: 'default',
        },
        size: String,
        icon: {
            type: String,
            default: '',
        },
        nativeType: {
            type: String,
            default: 'button',
        },
        loading: Boolean,
        disabled: Boolean,
        plain: Boolean,
        autofocus: Boolean,
        round: Boolean,
        circle: Boolean,
    },
    data(this: any) {
        return {};
    },
    computed: {
        buttonSize(this: any) {
            return this.size;
        },
        buttonDisabled(this: any) {
            return this.disabled;
        },
    },
    methods: {
        handleClick(evt) {
            this.$emit('click', evt);
        },
    },
});
</script>
