<template>
    <div :id="'edit-transaction-' + index">
        <el-form-item :label="$t('Type')" :prop="getProp('type')" :rules="typeRule">
            <generic-tag-enum-autocomplete
                :selectedString.sync="wipTransaction.type"
                :optionObjectList="c_typeList"
                :disabled="isDisabled"
            />
        </el-form-item>
        <el-form-item
            :label="$t('Description')"
            :prop="getProp('description')"
            :rules="descriptionRule"
        >
            <el-input
                v-model="wipTransaction.description"
                :disabled="isDisabled"
                v-autosize="wipTransaction.description"
                size="small"
            ></el-input>
        </el-form-item>
        <el-form-item :label="$t('Detail')" :prop="getProp('detail')" :rules="detailRule">
            <el-input
                type="textarea"
                :autosize="{ minRows: 2, maxRows: 8 }"
                :maxlength="1000"
                v-model="wipTransaction.detail"
                :disabled="isDisabled"
                size="small"
            ></el-input>
        </el-form-item>
        <el-form-item
            :label="$t('Date')"
            :prop="getProp('transactionDate')"
            :rules="transactionDateRule"
        >
            <generic-date-picker
                :dateObject.sync="wipTransaction.transactionDate"
                :placeholder="$t('Select a date')"
                :disabled="isDisabled"
            />
        </el-form-item>
        <el-form-item
            :label="$t('From account')"
            :prop="getProp('outAccount')"
            :rules="outAccountRule"
        >
            <account-autocomplete
                :object.sync="wipTransaction.outAccount"
                :optionList="outAccountList"
                :disabled="isDisabled"
                @blur="
                    () => {
                        $emit('validate', getProp('outAccount'));
                        updateCurrencies();
                    }
                "
            />
        </el-form-item>
        <el-form-item :label="$t('To account')" :prop="getProp('inAccount')" :rules="inAccountRule">
            <account-autocomplete
                :object.sync="wipTransaction.inAccount"
                :optionList="inAccountList"
                :disabled="isDisabled"
                @blur="
                    () => {
                        $emit('validate', getProp('inAccount'));
                        updateCurrencies();
                    }
                "
            />
        </el-form-item>
        <el-form-item
            :label="$t('Multicurrency')"
            :prop="getProp('isMultiCurrency')"
            :rules="isMultiCurrencyRule"
        >
            <el-switch
                v-model="wipTransaction.isMultiCurrency"
                :disabled="isDisabled"
                @change="updateCurrencies"
            />
        </el-form-item>
        <el-form-item
            :label="wipTransaction.isMultiCurrency ? $t('From amount') : $t('Amount')"
            :prop="getProp('amount')"
            :rules="amountRule"
        >
            <generic-amount
                :amount.sync="wipTransaction.amount"
                :currency.sync="wipTransaction.currency"
                :currency-list="c_currencyList"
                :disabled="isDisabled"
                @blur="$emit('validate', getProp('amount'))"
                :key="componentKey"
            />
        </el-form-item>
        <el-form-item
            v-if="wipTransaction.isMultiCurrency"
            :label="$t('To amount')"
            :prop="getProp('exchangeAmount')"
            :rules="exchangeAmountRule"
        >
            <generic-amount
                :amount.sync="wipTransaction.exchangeAmount"
                :currency.sync="wipTransaction.exchangeCurrency"
                :currency-list="c_currencyList"
                :disabled="isDisabled"
                @blur="$emit('validate', getProp('exchangeAmount'))"
                :key="componentKey"
            />
        </el-form-item>
        <el-form-item :label="$t('Import id')" :prop="getProp('importId')" :rules="importIdRule">
            <el-input
                v-model="wipTransaction.importId"
                :disabled="isDisabled"
                v-autosize="wipTransaction.importId"
                size="small"
            ></el-input>
        </el-form-item>
        <el-form-item :label="$t('Tags')" :prop="getProp('tagIdList')">
            <generic-tag-autocomplete
                :selectedIdList.sync="wipTransaction.tagIdList"
                :optionObjectList="c_tagList"
                :disabled="isDisabled"
            />
        </el-form-item>
        <el-form-item v-if="wipTransaction.createdDate" :label="$t('Created at')">
            <div>{{ formatDate(wipTransaction.createdDate) }}</div>
        </el-form-item>
        <el-form-item v-if="wipTransaction.updatedDate" :label="$t('Updated at')">
            <div>{{ formatDate(wipTransaction.updatedDate) }}</div>
        </el-form-item>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import FlatCashTransaction from '../../backend/database/entity/proxy/FlatCashTransaction';
