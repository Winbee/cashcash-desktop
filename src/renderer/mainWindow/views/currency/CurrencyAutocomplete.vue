<template>
    <div class="currency-autocomplete">
        <el-select
            v-model="d_object"
            :placeholder="$t('Select currency')"
            filterable
            :value-key="'id'"
            @change="onInput"
            :disabled="disabled"
            :style="{ width: fixedWidth ? '180px' : undefined }"
            @visible-change="onVisibleChange"
            @blur="onBlur"
            size="small"
            ref="el"
        >
            <el-option
                v-for="item in optionList"
                :key="item.id"
                :label="item.symbol + ' - ' + item.name"
                :value="item"
            >
                <span style="float: left; padding-right: 5px">{{ item.symbol }}</span>
                <span style="float: right; color: #98a7bc">{{ item.name }}</span>
            </el-option>
        </el-select>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import CashCurrency from '../../backend/database/entity/CashCurrency';

export default Vue.extend({
    name: 'currency-autocomplete',
    components: {},
    props: {
        object: Object,
        optionList: Array,
        disabled: Boolean,
        fixedWidth: Boolean,
        autofocus: Boolean,
    },
    data(this: any) {
        return {
            d_object: this.object,
        };
    },
    computed: {},
    methods: {
        onInput(this: any, option: CashCurrency) {
            this.$emit('update:object', option);
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
