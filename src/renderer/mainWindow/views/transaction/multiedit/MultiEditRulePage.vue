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
                <gen-button
                    @click.prevent="cancel()"
                    size="small"
                    :disabled="$wait.waiting(waitType)"
                    >{{ $t('Cancel') }}</gen-button
                >
                <el-button
                    type="primary"
                    @click.prevent="next()"
                    size="small"
                    :disabled="$wait.waiting(waitType)"
                    >{{ $t('Next') }}</el-button
                >
            </template>
        </navbar>
        <div class="main-content">
            <v-wait :for="waitType">
                <template slot="waiting">
                    <div class="cash-loading-percent">
                        <el-progress type="circle" :percentage="c_progress"></el-progress>
                    </div>
                </template>
                <el-form ref="form" :model="d_form" label-width="150px">
                    <el-form-item :label="$t('Rules to apply')">
                        <generic-radio
                            :stringValue.sync="d_form.rulesToApply"
                            :optionList="cashRuleToApplyList"
                        />
                        <generic-multiple-autocomplete
                            v-if="d_form.rulesToApply === 'CUSTOM'"
                            :objectList.sync="d_form.selectedRuleList"
                            :optionList="c_ruleList"
                        />
                    </el-form-item>
                    <el-form-item :label="$t('Skip if no rule apply')">
                        <el-switch v-model="d_form.skipIfNoRuleApply" />
                    </el-form-item>
                </el-form>
            </v-wait>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import GenericMultipleAutocomplete from '../../../components/GenericMultipleAutocomplete.vue';
import GenericRadio from '../../../components/GenericRadio.vue';
import _ from 'lodash';
import CashRuleToApply from '../../../backend/database/entity/enumeration/CashRuleToApply';
import Navbar from '../../../components/Navbar.vue';
import TransactionParameters from '../../../components/genericparameters/TransactionParameters.vue';
import TransactionDateRangeParameters from '../../../components/genericparameters/TransactionDateRangeParameters.vue';
import GenButton from '../../../components/GenButton.vue';
import WaitType from '../../../backend/database/entity/enumeration/WaitType';

export default Vue.extend({
    name: 'multi-edit-rule-page',
    components: {
        GenericMultipleAutocomplete,
        GenericRadio,
        Navbar,
        TransactionParameters,
        TransactionDateRangeParameters,
        GenButton,
    },
    data(this: any) {
        return {
            d_form: {
                rulesToApply: _.clone(
                    this.$store.state.MultiEditTransaction.rulesToApply,
                ) as CashRuleToApply,
                selectedRuleList: _.clone(this.$store.state.MultiEditTransaction.selectedRuleList),
                skipIfNoRuleApply: _.clone(
                    this.$store.state.MultiEditTransaction.skipIfNoRuleApply,
                ),
            },
            cashRuleToApplyList: Object.keys(CashRuleToApply),
            waitType: WaitType.MULTI_EDIT_TRANSACTION,
        };
    },
    computed: {
        c_ruleList(this: any) {
            return this.$store.state.Rule.ruleList;
        },
        c_parameters(this: any) {
            return this.$store.state.TimeFrameData.parameters;
        },
        c_progress(this: any): number {
            return this.$store.state.MultiEditTransaction.progress;
        },
    },
    methods: {
        async next(this: any) {
            this.$wait.start(WaitType.MULTI_EDIT_TRANSACTION);
            try {
                await this.$store.dispatch('MultiEditTransaction/fillParameters', {
                    rulesToApply: this.d_form.rulesToApply,
                    selectedRuleList: this.d_form.selectedRuleList,
                    skipIfNoRuleApply: this.d_form.skipIfNoRuleApply,
                });
                await this.$store.dispatch('MultiEditTransaction/doMultiEdit');
                this.$router.push({ name: 'multi-edit-transaction-page' });
            } finally {
                this.$wait.end(WaitType.MULTI_EDIT_TRANSACTION);
            }
        },
        async cancel(this: any) {
            this.$router.go(-1);
        },
    },
    async created(this: any) {
        await this.$store.dispatch('Rule/fillRule');
        const transactionList = this.$route.params.transactionList;
        if (transactionList) {
            await this.$store.dispatch('MultiEditTransaction/initWipTransaction', transactionList);
        }
    },
});
</script>

<style lang="scss" scoped></style>
