<template>
    <div>
        <el-form-item :label="$t('Name')" prop="name" :rules="rules.name">
            <el-input
                v-model="d_wipFilter.name"
                v-autosize="d_wipFilter.name"
                size="small"
            ></el-input>
        </el-form-item>
        <generic-parameters
            class="edited-generic-parameters"
            :parameters="d_wipParameter"
            @update:parameters="(newValue) => $emit('update:wipParameter', newValue)"
            :actionableParameters="[
                'searchString',
                'detailSearchString',
                'account',
                'fromAccount',
                'toAccount',
                'currency',
                'amountEquals',
                'amountLessThan',
                'amountGreaterThan',
                'transactionType',
            ]"
            isTransaction
        />
        <el-form-item v-if="d_wipFilter.createdDate" :label="$t('Created at')">
            <div>{{ formatDate(wipFilter.createdDate) }}</div>
        </el-form-item>
        <el-form-item v-if="d_wipFilter.updatedDate" :label="$t('Updated at')">
            <div>{{ formatDate(wipFilter.updatedDate) }}</div>
        </el-form-item>
        <el-form-item v-if="d_relatedRule" :label="$t('Related rule')">
            <div class="related-rule-group">
                <div>{{ d_relatedRule.name }}</div>
                <div v-if="d_relatedRule" class="rule-button-wrapper">
                    <gen-button size="small" @click.prevent="editRule()">{{
                        $t('edit.rule.in.filter')
                    }}</gen-button>
                </div>
            </div>
        </el-form-item>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import _ from 'lodash';
import CashFilter from '../../backend/database/entity/CashFilter';
import Navbar from '../../components/Navbar.vue';
import GenericParameters from '../../components/genericparameters/GenericParameters.vue';
import CashFilterUtils from '../../backend/utils/CashFilterUtils';
import GenButton from '../../components/GenButton.vue';
import PrintUtils from '../../backend/utils/PrintUtils';
import DateUtils from '../../backend/utils/DateUtils';
import { TransactionParameters } from '../../backend/service/dto/Parameters';

export default Vue.extend({
    name: 'filter-edit-component',
    components: {
        Navbar,
        GenericParameters,
        GenButton,
    },
    props: {
        wipFilter: {
            type: Object as () => CashFilter,
            required: false,
        },
        wipParameter: {
            type: Object as () => TransactionParameters,
            required: false,
        },
    },
    data(this: any) {
        return {
            d_wipFilter: this.wipFilter,
            d_wipParameter: this.wipParameter,
            d_relatedRule: null,
            rules: {
                name: [
                    {
                        type: 'string',
                        whitespace: true,
                        message: this.$t('Whitespace only is not possible'),
                        trigger: 'blur',
                    },
                    {
                        min: 3,
                        max: 20,
                        message: this.$t('Length should be between 3 and 20'),
                        trigger: 'blur',
                    },
                    {
                        type: 'string',
                        required: true,
                        message: this.$t('Please define a name'),
                        trigger: 'blur',
                    },
                ],
            },
        };
    },
    methods: {
        formatDate(this: any, dateObj: Date): string {
            return DateUtils.formatHumanDate(dateObj);
        },
        editRule(this: any) {
            this.$router.push({
                name: 'rule-edit-page',
                params: { ruleId: this.d_relatedRule.id },
            });
        },
    },
    async created(this: any) {
        const ruleList = await this.wipFilter.cashRuleList;
        if (ruleList.length > 0) {
            this.d_relatedRule = ruleList[0];
        }
    },
});
</script>

<style lang="scss" scoped>
.edited-generic-parameters {
    padding-left: 76px;
    padding-bottom: 22px;
}

.related-rule-group {
    display: flex;
    flex-direction: row;

    .rule-button-wrapper {
        margin-left: 8px;
    }
}
</style>
