<template>
    <div class="main-wrapper">
        <navbar>
            <template slot="first-line-left">
                <transaction-parameters :routeAfterUpdate="'transaction-page'" />
            </template>
            <template slot="first-line-right">
                <transaction-date-range-parameters />
            </template>
            <template slot="second-line-left">
                <gen-button @click.prevent="cancel()" size="small">{{$t('Cancel')}}</gen-button>
                <el-button type="primary" @click.prevent="submitForm()" size="small"
                    >{{$t('Save')}}</el-button
                >
            </template>
        </navbar>
        <div class="main-content">
            <el-form v-if="wipTransaction" label-width="120px" ref="form" :model="wipTransaction">
                <budget-transaction-edit-component
                    :wipTransaction="wipTransaction"
                    @validate="validateProp"
                />
            </el-form>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import _ from 'lodash';
import FlatCashTransaction from '../../backend/database/entity/proxy/FlatCashTransaction';
import BudgetTransactionEditComponent from './BudgetTransactionEditComponent.vue';
import { Container } from 'typedi';
import CashRuleService from '../../backend/service/CashRuleService';
import Navbar from '../../components/Navbar.vue';
import TransactionParameters from '../../components/genericparameters/TransactionParameters.vue';
import TransactionDateRangeParameters from '../../components/genericparameters/TransactionDateRangeParameters.vue';
import CashFilterUtils from '../../backend/utils/CashFilterUtils';
import GenButton from '../../components/GenButton.vue';
import GenTooltip from '../../components/GenTooltip.vue';

export default Vue.extend({
    name: 'budget-transaction-edit-page',
    components: {
        BudgetTransactionEditComponent,
        Navbar,
        TransactionParameters,
        TransactionDateRangeParameters,
        GenButton,
        GenTooltip,
    },
    data() {
        return {
            wipTransaction: null as FlatCashTransaction | null,
            isLoaded: false,
        };
    },
    computed: {
        c_parameters(this: any) {
            return this.$store.state.TimeFrameData.parameters;
        },
        c_dateRange(this: any) {
            return [
                this.$store.state.TimeFrameData.parameters.transactionDateFrom,
                this.$store.state.TimeFrameData.parameters.transactionDateTo,
            ];
        },
    },
    methods: {
        async submitForm(this: any) {
            const isValid = await new Promise((resolve, reject) => {
                this.$refs['form'].validate((valid, errorObject) => {
                    if (valid) {
                        resolve(true);
                    } else {
                        resolve(false);
                    }
                });
            });
            if (isValid) {
                this.save();
            }
        },
        async save(this: any) {
            await this.$store.dispatch('BudgetTransaction/saveTransaction', this.wipTransaction);
            this.$router.push({ name: 'budget-transaction-page' });
        },
        async cancel(this: any) {
            this.$router.go(-1);
        },
        validateProp(this: any, propName) {
            this.$refs['form'].validateField(propName);
        },
    },
    async created(this: any) {
        const transactionId = this.$route.params.transactionId;
        const duplicate = this.$route.params.duplicate;
        await this.$store.dispatch('BudgetTransaction/initWipTransaction', {
            transactionId,
            duplicate,
        });
        this.wipTransaction = _.cloneDeep(this.$store.state.BudgetTransaction.wipTransaction);
    },
});
</script>
