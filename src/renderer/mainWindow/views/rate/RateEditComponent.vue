<template>
    <div>
        <el-form-item :label="$t('From currency')" prop="fromCurrency">
            <currency-autocomplete
                :object.sync="wipRate.fromCurrency"
                :optionList="c_currencyList"
            />
        </el-form-item>
        <el-form-item :label="$t('To currency')" prop="toCurrency">
            <currency-autocomplete :object.sync="wipRate.toCurrency" :optionList="c_currencyList" />
        </el-form-item>
        <el-form-item :label="$t('Rate')" prop="rate">
            <el-input-number
                v-model="wipRate.rate"
                controls-position="right"
                :min="0"
                size="small"
            />
        </el-form-item>
        <el-form-item v-if="wipRate.createdDate" :label="$t('Created at')">
            <div>{{ formatDate(wipRate.createdDate) }}</div>
        </el-form-item>
        <el-form-item v-if="wipRate.updatedDate" :label="$t('Updated at')">
            <div>{{ formatDate(wipRate.updatedDate) }}</div>
        </el-form-item>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import CurrencyAutocomplete from '../currency/CurrencyAutocomplete.vue';
import GenericDatePicker from '../../components/GenericDatePicker.vue';
import CashRate from '../../backend/database/entity/CashRate';
import PrintUtils from '../../backend/utils/PrintUtils';
import DateUtils from '../../backend/utils/DateUtils';

export default Vue.extend({
    name: 'rate-edit-component',
    components: {
        CurrencyAutocomplete,
        GenericDatePicker,
    },
    props: {
        wipRate: {
            type: Object as () => CashRate,
            required: true,
        },
    },
    data(this: any) {
        return {};
    },
    computed: {
        c_currencyList(this: any) {
            return this.$store.state.PermanentData.currencyList;
        },
    },
    methods: {
        formatDate(this: any, dateObj: Date): string {
            return DateUtils.formatHumanDate(dateObj);
        },
    },
});
</script>
