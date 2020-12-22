<template>
    <div class="amount-wrapper">
        <div class="el-input el-input-group el-input-group--append">
            <el-input
                :value="d_amount"
                @input="onChangeAmount"
                :disabled="disabled"
                size="small"
                @blur="onBlur"
            ></el-input>
            <div class="el-input-group__append el-input__inner">
                <currency-autocomplete
                    slot="append"
                    :object="d_currency"
                    @update:object="onChangeCurrency"
                    :optionList="currencyList"
                    :disabled="disabled"
                    :fixed-width="true"
                    @blur="onBlur"
                />
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import CurrencyAutocomplete from '../views/currency/CurrencyAutocomplete.vue';
import CashCurrency from '../backend/database/entity/CashCurrency';
import PrintUtils from '../backend/utils/PrintUtils';

export default Vue.extend({
    name: 'generic-amount',
    components: {
        CurrencyAutocomplete,
    },
    props: {
        amount: [String, Number],
        currency: Object,
        currencyList: Array,
        disabled: Boolean,
    },
    data(this: any) {
        return {
            d_amount: PrintUtils.printNumber(this.amount),
            d_currency: this.currency,
        };
    },
    computed: {},
    methods: {
        onChangeAmount(this: any, newAmount: string) {
            this.d_amount = newAmount;
        },
        onChangeCurrency(this: any, newCurrency: CashCurrency) {
            this.$emit('update:currency', newCurrency);
        },
        onVisibleChange(this: any, isVisible: boolean) {
            if (!isVisible) {
                this.onBlur();
            }
        },
        onBlur(this: any) {
            const value = this.d_amount ? this.d_amount.replace(/[^0-9.]/g, '') : '0';
            this.d_amount = PrintUtils.printNumber(value);
            this.$emit('update:amount', this.d_amount.replace(/[^0-9.]/g, ''));
            setTimeout(() => this.$emit('blur'), 100);
        },
    },
});
</script>

<style lang="scss" scoped>
.el-input-group__append {
    width: 150px;
}
.amount-wrapper {
    width: 311px;
}
.el-input__inner {
    height: 20px;
    line-height: 20px;
    border-top-right-radius: 4px;
    border-bottom-right-radius: 4px;
}
</style>