import CashTransactionType from '../../backend/database/entity/enumeration/CashTransactionType';
import CashAccountType from '../../backend/database/entity/enumeration/CashAccountType';
import CashAccount from '../../backend/database/entity/CashAccount';
import AccountAutocomplete from '../account/AccountAutocomplete.vue';
import CurrencyAutocomplete from '../currency/CurrencyAutocomplete.vue';
import GenericDatePicker from '../../components/GenericDatePicker.vue';
import GenericTagEnumAutocomplete from '../../components/GenericTagEnumAutocomplete.vue';
import GenericTagAutocomplete from '../../components/GenericTagAutocomplete.vue';
import GenericRadio from '../../components/GenericRadio.vue';
import GenericAmount from '../../components/GenericAmount.vue';
import CashAccountUtils from '../../backend/utils/CashAccountUtils';
import { isAfter } from 'date-fns';
import DateUtils from '../../backend/utils/DateUtils';

export default Vue.extend({
    name: 'transaction-edit-component',
    components: {
        AccountAutocomplete,
        CurrencyAutocomplete,
        GenericDatePicker,
        GenericRadio,
        GenericAmount,
        GenericTagEnumAutocomplete,
        GenericTagAutocomplete,
    },
    props: {
        wipTransaction: {
            type: Object as () => FlatCashTransaction,
            required: true,
        },
        isDisabled: Boolean,
        propertyName: String,
        index: Number,
    },
    data(this: any) {
        const checkAmount = (rule, value, callback, source) => {
            if (value == null) {
                callback(new Error(this.$t('Please define an amount')));
            } else if (+value <= 0) {
                callback(new Error(this.$t('Amount should be strictly positive')));
            } else {
                callback();
            }
        };
        const checkTransactionDate = (rule, value, callback, source) => {
            if (value == null) {
                callback(new Error(this.$t('Please define a Date')));
            } else if (isAfter(value, DateUtils.newDate())) {
                callback(new Error(this.$t('Date should be in the past')));
            } else {
                callback();
            }
        };
        const checkCurrency = (rule, value, callback, source) => {
            // Should not be null after amount is not null
            // Should match outAccount currency
            // If no multicurrency, should match inAccount currency as well
            value = this.wipTransaction.currency;
            if (!this.wipTransaction.amount && !value) {
                callback();
            } else if (this.wipTransaction.amount && !value) {
                callback(new Error(this.$t('Please define a currency')));
            } else if (
                this.wipTransaction.outAccount &&
                CashAccountUtils.isInternal(this.wipTransaction.outAccount) &&
                value.id !== this.wipTransaction.outAccount.currencyId
            ) {
                callback(new Error(this.$t('Please use the same currency as the From account')));
            } else if (
                !this.wipTransaction.isMultiCurrency &&
                this.wipTransaction.inAccount &&
                CashAccountUtils.isInternal(this.wipTransaction.inAccount) &&
                value.id !== this.wipTransaction.inAccount.currencyId
            ) {
                callback(new Error(this.$t('Please use the same currency as the To account')));
            } else {
                callback();
            }
        };
        const checkExchangeCurrency = (rule, value, callback, source) => {
            // If multicurrency, should not be null
            // and should match inAccount currency
            // should be different from the out currency
            value = this.wipTransaction.exchangeCurrency;
            if (!this.wipTransaction.isMultiCurrency) {
                callback();
            } else if (!value) {
                callback(new Error(this.$t('Please define a currency')));
            } else if (
                value &&
                this.wipTransaction.currency &&
                value.id === this.wipTransaction.currency.id
            ) {
                callback(new Error(this.$t('From currency and To currency should be different.')));
            } else if (
                this.wipTransaction.inAccount &&
                CashAccountUtils.isInternal(this.wipTransaction.inAccount) &&
                value.id !== this.wipTransaction.inAccount.currencyId
            ) {
                callback(new Error(this.$t('Please use the same currency as the To account')));
            } else {
                callback();
            }
        };
        const checkOutAccount = (rule, value, callback, source) => {
            // Should be a real account not folder
            // If Income then income
            // If Expense then asset
            // If Transfert then internal
            if (!value) {
                callback(new Error(this.$t('Please define an account')));
            } else if (value.isDirectory) {
                callback(new Error(this.$t('Account cannot be a folder')));
            } else if (
                this.wipTransaction.type === CashTransactionType.INCOME &&
                value.type !== CashAccountType.INCOME
            ) {
                callback(new Error(this.$t('Please select an INCOME type account')));
            } else if (
                this.wipTransaction.type === CashTransactionType.EXPENSE &&
                value.type !== CashAccountType.ASSET
            ) {
                callback(new Error(this.$t('Please select an ASSET type account')));
            } else if (
                this.wipTransaction.type === CashTransactionType.ASSET_TRANSFER &&
                value.type !== CashAccountType.ASSET
            ) {
                callback(new Error(this.$t('Please select an ASSET type account')));
            } else if (
                this.wipTransaction.type === CashTransactionType.LIABILITY_TRANSFER &&
                value.type !== CashAccountType.LIABILITY
            ) {
                callback(new Error(this.$t('Please select an LIABILITY type account')));
            } else if (
                this.wipTransaction.type === CashTransactionType.OPENING_NEGATIVE &&
                value.type !== CashAccountType.ASSET
            ) {
                callback(new Error(this.$t('Please select an ASSET type account')));
            } else if (
                this.wipTransaction.type === CashTransactionType.OPENING_POSITIVE &&
                value.type !== CashAccountType.OPENING
            ) {
                callback(new Error(this.$t('Please select an OPENING type account')));
            } else if (
                this.wipTransaction.type === CashTransactionType.LIABILITY_INCREASE &&
                value.type !== CashAccountType.LIABILITY
            ) {
                callback(new Error(this.$t('Please select an LIABILITY type account')));
            } else if (
                this.wipTransaction.type === CashTransactionType.LIABILITY_DECREASE &&
                value.type !== CashAccountType.ASSET
            ) {
                callback(new Error(this.$t('Please select an ASSET type account')));
            } else {
                callback();
            }
        };
        const checkInAccount = (rule, value, callback, source) => {
            // Should be a real account not folder
            // Should be different from outAccount
            // If Income, then asset
            // If Expense, then expense
            // If Transfert, then internal
            // If custom and outAccount external then internal
            if (!value) {
                callback(new Error(this.$t('Please define an account')));
            } else if (value.isDirectory) {
                callback(new Error(this.$t('Account cannot be a folder')));
            } else if (
                this.wipTransaction.outAccount &&
                this.wipTransaction.outAccount.id === value.id
            ) {
                callback(new Error(this.$t('From account and To account should be different')));
            } else if (
                this.wipTransaction.type === CashTransactionType.INCOME &&
                value.type !== CashAccountType.ASSET
            ) {
                callback(new Error(this.$t('Please select an ASSET type account')));
            } else if (
                this.wipTransaction.type === CashTransactionType.EXPENSE &&
                value.type !== CashAccountType.EXPENSE
            ) {
                callback(new Error(this.$t('Please select an EXPENSE type account')));
            } else if (
                this.wipTransaction.type === CashTransactionType.ASSET_TRANSFER &&
                value.type !== CashAccountType.ASSET
            ) {
                callback(new Error(this.$t('Please select an ASSET type account')));
            } else if (
                this.wipTransaction.type === CashTransactionType.LIABILITY_TRANSFER &&
                value.type !== CashAccountType.LIABILITY
            ) {
                callback(new Error(this.$t('Please select an LIABILITY type account')));
            } else if (
                this.wipTransaction.type === CashTransactionType.OPENING_NEGATIVE &&
                value.type !== CashAccountType.OPENING
            ) {
                callback(new Error(this.$t('Please select an ASSET type account')));
            } else if (
                this.wipTransaction.type === CashTransactionType.OPENING_POSITIVE &&
                value.type !== CashAccountType.ASSET
            ) {
                callback(new Error(this.$t('Please select an OPENING type account')));
            } else if (
                this.wipTransaction.type === CashTransactionType.LIABILITY_INCREASE &&
                value.type !== CashAccountType.ASSET
            ) {
                callback(new Error(this.$t('Please select an ASSET type account')));
            } else if (
                this.wipTransaction.type === CashTransactionType.LIABILITY_DECREASE &&
                value.type !== CashAccountType.LIABILITY
            ) {
                callback(new Error(this.$t('Please select an LIABILITY type account')));
            } else {
                callback();
            }
        };
        const checkExchangeAmount = (rule, value, callback, source) => {
            // If multicurrency, should not be null
            // and should be positive
            if (!this.wipTransaction.isMultiCurrency) {
                callback();
            } else if (value == null) {
                callback(new Error(this.$t('Please define an amount')));
            } else if (+value <= 0) {
                callback(new Error(this.$t('Amount should be strictly positive')));
            } else {
                callback();
            }
        };
        const rules = {
            type: [
                {
                    type: 'string',
                    required: true,
                    message: this.$t('Please define a type'),
                    trigger: 'blur',
                },
            ],
            description: [
                {
                    type: 'string',
                    whitespace: true,
                    message: this.$t('Whitespace only is not possible'),
                    trigger: 'blur',
                },
                {
                    type: 'string',
                    required: true,
                    message: this.$t('Please give a description'),
                    trigger: 'blur',
                },
                {
                    type: 'string',
                    min: 2,
                    max: 100,
                    message: this.$t('Length should be between 2 and 100'),
                    trigger: 'blur',
                },
            ],
            detail: [
                {
                    type: 'string',
                    whitespace: true,
                    message: this.$t('Whitespace only is not possible'),
                    trigger: 'blur',
                },
                {
                    type: 'string',
                    min: 2,
                    max: 500,
                    message: this.$t('Length should be between 2 and 500'),
                    trigger: 'blur',
                },
            ],
            importId: [
                {
                    type: 'string',
                    whitespace: true,
                    message: this.$t('Whitespace only is not possible'),
                    trigger: 'blur',
                },
                {
                    type: 'string',
                    min: 1,
                    max: 50,
                    message: this.$t('Length should be between 1 and 50'),
                    trigger: 'blur',
                },
            ],
            transactionDate: [
                {
                    type: 'date',
                    required: true,
                    message: this.$t('Please define a date'),
                    trigger: 'blur',
                },
                { validator: checkTransactionDate, trigger: 'blur' },
            ],
            amount: [
                { validator: checkAmount, trigger: 'blur' },
                { validator: checkCurrency, trigger: 'blur' },
            ],
            inAccount: [
                {
                    type: 'object',
                    required: true,
                    message: this.$t('Please define the account'),
                    trigger: 'blur',
                },
                { validator: checkInAccount, trigger: 'blur' },
            ],
            outAccount: [
                {
                    type: 'object',
                    required: true,
                    message: this.$t('Please define the account'),
                    trigger: 'blur',
                },
                { validator: checkOutAccount, trigger: 'blur' },
            ],
            isMultiCurrency: [],
            exchangeAmount: [
                { validator: checkExchangeAmount, trigger: 'blur' },
                { validator: checkExchangeCurrency, trigger: 'blur' },
            ],
        };

        return {
            rules,
            componentKey: 0,
        };
    },
    computed: {
        c_accountList(this: any) {
            return this.$store.getters['PermanentData/leafAccountList'];
        },
        c_currencyList(this: any) {
            return this.$store.state.PermanentData.currencyList;
        },
        c_tagList(this: any) {
            return this.$store.state.PermanentData.tagList;
        },
        c_typeList(this: any) {
            return Object.keys(CashTransactionType).map((item) => {
                return { value: item, label: this.$t(item) };
            });
        },
        typeRule(this: any) {
            if (this.isDisabled) {
                return [];
            } else {
                return this.rules.type;
            }
        },
        descriptionRule(this: any) {
            if (this.isDisabled) {
                return [];
            } else {
                return this.rules.description;
            }
        },
        detailRule(this: any) {
            if (this.isDisabled) {
                return [];
            } else {
                return this.rules.detail;
            }
        },
        transactionDateRule(this: any) {
            if (this.isDisabled) {
                return [];
            } else {
                return this.rules.transactionDate;
            }
        },
        outAccountRule(this: any) {
            if (this.isDisabled) {
                return [];
            } else {
                return this.rules.outAccount;
            }
        },
        inAccountRule(this: any) {
            if (this.isDisabled) {
                return [];
            } else {
                return this.rules.inAccount;
            }
        },
        isMultiCurrencyRule(this: any) {
            if (this.isDisabled) {
                return [];
            } else {
                return this.rules.isMultiCurrency;
            }
        },
        amountRule(this: any) {
            if (this.isDisabled) {
                return [];
            } else {
                return this.rules.amount;
            }
        },
        exchangeAmountRule(this: any) {
            if (this.isDisabled) {
                return [];
            } else {
                return this.rules.exchangeAmount;
            }
        },
        importIdRule(this: any) {
            if (this.isDisabled) {
                return [];
            } else {
                return this.rules.importId;
            }
        },
        inAccountList(this: any): CashAccount[] {
            let result;
            switch (this.wipTransaction.type) {
                case CashTransactionType.INCOME: {
                    result = this.c_accountList.filter((a) => a.type === CashAccountType.ASSET);
                    break;
                }
                case CashTransactionType.EXPENSE: {
                    result = this.c_accountList.filter((a) => a.type === CashAccountType.EXPENSE);
                    break;
                }
                case CashTransactionType.ASSET_TRANSFER: {
                    result = this.c_accountList.filter((a) => a.type === CashAccountType.ASSET);
                    break;
                }
                case CashTransactionType.LIABILITY_TRANSFER: {
                    result = this.c_accountList.filter((a) => a.type === CashAccountType.LIABILITY);
                    break;
                }
                case CashTransactionType.OPENING_NEGATIVE: {
                    result = this.c_accountList.filter((a) => a.type === CashAccountType.OPENING);
                    break;
                }
                case CashTransactionType.OPENING_POSITIVE: {
                    result = this.c_accountList.filter((a) => a.type === CashAccountType.ASSET);
                    break;
                }
                case CashTransactionType.LIABILITY_INCREASE: {
                    result = this.c_accountList.filter((a) => a.type === CashAccountType.ASSET);
                    break;
                }
                case CashTransactionType.LIABILITY_DECREASE: {
                    result = this.c_accountList.filter((a) => a.type === CashAccountType.LIABILITY);
                    break;
                }
                default: {
                    result = this.c_accountList;
                    break;
                }
            }
            return result;
        },
        outAccountList(this: any): CashAccount[] {
            let result;
            switch (this.wipTransaction.type) {
                case CashTransactionType.INCOME: {
                    result = this.c_accountList.filter((a) => a.type === CashAccountType.INCOME);
                    break;
                }
                case CashTransactionType.EXPENSE: {
                    result = this.c_accountList.filter((a) => a.type === CashAccountType.ASSET);
                    break;
                }
                case CashTransactionType.ASSET_TRANSFER: {
                    result = this.c_accountList.filter((a) => a.type === CashAccountType.ASSET);
                    break;
                }
                case CashTransactionType.LIABILITY_TRANSFER: {
                    result = this.c_accountList.filter((a) => a.type === CashAccountType.LIABILITY);
                    break;
                }
                case CashTransactionType.OPENING_NEGATIVE: {
                    result = this.c_accountList.filter((a) => a.type === CashAccountType.ASSET);
                    break;
                }
                case CashTransactionType.OPENING_POSITIVE: {
                    result = this.c_accountList.filter((a) => a.type === CashAccountType.OPENING);
                    break;
                }
                case CashTransactionType.LIABILITY_INCREASE: {
                    result = this.c_accountList.filter((a) => a.type === CashAccountType.LIABILITY);
                    break;
                }
                case CashTransactionType.LIABILITY_DECREASE: {
                    result = this.c_accountList.filter((a) => a.type === CashAccountType.ASSET);
                    break;
                }
                default: {
                    result = this.c_accountList;
                    break;
                }
            }
            return result;
        },
    },
    methods: {
        getProp(this: any, name) {
            if (this.propertyName) {
                return this.propertyName + '.' + name;
            } else {
                return name;
            }
        },
        formatDate(this: any, dateObj: Date): string {
            return DateUtils.formatHumanDate(dateObj);
        },
        updateCurrencies(this: any) {
            if (!this.wipTransaction.amount || 0 === +this.wipTransaction.amount) {
                if (this.wipTransaction.isMultiCurrency) {
                    if (
                        this.wipTransaction.inAccount &&
                        CashAccountUtils.isLeaf(this.wipTransaction.inAccount) &&
                        CashAccountUtils.isInternal(this.wipTransaction.inAccount)
                    ) {
                        this.wipTransaction.exchangeCurrency = this.wipTransaction.inAccount.currency;
                        this.forceRerender();
                    }
                    if (
                        this.wipTransaction.outAccount &&
                        CashAccountUtils.isLeaf(this.wipTransaction.outAccount) &&
                        CashAccountUtils.isInternal(this.wipTransaction.outAccount)
                    ) {
                        this.wipTransaction.currency = this.wipTransaction.outAccount.currency;
                        this.forceRerender();
                    }
                } else {
                    if (
                        this.wipTransaction.outAccount &&
                        CashAccountUtils.isLeaf(this.wipTransaction.outAccount) &&
                        CashAccountUtils.isInternal(this.wipTransaction.outAccount)
                    ) {
                        this.wipTransaction.currency = this.wipTransaction.outAccount.currency;
                        this.forceRerender();
                    } else if (
                        this.wipTransaction.inAccount &&
                        CashAccountUtils.isLeaf(this.wipTransaction.inAccount) &&
                        CashAccountUtils.isInternal(this.wipTransaction.inAccount)
                    ) {
                        this.wipTransaction.currency = this.wipTransaction.inAccount.currency;
                        this.forceRerender();
                    }
                }
            }
        },
        forceRerender() {
            this.componentKey += 1;
        },
    },
});
</script>
