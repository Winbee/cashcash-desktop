<template>
    <div
        class="generic-parameters"
        @mouseover="d_showAddButton = true"
        @mouseleave="d_showAddButton = false"
    >
        <span>
            <fa icon="search" class="search-icon" fixed-width />
        </span>

        <transition name="fade">
            <div
                class="filter-label-container"
                v-show="!d_showAddButton && !d_addMenuOpen && !isShow()"
            >
                <div class="filter-label">{{ $t('Filter ') }}'{{ c_placeholder }}'</div>
            </div>
        </transition>

        <generic-edit-tag
            v-if="d_parameter_states.searchString.show"
            :edit="d_parameter_states.searchString.edit"
            @remove="deleteFilter('searchString')"
            @edit="editFilter('searchString')"
            :label="d_parameter_states.searchString.label"
            :value="d_flatParameters.searchString"
        >
            <generic-input
                :string.sync="d_flatParameters.searchString"
                @blur="endEditOrDelete('searchString')"
                @clear="endEditOrDelete('searchString')"
                :placeholder="d_parameter_states.searchString.label"
                autofocus
            />
        </generic-edit-tag>
        <generic-edit-tag
            v-if="d_parameter_states.detailSearchString.show"
            :edit="d_parameter_states.detailSearchString.edit"
            @remove="deleteFilter('detailSearchString')"
            @edit="editFilter('detailSearchString')"
            :label="d_parameter_states.detailSearchString.label"
            :value="d_flatParameters.detailSearchString"
        >
            <generic-input
                :string.sync="d_flatParameters.detailSearchString"
                @blur="endEditOrDelete('detailSearchString')"
                @clear="endEditOrDelete('detailSearchString')"
                autofocus
                :placeholder="d_parameter_states.detailSearchString.label"
            />
        </generic-edit-tag>
        <generic-edit-tag
            v-if="d_parameter_states.account.show"
            :edit="d_parameter_states.account.edit"
            @remove="deleteFilter('account')"
            @edit="editFilter('account')"
            :label="d_parameter_states.account.label"
            :value="d_flatParameters.account ? d_flatParameters.account.name : null"
        >
            <account-autocomplete
                :object.sync="d_flatParameters.account"
                :optionList="c_accountList"
                @blur="endEditOrDelete('account')"
                @keyup.enter.native="endEditOrDelete('account')"
                autofocus
            />
        </generic-edit-tag>
        <generic-edit-tag
            v-if="d_parameter_states.fromAccount.show"
            :edit="d_parameter_states.fromAccount.edit"
            @remove="deleteFilter('fromAccount')"
            @edit="editFilter('fromAccount')"
            :label="d_parameter_states.fromAccount.label"
            :value="d_flatParameters.fromAccount ? d_flatParameters.fromAccount.name : null"
        >
            <account-autocomplete
                :object.sync="d_flatParameters.fromAccount"
                :optionList="c_accountList"
                @blur="endEditOrDelete('fromAccount')"
                @keyup.enter.native="endEditOrDelete('fromAccount')"
                autofocus
            />
        </generic-edit-tag>
        <generic-edit-tag
            v-if="d_parameter_states.toAccount.show"
            :edit="d_parameter_states.toAccount.edit"
            @remove="deleteFilter('toAccount')"
            @edit="editFilter('toAccount')"
            :label="d_parameter_states.toAccount.label"
            :value="d_flatParameters.toAccount ? d_flatParameters.toAccount.name : null"
        >
            <account-autocomplete
                :object.sync="d_flatParameters.toAccount"
                :optionList="c_accountList"
                @blur="endEditOrDelete('toAccount')"
                @keyup.enter.native="endEditOrDelete('toAccount')"
                autofocus
            />
        </generic-edit-tag>
        <generic-edit-tag
            v-if="d_parameter_states.currency.show"
            :edit="d_parameter_states.currency.edit"
            @remove="deleteFilter('currency')"
            @edit="editFilter('currency')"
            :label="d_parameter_states.currency.label"
            :value="d_flatParameters.currency ? d_flatParameters.currency.name : null"
        >
            <currency-autocomplete
                :object.sync="d_flatParameters.currency"
                :optionList="c_currencyList"
                @blur="endEditOrDelete('currency')"
                @keyup.enter.native="endEditOrDelete('currency')"
                autofocus
            />
        </generic-edit-tag>
        <generic-edit-tag
            v-if="d_parameter_states.transactionType.show"
            :edit="d_parameter_states.transactionType.edit"
            @remove="deleteFilter('transactionType')"
            @edit="editFilter('transactionType')"
            :label="d_parameter_states.transactionType.label"
            :value="d_flatParameters.transactionType"
        >
            <generic-tag-enum-autocomplete
                :selectedString.sync="d_flatParameters.transactionType"
                :optionObjectList="d_transactionTypeList"
                @blur="endEditOrDelete('transactionType')"
                @keyup.enter.native="endEditOrDelete('transactionType')"
                autofocus
            />
        </generic-edit-tag>
        <generic-edit-tag
            v-if="d_parameter_states.accountType.show"
            :edit="d_parameter_states.accountType.edit"
            @remove="deleteFilter('accountType')"
            @edit="editFilter('accountType')"
            :label="d_parameter_states.accountType.label"
            :value="d_flatParameters.accountType"
        >
            <generic-tag-enum-autocomplete
                :selectedString.sync="d_flatParameters.accountType"
                :optionObjectList="d_accountTypeList"
                @blur="endEditOrDelete('accountType')"
                @keyup.enter.native="endEditOrDelete('accountType')"
                autofocus
            />
        </generic-edit-tag>
        <generic-edit-tag
            v-if="d_parameter_states.createdDateFrom.show"
            :edit="d_parameter_states.createdDateFrom.edit"
            @remove="deleteFilter('createdDateFrom')"
            @edit="editFilter('createdDateFrom')"
            :label="d_parameter_states.createdDateFrom.label"
            :value="printDate(d_flatParameters.createdDateFrom)"
        >
            <generic-date-picker
                :placeholder="$t('Created after')"
                :dateObject.sync="d_flatParameters.createdDateFrom"
                @blur="endEditOrDelete('createdDateFrom')"
                @keyup.enter.native="endEditOrDelete('createdDateFrom')"
                autofocus
            />
        </generic-edit-tag>
        <generic-edit-tag
            v-if="d_parameter_states.createdDateTo.show"
            :edit="d_parameter_states.createdDateTo.edit"
            @remove="deleteFilter('createdDateTo')"
            @edit="editFilter('createdDateTo')"
            :label="d_parameter_states.createdDateTo.label"
            :value="printDate(d_flatParameters.createdDateTo)"
        >
            <generic-date-picker
                :placeholder="$t('Created before')"
                :dateObject.sync="d_flatParameters.createdDateTo"
                @blur="endEditOrDelete('createdDateTo')"
                @keyup.enter.native="endEditOrDelete('createdDateTo')"
                autofocus
            />
        </generic-edit-tag>
        <generic-edit-tag
            v-if="d_parameter_states.updatedDateFrom.show"
            :edit="d_parameter_states.updatedDateFrom.edit"
            @remove="deleteFilter('updatedDateFrom')"
            @edit="editFilter('updatedDateFrom')"
            :label="d_parameter_states.updatedDateFrom.label"
            :value="printDate(d_flatParameters.updatedDateFrom)"
        >
            <generic-date-picker
                :placeholder="$t('Updated after')"
                :dateObject.sync="d_flatParameters.updatedDateFrom"
                @blur="endEditOrDelete('updatedDateFrom')"
                @keyup.enter.native="endEditOrDelete('updatedDateFrom')"
                autofocus
            />
        </generic-edit-tag>
        <generic-edit-tag
            v-if="d_parameter_states.updatedDateTo.show"
            :edit="d_parameter_states.updatedDateTo.edit"
            @remove="deleteFilter('updatedDateTo')"
            @edit="editFilter('updatedDateTo')"
            :label="d_parameter_states.updatedDateTo.label"
            :value="printDate(d_flatParameters.updatedDateTo)"
        >
            <generic-date-picker
                :placeholder="$t('Updated before')"
                :dateObject.sync="d_flatParameters.updatedDateTo"
                @blur="endEditOrDelete('updatedDateTo')"
                @keyup.enter.native="endEditOrDelete('updatedDateTo')"
                autofocus
            />
        </generic-edit-tag>
        <generic-edit-tag
            v-if="d_parameter_states.amountEquals.show"
            :edit="d_parameter_states.amountEquals.edit"
            @remove="deleteFilter('amountEquals')"
            @edit="editFilter('amountEquals')"
            :label="d_parameter_states.amountEquals.label"
            :value="printNumber(d_flatParameters.amountEquals)"
        >
            <generic-input-number
                :number.sync="d_flatParameters.amountEquals"
                :controls="false"
                @blur="endEditOrDelete('amountEquals')"
                :min="0"
                :placeholder="d_parameter_states.amountEquals.label"
                autofocus
            ></generic-input-number>
        </generic-edit-tag>
        <generic-edit-tag
            v-if="d_parameter_states.amountLessThan.show"
            :edit="d_parameter_states.amountLessThan.edit"
            @remove="deleteFilter('amountLessThan')"
            @edit="editFilter('amountLessThan')"
            :label="d_parameter_states.amountLessThan.label"
            :value="printNumber(d_flatParameters.amountLessThan)"
        >
            <generic-input-number
                :number.sync="d_flatParameters.amountLessThan"
                :controls="false"
                @blur="endEditOrDelete('amountLessThan')"
                :min="0"
                :placeholder="d_parameter_states.amountLessThan.label"
                autofocus
            ></generic-input-number>
        </generic-edit-tag>
        <generic-edit-tag
            v-if="d_parameter_states.amountGreaterThan.show"
            :edit="d_parameter_states.amountGreaterThan.edit"
            @remove="deleteFilter('amountGreaterThan')"
            @edit="editFilter('amountGreaterThan')"
            :label="d_parameter_states.amountGreaterThan.label"
            :value="printNumber(d_flatParameters.amountGreaterThan)"
        >
            <generic-input-number
                :number.sync="d_flatParameters.amountGreaterThan"
                :controls="false"
                @blur="endEditOrDelete('amountGreaterThan')"
                :min="0"
                :placeholder="d_parameter_states.amountGreaterThan.label"
                autofocus
            ></generic-input-number>
        </generic-edit-tag>
        <transition name="fade">
            <el-dropdown
                @command="showFilter"
                @click="search"
                trigger="click"
                placement="bottom-start"
                :size="'small'"
                v-show="d_showAddButton || d_addMenuOpen"
                @visible-change="(isOpen) => (d_addMenuOpen = isOpen)"
            >
                <gen-button :size="'small'">
                    <fa icon="plus" fixed-width />
                </gen-button>
                <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item
                        v-for="(value, key) in c_actionableParameters"
                        :key="key"
                        :command="key"
                        :disabled="value.show"
                        :divided="key === 'save' || (key === 'clear' && !c_saveAction)"
                        >{{ value.label }}</el-dropdown-item
                    >
                </el-dropdown-menu>
            </el-dropdown>
        </transition>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import AccountAutocomplete from '../../views/account/AccountAutocomplete.vue';
