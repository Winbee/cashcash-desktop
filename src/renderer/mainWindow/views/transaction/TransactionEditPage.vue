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
                <gen-tooltip :content="$t('Find similar transactions')">
                    <gen-button @click.prevent="findSimilar()" size="small" circle>
                        <fa icon="search" fixed-width></fa>
                    </gen-button>
                </gen-tooltip>
                <gen-tooltip :content="$t('Apply rules')">
                    <gen-button @click.prevent="applyRules()" size="small" circle>
                        <fa icon="clipboard-list" fixed-width></fa>
                    </gen-button>
                </gen-tooltip>
                <el-divider direction="vertical"></el-divider>
                <gen-button @click.prevent="cancel()" size="small">{{ $t('Cancel') }}</gen-button>
                <el-button type="primary" @click.prevent="submitForm()" size="small">{{
                    $t('Save')
                }}</el-button>
            </template>
        </navbar>
        <div class="main-content">
            <el-form v-if="wipTransaction" label-width="120px" ref="form" :model="wipTransaction">
                <transaction-edit-component
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
import TransactionEditComponent from './TransactionEditComponent.vue';
import { Container } from 'typedi';
import CashRuleService from '../../backend/service/CashRuleService';
import Navbar from '../../components/Navbar.vue';
import TransactionParameters from '../../components/genericparameters/TransactionParameters.vue';
import TransactionDateRangeParameters from '../../components/genericparameters/TransactionDateRangeParameters.vue';
import CashFilterUtils from '../../backend/utils/CashFilterUtils';
import GenButton from '../../components/GenButton.vue';
import GenTooltip from '../../components/GenTooltip.vue';

export default Vue.extend({
    name: 'transaction-edit-page',
    components: {
        TransactionEditComponent,
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
        async applyRules(this: any) {
            const service = Container.get(CashRuleService);
            const clone = _.cloneDeep(this.wipTransaction);
            this.wipTransaction = null;
            await service.assignWithRules(
                clone as FlatCashTransaction,
                this.$store.state.PermanentData.accountMap,
                this.$store.getters['PermanentData/tagMap'],
            );
            this.wipTransaction = clone;
        },
        async findSimilar(this: any) {
            const jsonFilter = CashFilterUtils.initFromTransaction(
                this.wipTransaction as FlatCashTransaction,
            );
            const filter = CashFilterUtils.convertToParameters(jsonFilter.jsonFilter);
            this.$store.dispatch('TimeFrameData/updateParameters', filter);
            this.$router.push({ name: 'transaction-page' });
        },
        async save(this: any) {
            await this.$store.dispatch('Transaction/saveTransaction', this.wipTransaction);
            this.$router.push({ name: 'transaction-page' });
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
        await this.$store.dispatch('Transaction/initWipTransaction', { transactionId, duplicate });
        this.wipTransaction = _.cloneDeep(this.$store.state.Transaction.wipTransaction);
    },
});
</script>
