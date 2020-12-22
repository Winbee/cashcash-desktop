<template>
    <div class="generic-date-picker">
        <el-date-picker
            v-model="d_dateObject"
            type="datetime"
            :placeholder="placeholder"
            default-time="00:00:00"
            @change="onInput"
            :disabled="disabled"
            :clearable="clearable"
            @blur="onBlur"
            size="small"
            ref="el"
        ></el-date-picker>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
    name: 'generic-date-picker',
    components: {},
    props: {
        dateObject: Date,
        placeholder: String,
        disabled: Boolean,
        clearable: Boolean,
        autofocus: Boolean,
    },
    data(this: any) {
        return {
            d_dateObject: this.dateObject,
        };
    },
    methods: {
        onInput(this: any) {
            this.$emit('update:dateObject', this.d_dateObject);
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
