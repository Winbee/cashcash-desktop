<template>
    <div class="generic-tag-autocomplete">
        <el-select
            v-model="d_selectedIdList"
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
                :key="item.id"
                :label="item.name"
                :value="item.id"
            ></el-option>
        </el-select>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
    name: 'generic-tag-autocomplete',
    components: {},
    props: {
        selectedIdList: Array,
        optionObjectList: Array,
        disabled: Boolean,
    },
    data(this: any) {
        return {
            d_selectedIdList: this.selectedIdList,
        };
    },
    methods: {
        onInput(this: any, value) {
            this.$emit('update:selectedIdList', this.d_selectedIdList);
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
