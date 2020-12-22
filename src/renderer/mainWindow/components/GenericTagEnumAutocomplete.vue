<template>
    <div class="generic-tag-enum-autocomplete">
        <el-select
            v-model="d_selectedString"
            filterable
            default-first-option
            :placeholder="$t('Add a filter')"
            @change="onInput"
            @visible-change="onVisibleChange"
            @blur="onBlur"
            size="small"
            :disabled="disabled"
            ref="el"
        >
            <el-option
                v-for="item in optionObjectList"
                :key="item.value"
                :label="item.label"
                :value="item.value"
            ></el-option>
        </el-select>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
    name: 'generic-tag-enum-autocomplete',
    components: {},
    props: {
        selectedString: String,
        optionObjectList: Array,
        disabled: Boolean,
        autofocus: Boolean,
    },
    data(this: any) {
        return {
            d_selectedString: this.selectedString,
        };
    },
    methods: {
        onInput(this: any, value) {
            this.$emit('update:selectedString', this.d_selectedString);
        },
        onVisibleChange(this: any, isVisible: boolean) {
            if (!isVisible) {
                this.onBlur();
            }
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
