<template>
    <div :id="'tree-item-' + account.id" class="tree-item">
        <span>
            <fa :icon="getIconName()" fixed-width></fa>
            {{ account.name }}
        </span>
        <span class="sum" v-if="hasSum()">{{ getSum() }}</span>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import CashAccountType from '../../backend/database/entity/enumeration/CashAccountType';
import CashAccountUtils from '../../backend/utils/CashAccountUtils';
import PrintUtils from '../../backend/utils/PrintUtils';

export default Vue.extend({
    name: 'tree-item',
    props: {
        account: Object,
    },
    components: {},
    data(this: any) {
        return {};
    },
    computed: {
        c_currencyMap(this: any) {
            return this.$store.getters['PermanentData/currencyMap'];
        },
        c_preferences(this: any) {
            return this.$store.state.App.preferences;
        },
    },
    methods: {
        hasSum(this: any): boolean {
            return (
                !this.account.isDirectory &&
                (this.account.type === CashAccountType.ASSET ||
                    this.account.type === CashAccountType.LIABILITY ||
                    this.account.type === CashAccountType.OPENING)
            );
        },
        getSum(this: any): string {
            const key = CashAccountUtils.generateKey(
                this.account.id,
                this.c_preferences.preferedCurrency.id,
            );
            const splitSum = this.$store.getters['TimeFrameData/splitSumMap'].get(key);
            if (splitSum) {
                return PrintUtils.printAmount(
                    splitSum.originalAmount,
                    splitSum.originalCurrencyId,
                    this.c_currencyMap,
                );
            } else {
                return PrintUtils.printAmount('0', this.account.currencyId, this.c_currencyMap);
            }
        },
        getIconName(this: any) {
            return this.account.isDirectory ? 'folder-open' : 'book';
        },
    },
});
</script>

<style lang="scss" scoped>
.sum {
    background-color: #409eff;
    border-radius: 10px;
    color: #fff;
    display: inline-block;
    font-size: 12px;
    height: 18px;
    line-height: 18px;
    padding: 0 6px;
    text-align: center;
    white-space: nowrap;
}
.tree-item {
    padding-right: 5px;
    user-select: none;
}
</style>
