import * as Vuex from 'vuex';
import { Container } from 'typedi';
import CashBudgetTransactionService from '../../backend/service/CashBudgetTransactionService';
import FlatCashTransaction from '../../backend/database/entity/proxy/FlatCashTransaction';
import { getField, updateField } from 'vuex-map-fields';
import { Notification } from 'element-ui';
import DateUtils from '../../backend/utils/DateUtils';
import { isAfter, isBefore, getDaysInMonth, isSameMonth } from 'date-fns';
import CashAccount from '../../backend/database/entity/CashAccount';
import GraphSplitExtended from '../../backend/service/dto/GraphSplitExtended';
import CashGraphService from '../../backend/service/CashGraphService';
import CashBudgetUtils from '../../backend/utils/CashBudgetUtils';
import i18n from '@/renderer/common/i18n/i18n';

// Data needed:
// - childrenAccountIdList ✅

// => Related to the budget and contextAccount
// - outSplitBudgetList
// - inSplitBudgetList
// - outSplitBudgetSum
// - inSplitBudgetSum

// => Related to budget, contextAccount and budgetDate
// - outable per month
// - outable per week
// - outable per day

// => Related to current, contextAccount and budgetDate
// - outCurrentSplitList
// - inCurrentSplitList

// => Related to current, contextAccount, budgetDate and budget
// - outCurrentBudgetedSum
// - outCurrentNoneBudgetedSum
// - outCurrentSum
// - inCurrentBudgetedSum
// - inCurrentNoneBudgetedSum
// - inCurrentSum
// - outed per month
// - outed per week
// - outed per day

export interface InOutBudgetSplitObject {
    outBudgetSplitMap: Map<string, GraphSplitExtended>;
    inBudgetSplitMap: Map<string, GraphSplitExtended>;
    outBudgetSplitSum: number;
    inBudgetSplitSum: number;
}

export interface DeltaBudgetObject {
    deltaPerMonth: number;
    deltaPerWeek: number;
    deltaPerDay: number;
}

export interface InOutCurrentSplitObject {
    outCurrentSplitList: GraphSplitExtended[];
    inCurrentSplitList: GraphSplitExtended[];
    outCurrentSplitSum: number;
    inCurrentSplitSum: number;
    outBudgetedCurrentSumMap: Map<string, number>;
    inBudgetedCurrentSumMap: Map<string, number>;
    currentSumMap: Map<string, number>;
    outBudgetedCurrentSplitSum: number;
    inBudgetedCurrentSplitSum: number;
    outNoneBudgetedCurrentSplitList: GraphSplitExtended[];
    inNoneBudgetedCurrentSplitList: GraphSplitExtended[];
    outNoneBudgetedCurrentSplitSum: number;
    inNoneBudgetedCurrentSplitSum: number;
}

export interface DeltaCurrentObject {
    deltaPerMonth: number;
    deltaPerWeek: number;
    deltaPerDay: number;
}

interface IBudgetTransactionState {
    budgetDate: Date;
    wipTransaction: FlatCashTransaction | null;
    contextAccount: CashAccount | null;
    isPageOpen: boolean;
}

const state: IBudgetTransactionState = {
    budgetDate: DateUtils.newDate(),
    wipTransaction: null,
    contextAccount: null,
    isPageOpen: false,
};

