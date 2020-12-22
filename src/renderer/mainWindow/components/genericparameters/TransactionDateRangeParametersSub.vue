<template>
    <div class="transaction-date-range-parameters-sub">
        <el-date-picker
            :value="dateRangeArray"
            @input="onInput"
            type="daterange"
            :start-placeholder="$t('Start date')"
            :end-placeholder="$t('End date')"
            :default-time="['00:00:00', nowTime]"
            :picker-options="datePickerOption"
            :clearable="false"
            :range-separator="$t('to')"
            size="small"
            @blur="onBlur"
            @keyup.enter.native="onBlur"
            @keyup.escape.native="onBlur"
            ref="el"
        ></el-date-picker>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import {
    startOfMonth,
    addMonths,
    startOfYear,
    addYears,
    format,
    endOfDay,
    startOfDay,
    endOfMonth,
    endOfYear,
    isSameMonth,
    isSameYear,
    isAfter,
} from 'date-fns';
import DateUtils from '../../backend/utils/DateUtils';

export default Vue.extend({
    name: 'transaction-date-range-parameters-sub',
    components: {},
    props: {
        dateRangeArray: Array,
        autofocus: Boolean,
    },
    data(this: any) {
        return {
            datePickerOption: {
                disabledDate: (date) => {
                    return date >= this.now;
                },
                shortcuts: [
                    {
                        text: this.$t('this month'),
                        onClick: (picker) => {
                            const end = this.now;
                            const start = startOfMonth(end);
                            picker.$emit('pick', [start, end]);
                        },
                    },
                    {
                        text: this.$t('this 6 months'),
                        onClick: (picker) => {
                            const end = this.now;
                            const start = startOfMonth(addMonths(end, -5));
                            picker.$emit('pick', [start, end]);
                        },
                    },
                    {
                        text: this.$t('this year'),
                        onClick: (picker) => {
                            const end = this.now;
                            const start = startOfYear(end);
                            picker.$emit('pick', [start, end]);
                        },
                    },
                    {
                        text: this.$t('this 2 years'),
                        onClick: (picker) => {
                            const end = this.now;
                            const start = startOfYear(addYears(end, -1));
                            picker.$emit('pick', [start, end]);
                        },
                    },
                    {
                        text: '-',
                        onClick: (picker) => {},
                    },
                    {
                        text: this.$t('prev. month'),
                        onClick: (picker) => {
                            const transactionDateFrom = this.$store.state.TimeFrameData.parameters
                                .transactionDateFrom;
                            const end = endOfMonth(addMonths(transactionDateFrom, -1));
                            const start = startOfMonth(end);
                            picker.$emit('pick', [start, end]);
                        },
                    },
                    {
                        text: this.$t('next month'),
                        onClick: (picker) => {
                            const transactionDateTo = this.$store.state.TimeFrameData.parameters
                                .transactionDateTo;
                            let end = endOfMonth(addMonths(transactionDateTo, 1));
                            if (isAfter(end, this.now)) {
                                end = this.now;
                            }
                            const start = startOfMonth(end);
                            picker.$emit('pick', [start, end]);
                        },
                    },
                    {
                        text: this.$t('prev. year'),
                        onClick: (picker) => {
                            const transactionDateFrom = this.$store.state.TimeFrameData.parameters
                                .transactionDateFrom;
                            const end = endOfYear(addYears(transactionDateFrom, -1));
                            const start = startOfYear(end);
                            picker.$emit('pick', [start, end]);
                        },
                    },
                    {
                        text: this.$t('next year'),
                        onClick: (picker) => {
                            const transactionDateTo = this.$store.state.TimeFrameData.parameters
                                .transactionDateTo;
                            let end = endOfYear(addYears(transactionDateTo, 1));
                            if (isAfter(end, this.now)) {
                                end = this.now;
                            }
                            const start = startOfYear(end);
                            picker.$emit('pick', [start, end]);
                        },
                    },
                ],
            },
        };
    },
    computed: {
        now() {
            return DateUtils.newDate();
        },
        nowTime(this: any) {
            return DateUtils.formatTime(this.now);
        },
    },
    methods: {
        onInput(this: any, value) {
            const finalValue = [startOfDay(value[0]), endOfDay(value[1])];
            this.$emit('input', finalValue);
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
    async created(this: any) {},
});
</script>

<style lang="scss" scoped></style>
