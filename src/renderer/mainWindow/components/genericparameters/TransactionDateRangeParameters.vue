<template>
    <div class="transaction-date-range-parameters">
        <transition name="expand" mode="out-in">
            <div v-if="edit" key="date-selector">
                <transaction-date-range-parameters-sub
                    :dateRangeArray="c_dateRange"
                    @input="onInput"
                    @blur="onBlur"
                    autofocus
                ></transaction-date-range-parameters-sub>
            </div>
            <div v-else key="button">
                <gen-button class="date-button" size="small" @click="edit = true">
                    <fa :icon="'calendar-alt'" fixed-width></fa>
                    {{ label }}
                </gen-button>
            </div>
        </transition>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import TransactionDateRangeParametersSub from './TransactionDateRangeParametersSub.vue';
import PrintUtils from '../../backend/utils/PrintUtils';
import GenButton from '../GenButton.vue';
import DateUtils from '../../backend/utils/DateUtils';

export default Vue.extend({
    name: 'transaction-date-range-parameters',
    components: {
        TransactionDateRangeParametersSub,
        GenButton,
    },
    props: {},
    data(this: any) {
        return {
            edit: false,
        };
    },
    computed: {
        c_dateRange(this: any) {
            return [
                this.$store.state.TimeFrameData.parameters.transactionDateFrom,
                this.$store.state.TimeFrameData.parameters.transactionDateTo,
            ];
        },
        label(this: any) {
            const fromDateString = DateUtils.formatHumanDate(this.c_dateRange[0]);
            const toDateString = DateUtils.formatHumanDate(this.c_dateRange[1]);
            return this.$t('{fromDateString} to {toDateString}', { fromDateString, toDateString });
        },
    },
    methods: {
        onInput(this: any, value) {
            this.$store.dispatch('TimeFrameData/updateDateRange', value);
            this.$emit('update:dateRange', value);
        },
        onBlur(this: any) {
            setTimeout(() => (this.edit = false), 100);
        },
    },
    async created(this: any) {},
});
</script>

<style lang="scss" scoped>
.transaction-date-range-parameters {
    width: 350px;
    display: flex;
    justify-content: flex-end;
    align-items: center;
}

.expand-enter-active,
.expand-leave-active {
    transition: all 0.2s ease;
}
.expand-enter, .expand-leave-to /* .fade-leave-active below version 2.1.8 */ {
    transform: translateX(10px);
    opacity: 0;
}
</style>