const getters = {
    getField,
    inOutBudgetSplitObject(
        state: IBudgetTransactionState,
        getters,
        rootState,
    ): InOutBudgetSplitObject {
        const result: InOutBudgetSplitObject = {
            outBudgetSplitMap: new Map(),
            inBudgetSplitMap: new Map(),
            outBudgetSplitSum: 0,
            inBudgetSplitSum: 0,
        };
        const contextAccount = state.contextAccount;
        const budgetSplitList: GraphSplitExtended[] = rootState.PermanentData.budgetSplitList;
        const accountDescendantMap: Map<number, number[]> =
            rootState.PermanentData.accountDescendantMap;
        if (!state.isPageOpen || !contextAccount || budgetSplitList.length === 0) {
            return result;
        }
        const accountDescendantList = [
            ...(accountDescendantMap.get(contextAccount.id) || []),
            contextAccount.id,
        ];
        for (const budgetSplit of budgetSplitList) {
            if (
                accountDescendantList.includes(budgetSplit.accountId) &&
                !accountDescendantList.includes(budgetSplit.otherSplitAccountId)
            ) {
                const key = CashBudgetUtils.generateKey(budgetSplit);
                if (budgetSplit.isToSplit) {
                    // It's a in split
                    result.inBudgetSplitMap.set(key, budgetSplit);
                    result.inBudgetSplitSum += +budgetSplit.amount;
                } else {
                    // It's a out split
                    result.outBudgetSplitMap.set(key, budgetSplit);
                    result.outBudgetSplitSum += +budgetSplit.amount;
                }
            }
        }

        return result;
    },
    deltaBudgetObject(state: IBudgetTransactionState, getters): DeltaBudgetObject {
        const result: DeltaBudgetObject = {
            deltaPerMonth: 0,
            deltaPerWeek: 0,
            deltaPerDay: 0,
        };
        const budgetDate = state.budgetDate;
        const inOutBudgetSplitObject: InOutBudgetSplitObject = getters.inOutBudgetSplitObject;
        if (!state.isPageOpen || !budgetDate || !inOutBudgetSplitObject) {
            return result;
        }
        const delta =
            inOutBudgetSplitObject.inBudgetSplitSum - inOutBudgetSplitObject.outBudgetSplitSum;
        const numberOfDays = getDaysInMonth(budgetDate);
        const deltaPerDay = delta / numberOfDays;
        return {
            deltaPerMonth: delta,
            deltaPerWeek: deltaPerDay * 7,
            deltaPerDay,
        };
    },
    inOutCurrentSplitObject(
        state: IBudgetTransactionState,
        getters,
        rootState,
    ): InOutCurrentSplitObject {
        const result: InOutCurrentSplitObject = {
            outCurrentSplitList: [],
            inCurrentSplitList: [],
            outCurrentSplitSum: 0,
            inCurrentSplitSum: 0,
            outBudgetedCurrentSumMap: new Map(),
            inBudgetedCurrentSumMap: new Map(),
            currentSumMap: new Map(),
            outBudgetedCurrentSplitSum: 0,
            inBudgetedCurrentSplitSum: 0,
            outNoneBudgetedCurrentSplitList: [],
            inNoneBudgetedCurrentSplitList: [],
            outNoneBudgetedCurrentSplitSum: 0,
            inNoneBudgetedCurrentSplitSum: 0,
        };
        const inOutBudgetSplitObject: InOutBudgetSplitObject = getters.inOutBudgetSplitObject;
        const contextAccount = state.contextAccount;
        const splitList: GraphSplitExtended[] = rootState.TimeFrameData.splitList;
        const budgetDate = state.budgetDate;
        const accountDescendantMap: Map<number, number[]> =
            rootState.PermanentData.accountDescendantMap;
        if (
            !state.isPageOpen ||
            !inOutBudgetSplitObject ||
            !contextAccount ||
            splitList.length === 0 ||
            !budgetDate
        ) {
            return result;
        }
        const accountDescendantList = [
            ...(accountDescendantMap.get(contextAccount.id) || []),
            contextAccount.id,
        ];
        for (const split of splitList) {
            if (
                isSameMonth(split.transactionDate, budgetDate) &&
                accountDescendantList.includes(split.accountId) &&
                !accountDescendantList.includes(split.otherSplitAccountId)
            ) {
                const key = CashBudgetUtils.generateKey(split);
                if (split.isToSplit) {
                    // It's a in split
                    if (inOutBudgetSplitObject.inBudgetSplitMap.get(key)) {
                        // It's part of a budgeted account
                        let oneSum = result.inBudgetedCurrentSumMap.get(key) || 0;
                        oneSum += split.amount;
                        result.inBudgetedCurrentSumMap.set(key, oneSum);
                        result.currentSumMap.set(key, oneSum);
                        result.inBudgetedCurrentSplitSum += split.amount;
                    } else {
                        result.inNoneBudgetedCurrentSplitList.push(split);
                        result.inNoneBudgetedCurrentSplitSum += split.amount;
                    }
                    result.inCurrentSplitList.push(split);
                    result.inCurrentSplitSum += split.amount;
                } else {
                    // It's a out split
                    if (inOutBudgetSplitObject.outBudgetSplitMap.get(key)) {
                        // It's part of a budgeted account
                        let oneSum = result.outBudgetedCurrentSumMap.get(key) || 0;
                        oneSum += split.amount;
                        result.outBudgetedCurrentSumMap.set(key, oneSum);
                        result.currentSumMap.set(key, oneSum);
                        result.outBudgetedCurrentSplitSum += split.amount;
                    } else {
                        result.outNoneBudgetedCurrentSplitList.push(split);
                        result.outNoneBudgetedCurrentSplitSum += split.amount;
                    }
                    result.outCurrentSplitList.push(split);
                    result.outCurrentSplitSum += split.amount;
                }
            }
        }
        return result;
    },
    deltaCurrentObject(state: IBudgetTransactionState, getters): DeltaCurrentObject {
        const result: DeltaCurrentObject = {
            deltaPerMonth: 0,
            deltaPerWeek: 0,
            deltaPerDay: 0,
        };
        const budgetDate = state.budgetDate;
        const inOutCurrentSplitObject: InOutCurrentSplitObject = getters.inOutCurrentSplitObject;
        if (!state.isPageOpen || !budgetDate || !inOutCurrentSplitObject) {
            return result;
        }
        const delta = inOutCurrentSplitObject.outNoneBudgetedCurrentSplitSum;
        const numberOfDays = getDaysInMonth(budgetDate);
        const deltaPerDay = delta / numberOfDays;
        return {
            deltaPerMonth: delta,
            deltaPerWeek: deltaPerDay * 7,
            deltaPerDay,
        };
    },
    optionChart(state: IBudgetTransactionState, getters, rootState, rootGetters) {
        const inOutCurrentSplitObject: InOutCurrentSplitObject = getters.inOutCurrentSplitObject;
        const inOutBudgetSplitObject: InOutBudgetSplitObject = getters.inOutBudgetSplitObject;
        const preferedCurrency = rootState.App.preferences
            ? rootState.App.preferences.preferedCurrency
            : null;
        const accountMap = rootState.PermanentData.accountMap;
        const currencyMap = rootGetters['PermanentData/currencyMap'];
        const service = Container.get(CashGraphService);
        if (
            !state.isPageOpen ||
            !inOutBudgetSplitObject ||
            !inOutBudgetSplitObject ||
            !preferedCurrency ||
            !accountMap ||
            !currencyMap
        ) {
            return {};
        }
        return service.generateBudgetGraph(
            inOutBudgetSplitObject.inBudgetSplitSum,
            -inOutBudgetSplitObject.outBudgetSplitSum,
            inOutCurrentSplitObject.inBudgetedCurrentSplitSum,
            -inOutCurrentSplitObject.outBudgetedCurrentSplitSum,
            inOutCurrentSplitObject.inNoneBudgetedCurrentSplitSum,
            -inOutCurrentSplitObject.outNoneBudgetedCurrentSplitSum,
            state.budgetDate,
            preferedCurrency,
            accountMap,
            currencyMap,
        );
    },
};