import CurrencyAutocomplete from '../../views/currency/CurrencyAutocomplete.vue';
import GenericTagEnumAutocomplete from '../GenericTagEnumAutocomplete.vue';
import GenericTagAutocomplete from '../GenericTagAutocomplete.vue';
import GenericDatePicker from '../GenericDatePicker.vue';
import _ from 'lodash';
import CashTransactionType from '../../backend/database/entity/enumeration/CashTransactionType';
import CashAccountType from '../../backend/database/entity/enumeration/CashAccountType';
import GenericEditTag from './GenericEditTag.vue';
import GenericInput from './GenericInput.vue';
import GenericInputNumber from './GenericInputNumber.vue';
import {
    TransactionParameters,
    simpleTransactionParameters,
} from '../../backend/service/dto/Parameters';
import PrintUtils from '../../backend/utils/PrintUtils';
import CashFilterUtils from '../../backend/utils/CashFilterUtils';
import GenButton from '../../components/GenButton.vue';
import CashFilter from '../../backend/database/entity/CashFilter';
import DateUtils from '../../backend/utils/DateUtils';
import { Route } from 'vue-router';

interface ParameterState {
    [key: string]: {
        show: boolean;
        edit: boolean;
        label: string;
    };
}

export default Vue.extend({
    name: 'generic-parameters',
    components: {
        AccountAutocomplete,
        CurrencyAutocomplete,
        GenericDatePicker,
        GenericTagEnumAutocomplete,
        GenericEditTag,
        GenericTagAutocomplete,
        GenericInput,
        GenericInputNumber,
        GenButton,
    },
    props: {
        parameters: Object,
        actionableParameters: Array,
        vuexDispatch: String,
        routeAfterUpdate: String,
        placeholder: {
            default: 'transactions',
            type: String,
        },
        saveAction: Boolean,
        isTransaction: Boolean,
    },
    data(this: any) {
        const flatParams = this.flatten(_.cloneDeep(this.parameters));
        return {
            d_transactionTypeList: Object.keys(CashTransactionType).map((item) => {
                return { value: item, label: this.$t(item) };
            }),
            d_accountTypeList: Object.keys(CashAccountType).map((item) => {
                return { value: item, label: this.$t(item) };
            }),
            d_flatParameters: flatParams,
            d_parameter_states: this.getParameterStates(flatParams),
            d_showAddButton: false,
            d_addMenuOpen: false,
        };
    },
    computed: {
        c_saveAction(this: any): boolean {
            return this.saveAction;
        },
        c_placeholder(this: any): string {
            return this.placeholder.toLowerCase();
        },
        c_actionableParameters(this: any) {
            if (!this.actionableParameters || this.actionableParameters.length === 0) {
                return this.d_parameter_states;
            }
            const actionableParameter: any = {};
            for (const propName of Object.keys(this.d_parameter_states)) {
                if (this.actionableParameters.includes(propName)) {
                    actionableParameter[propName] = this.d_parameter_states[propName];
                }
            }
            if (this.c_saveAction) {
                actionableParameter.save = {
                    show: false,
                    edit: false,
                    label: this.$t('Save filter'),
                };
            }
            actionableParameter.clear = {
                show: false,
                edit: false,
                label: this.$t('Clear filter'),
            };
            return actionableParameter;
        },
        c_accountList(this: any) {
            return this.$store.state.PermanentData.accountList;
        },
        c_currencyList(this: any) {
            return this.$store.state.PermanentData.currencyList;
        },
    },
    methods: {
        flatten(this: any, param: TransactionParameters) {
            return {
                createdDateFrom: param.createdDateFrom,
                createdDateTo: param.createdDateTo,
                updatedDateFrom: param.updatedDateFrom,
                updatedDateTo: param.updatedDateTo,
                account: this.getSelectedAccount(param),
                fromAccount: this.getSelectedFromAccount(param),
                toAccount: this.getSelectedToAccount(param),
                currency: this.getSelectedCurrency(param),
                transactionType:
                    param.transactionTypeList && param.transactionTypeList.length > 0
                        ? param.transactionTypeList[0]
                        : null,
                accountType:
                    param.accountTypeList && param.accountTypeList.length > 0
                        ? param.accountTypeList[0]
                        : null,
                transactionDateFrom: param.transactionDateFrom,
                transactionDateTo: param.transactionDateTo,
                searchString: param.searchString,
                detailSearchString: param.detailSearchString,
                amountEquals: param.amountEquals,
                amountLessThan: param.amountLessThan,
                amountGreaterThan: param.amountGreaterThan,
            };
        },
        emitUpdate(this: any) {
            const parameters = this.unflat();
            if (!_.isEqual(parameters, this.parameters)) {
                if (this.vuexDispatch) {
                    this.$store.dispatch(this.vuexDispatch, parameters);
                }
                this.$emit('update:parameters', _.cloneDeep(parameters));
                if (
                    this.routeAfterUpdate &&
                    (this.$route as Route).name !== this.routeAfterUpdate
                ) {
                    this.$router.push({ name: this.routeAfterUpdate });
                }
            }
        },
        unflat(this: any): object {
            const parameters = {
                createdDateFrom: this.d_flatParameters.createdDateFrom,
                createdDateTo: this.d_flatParameters.createdDateTo,
                updatedDateFrom: this.d_flatParameters.updatedDateFrom,
                updatedDateTo: this.d_flatParameters.updatedDateTo,
                accountIdList: this.d_flatParameters.account
                    ? [this.d_flatParameters.account.id]
                    : [],
                fromAccountIdList: this.d_flatParameters.fromAccount
                    ? [this.d_flatParameters.fromAccount.id]
                    : [],
                toAccountIdList: this.d_flatParameters.toAccount
                    ? [this.d_flatParameters.toAccount.id]
                    : [],
                currencyIdList: this.d_flatParameters.currency
                    ? [this.d_flatParameters.currency.id]
                    : [],
                transactionTypeList: this.d_flatParameters.transactionType
                    ? [this.d_flatParameters.transactionType]
                    : [],
                accountTypeList: this.d_flatParameters.accountType
                    ? [this.d_flatParameters.accountType]
                    : [],
                transactionDateFrom: this.d_flatParameters.transactionDateFrom,
                transactionDateTo: this.d_flatParameters.transactionDateTo,
                searchString: this.d_flatParameters.searchString,
                detailSearchString: this.d_flatParameters.detailSearchString,
                amountEquals: this.d_flatParameters.amountEquals,
                amountLessThan: this.d_flatParameters.amountLessThan,
                amountGreaterThan: this.d_flatParameters.amountGreaterThan,
            };

            return parameters;
        },
        paramEqual(param1, param2): boolean {
            if ((!param1 && param2) || (param1 && !param2)) {
                return false;
            }
            if (!param1 && !param2) {
                return true;
            }
            if (
                !_.isEqual(param1.createdDateFrom, param2.createdDateFrom) ||
                !_.isEqual(param1.createdDateTo, param2.createdDateTo) ||
                !_.isEqual(param1.updatedDateFrom, param2.updatedDateFrom) ||
                !_.isEqual(param1.updatedDateTo, param2.updatedDateTo) ||
                !_.isEqual(param1.transactionDateFrom, param2.transactionDateFrom) ||
                !_.isEqual(param1.transactionDateTo, param2.transactionDateTo) ||
                !_.isEqual(param1.searchString, param2.searchString) ||
                !_.isEqual(param1.detailSearchString, param2.detailSearchString) ||
                !_.isEqual(param1.amountEquals, param2.amountEquals) ||
                !_.isEqual(param1.amountLessThan, param2.amountLessThan) ||
                !_.isEqual(param1.amountGreaterThan, param2.amountGreaterThan) ||
                !this.listEqual(param1.accountIdList, param2.accountIdList) ||
                !this.listEqual(param1.fromAccountIdList, param2.fromAccountIdList) ||
                !this.listEqual(param1.toAccountIdList, param2.toAccountIdList) ||
                !this.listEqual(param1.currencyIdList, param2.currencyIdList) ||
                !this.listEqual(param1.transactionTypeList, param2.transactionTypeList) ||
                !this.listEqual(param1.accountTypeList, param2.accountTypeList)
            ) {
                return false;
            }

            return true;
        },
        listEqual(list1: [], list2: []): boolean {
            const list1IsEmpty = list1 == null || list1.length === 0;
            const list2IsEmpty = list2 == null || list2.length === 0;
            if ((!list1IsEmpty && list2IsEmpty) || (list1IsEmpty && !list2IsEmpty)) {
                return false;
            }
            if (list1IsEmpty && list2IsEmpty) {
                return true;
            }
            return _.isEqual(list1, list2);
        },
        getSelectedAccount(this: any, param: TransactionParameters) {
            if (param.accountIdList && param.accountIdList.length > 0) {
                const id = param.accountIdList[0];
                return this.$store.state.PermanentData.accountMap.get(id);
            } else {
                return null;
            }
        },
        getSelectedFromAccount(this: any, param: TransactionParameters) {
            if (param.fromAccountIdList && param.fromAccountIdList.length > 0) {
                const id = param.fromAccountIdList[0];
                return this.$store.state.PermanentData.accountMap.get(id);
            } else {
                return null;
            }
        },
        getSelectedToAccount(this: any, param: TransactionParameters) {
            if (param.toAccountIdList && param.toAccountIdList.length > 0) {
                const id = param.toAccountIdList[0];
                return this.$store.state.PermanentData.accountMap.get(id);
            } else {
                return null;
            }
        },
        getSelectedCurrency(this: any, param: TransactionParameters) {
            if (param.currencyIdList && param.currencyIdList.length > 0) {
                const id = param.currencyIdList[0];
                return this.$store.getters['PermanentData/currencyMap'].get(id);
            } else {
                return null;
            }
        },
        getParameterStates(this: any, parameters): ParameterState {
            return {
                accountType: {
                    show: !!parameters.accountType,
                    edit: false,
                    label: this.$t('Account type'),
                },
                account: {
                    show: !!parameters.account,
                    edit: false,
                    label: this.$t('Any account'),
                },
                amountEquals: {
                    show: !!parameters.amountEquals,
                    edit: false,
                    label: this.$t('Amount equals'),
                },
                amountGreaterThan: {
                    show: !!parameters.amountGreaterThan,
                    edit: false,
                    label: this.$t('Amount greater than'),
                },
                amountLessThan: {
                    show: !!parameters.amountLessThan,
                    edit: false,
                    label: this.$t('Amount less than'),
                },
                currency: {
                    show: !!parameters.currency,
                    edit: false,
                    label: this.$t('Currency'),
                },
                createdDateFrom: {
                    show: !!parameters.createdDateFrom,
                    edit: false,
                    label: this.$t('Created after'),
                },
                createdDateTo: {
                    show: !!parameters.createdDateTo,
                    edit: false,
                    label: this.$t('Created before'),
                },
                searchString: {
                    show: !!parameters.searchString,
                    edit: false,
                    label: this.isTransaction ? this.$t('Description') : this.$t('Name'),
                },
                detailSearchString: {
                    show: !!parameters.detailSearchString,
                    edit: false,
                    label: this.$t('Details'),
                },
                fromAccount: {
                    show: !!parameters.fromAccount,
                    edit: false,
                    label: this.$t('From account'),
                },
                toAccount: {
                    show: !!parameters.toAccount,
                    edit: false,
                    label: this.$t('To account'),
                },
                transactionType: {
                    show: !!parameters.transactionType,
                    edit: false,
                    label: this.$t('Transaction type'),
                },
                transactionDateFrom: {
                    show: false,
                    edit: false,
                    label: this.$t('Transaction date after'),
                },
                transactionDateTo: {
                    show: false,
                    edit: false,
                    label: this.$t('Transaction date before'),
                },
                updatedDateFrom: {
                    show: !!parameters.updatedDateFrom,
                    edit: false,
                    label: this.$t('Updated after'),
                },
                updatedDateTo: {
                    show: !!parameters.updatedDateTo,
                    edit: false,
                    label: this.$t('Updated before'),
                },
            };
        },
        endEditOrDelete(this: any, name: string, emitUpdate = true) {
            if (!this.d_flatParameters[name]) {
                this.deleteFilter(name, emitUpdate);
            } else {
                this.endEditFilter(name, emitUpdate);
            }
        },
        isShow(this: any) {
            return (
                this.d_parameter_states.searchString.show ||
                this.d_parameter_states.detailSearchString.show ||
                this.d_parameter_states.account.show ||
                this.d_parameter_states.fromAccount.show ||
                this.d_parameter_states.toAccount.show ||
                this.d_parameter_states.currency.show ||
                this.d_parameter_states.transactionType.show ||
                this.d_parameter_states.accountType.show ||
                this.d_parameter_states.createdDateFrom.show ||
                this.d_parameter_states.createdDateTo.show ||
                this.d_parameter_states.updatedDateFrom.show ||
                this.d_parameter_states.updatedDateTo.show ||
                this.d_parameter_states.amountEquals.show ||
                this.d_parameter_states.amountLessThan.show ||
                this.d_parameter_states.amountGreaterThan.show
            );
        },
        showFilter(this: any, name) {
            if (name === 'save') {
                const filter: CashFilter = CashFilterUtils.convertToCashFilter(this.unflat());
                this.$router.push({
                    name: 'filter-edit-page',
                    params: { filterId: 'new', newFilter: filter },
                });
            } else if (name === 'clear') {
                this.d_flatParameters = this.flatten(simpleTransactionParameters);
                this.d_parameter_states = this.getParameterStates(this.d_flatParameters);
                this.emitUpdate();
            } else {
                this.d_parameter_states[name].show = true;
                if (!this.d_flatParameters[name]) {
                    this.editFilter(name);
                } else {
                    this.endEditFilter(name);
                }
            }
        },
        deleteFilter(this: any, name: string, emitUpdate = true) {
            this.d_parameter_states[name].show = false;
            this.d_flatParameters[name] = undefined;
            if (emitUpdate) {
                this.emitUpdate();
            }
        },
        editFilter(this: any, name) {
            for (const [key, value] of Object.entries(this.d_parameter_states as ParameterState)) {
                if (key === name) {
                    value.edit = true;
                } else {
                    this.endEditOrDelete(key, false);
                }
            }
        },
        endEditFilter(this: any, name: string, emitUpdate = true) {
            this.d_parameter_states[name].edit = false;
            if (emitUpdate) {
                this.emitUpdate();
            }
        },
        search(this: any) {
            this.emitUpdate();
        },
        printDate(this: any, date: Date): string {
            return DateUtils.formatHumanDate(date);
        },
        printNumber(this: any, number: number): string {
            return PrintUtils.printNumber(number);
        },
        handleCommand(this: any, command: string) {
            if (command === 'save') {
                const cashFilter = CashFilterUtils.convertToCashFilter(this.unflat());
                this.$router.push({
                    name: 'filter-edit-page',
                    params: { filterId: 'new', newFilter: cashFilter },
                });
            } else if (command === 'clear') {
            }
        },
    },
});
</script>

