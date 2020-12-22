<template>
    <div class="generic-input-number">
        <el-input-number
            :value="number"
            :controls="controls"
            @input="onInput"
            @blur="onBlur"
            @keyup.enter.native="onBlur"
            @keyup.escape.native="onBlur"
            size="small"
            :min="min"
            :placeholder="placeholder"
            ref="el"
        ></el-input-number>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
    name: 'generic-input-number',
    components: {},
    props: {
        number: Number,
        autofocus: Boolean,
        min: Number,
        placeholder: String,
        controls: Boolean,
    },
    methods: {
        onInput(this: any, value) {
            this.$emit('update:number', value);
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