const mutations = {
    updateField,
};

const actions = {
    async initWipTransaction(
        { commit }: Vuex.ActionContext<IBudgetTransactionState, any>,
        obj: { transactionId: string; duplicate: boolean },
    ) {
        let flatTransaction;
        if (obj.transactionId === 'new') {
            flatTransaction = new FlatCashTransaction({ description: 'NO DESCRIPTION' });
        } else {
            const service = Container.get(CashBudgetTransactionService);
            flatTransaction = await service.getFlat(obj.transactionId);
        }
        commit('updateField', { path: 'wipTransaction', value: flatTransaction });
    },
    async removeWipTransaction({ commit }: Vuex.ActionContext<IBudgetTransactionState, any>) {
        commit('updateField', { path: 'wipTransaction', value: null });
    },
    async saveTransaction(
        { dispatch, commit }: Vuex.ActionContext<IBudgetTransactionState, any>,
        wipTransaction: FlatCashTransaction,
    ) {
        const service = Container.get(CashBudgetTransactionService);
        await service.save(wipTransaction);
        Notification.success({
            title: i18n.t('Budget entry saved').toString(),
            message: '',
        });
        commit('updateField', { path: 'wipTransaction', value: null });
        await dispatch('PermanentData/fillBudgetSplit', {}, { root: true });
    },
    async saveTransactionList(
        { dispatch, commit }: Vuex.ActionContext<IBudgetTransactionState, any>,
        wipTransactionList: FlatCashTransaction[],
    ) {
        const service = Container.get(CashBudgetTransactionService);
        await service.saveList(wipTransactionList);
        Notification.success({
            title: i18n
                .t('{total} budget entries saved', {
                    total: wipTransactionList.filter((item) => !item.doNotImport).length,
                })
                .toString(),
            message: '',
        });
        commit('updateField', { path: 'wipTransaction', value: null });
        await dispatch('PermanentData/fillBudgetSplit', {}, { root: true });
    },
    async deleteTransaction(
        { dispatch }: Vuex.ActionContext<IBudgetTransactionState, any>,
        transactionId: string,
    ) {
        const service = Container.get(CashBudgetTransactionService);
        await service.delete(transactionId);
        Notification.success({
            title: i18n.t('Budget entry deleted').toString(),
            message: '',
        });
        await dispatch('PermanentData/fillBudgetSplit', {}, { root: true });
    },
    async deleteTransactionList(
        { dispatch }: Vuex.ActionContext<IBudgetTransactionState, any>,
        transactionIdList: string[],
    ) {
        if (transactionIdList.length === 1) {
            await dispatch('deleteTransaction', transactionIdList[0]);
        } else {
            const service = Container.get(CashBudgetTransactionService);
            await service.deleteList(transactionIdList);
            Notification.success({
                title: i18n
                    .t('{total} transactions deleted', { total: transactionIdList.length })
                    .toString(),
                message: '',
            });
            await dispatch('PermanentData/fillBudgetSplit', {}, { root: true });
        }
    },
    async updateBudgetDate(
        { commit }: Vuex.ActionContext<IBudgetTransactionState, any>,
        budgetDate: Date,
    ) {
        commit('updateField', { path: 'budgetDate', value: budgetDate });
    },
    async adjustBudgetDateIfNeeded({
        commit,
        state,
        rootState,
    }: Vuex.ActionContext<IBudgetTransactionState, any>) {
        const parameters = rootState.TimeFrameData.parameters;
        const transactionDateFrom = parameters.transactionDateFrom;
        const transactionDateTo = parameters.transactionDateTo;

        if (
            isAfter(state.budgetDate, transactionDateTo) ||
            isBefore(state.budgetDate, transactionDateFrom)
        ) {
            const newBudgetDate = transactionDateTo;
            commit('updateField', { path: 'budgetDate', value: newBudgetDate });
        }
    },
    async updateContextAccount(
        { commit, rootState }: Vuex.ActionContext<IBudgetTransactionState, any>,
        account: CashAccount,
    ) {
        if (!account) {
            account = rootState.PermanentData.accountTree.find((item) => item.code === 'ASS');
        }
        commit('updateField', { path: 'contextAccount', value: account });
    },
    async updateIsPageOpen(
        { commit }: Vuex.ActionContext<IBudgetTransactionState, any>,
        isPageOpen: boolean,
    ) {
        commit('updateField', { path: 'isPageOpen', value: isPageOpen });
    },
};

export default {
    namespaced: true,
    state,
    getters,
    mutations,
    actions,
};
