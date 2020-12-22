<template>
    <div class="enum-autocomplete">
        <el-select
            v-model="d_stringValue"
            filterable
            :placeholder="$t('Select')"
            @change="(option) => $emit('update:stringValue', option)"
            size="small"
            @visible-change="onVisibleChange"
            @blur="onBlur"
            :disabled="disabled"
        >
            <el-option
                v-for="item in optionList"
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
    name: 'enum-autocomplete',
    components: {},
    props: {
        stringValue: String,
        optionList: Array,
        disabled: Boolean,
    },
    data(this: any) {
        return {
            d_stringValue: this.stringValue,
        };
    },
    computed: {},
    methods: {
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
