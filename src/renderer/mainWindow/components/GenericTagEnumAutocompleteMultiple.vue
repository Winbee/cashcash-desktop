<template>
    <div class="generic-tag-enum-autocomplete-multiple">
        <el-select
            v-model="d_selectedStringList"
            multiple
            filterable
            default-first-option
            :placeholder="$t('Add a filter')"
            @change="onInput"
            @visible-change="onVisibleChange"
            @blur="onBlur"
            size="small"
            :disabled="disabled"
        >
            <el-option
                v-for="item in optionObjectList"
                :key="item"
                :label="item"
                :value="item"
            ></el-option>
        </el-select>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
    name: 'generic-tag-enum-autocomplete-multiple',
    components: {},
    props: {
        selectedStringList: Array,
        optionObjectList: Array,
        disabled: Boolean,
    },
    data(this: any) {
        return {
            d_selectedStringList: this.selectedStringList,
        };
    },
    methods: {
        onInput(this: any, value) {
            this.$emit('update:selectedStringList', this.d_selectedStringList);
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
});
</script>

<style lang="scss" scoped></style>