<style lang="scss" scoped>
.generic-parameters {
    display: flex;
    flex-flow: row;
    flex-wrap: wrap;
    border-radius: 5px;
    background: rgb(255, 255, 255);
    padding: 5px;
    width: 100%;
}
.search-icon {
    background-clip: border-box;
    background-color: rgba(0, 0, 0, 0);
    background-image: none;
    background-origin: padding-box;
    background-position-x: 0%;
    background-position-y: 0%;
    background-size: auto;
    border-bottom-left-radius: 3px;
    border-bottom-right-radius: 3px;
    border-top-left-radius: 3px;
    border-top-right-radius: 3px;
    border-width: 1px;
    box-sizing: border-box;
    color: rgb(96, 98, 102);
    display: inline-block;
    height: 32px;
    margin: 0px;
    outline-color: rgb(96, 98, 102);
    outline-style: none;
    outline-width: 0px;
    overflow-x: visible;
    overflow-y: visible;
    padding-bottom: 9px;
    padding-left: 15px;
    padding-right: 15px;
    padding-top: 9px;
    user-select: none;
    white-space: nowrap;
    width: 44px;
}
.filter-label-container {
    position: absolute;
    .filter-label {
        top: 6px;
        left: 50px;
        position: relative;
        color: #bbbec3;
        transition: transform 1s;
    }
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.5s;
}
.fade-enter,
.fade-leave-to {
    opacity: 0;
}
</style>
