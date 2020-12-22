import * as Vuex from 'vuex';
import { Container } from 'typedi';
import CashTransaction from '../../backend/database/entity/CashTransaction';
import CashTransactionService from '../../backend/service/CashTransactionService';
import FlatCashTransaction from '../../backend/database/entity/proxy/FlatCashTransaction';
import { getField, updateField } from 'vuex-map-fields';
import Page from '../../backend/service/dto/Page';
import { Notification } from 'element-ui';
import i18n from '@/renderer/common/i18n/i18n';

interface ITransactionState {
    transactionPage: number;
    transactionPageResult: Page<CashTransaction>;
    wipTransaction: FlatCashTransaction | null;
}

const state: ITransactionState = {
    transactionPage: 1,
    transactionPageResult: {
        itemList: [],
        currentPage: 1,
        itemPerPage: 0,
        totalItem: 0,
    },
    wipTransaction: null,
};

const getters = {
    getField,
};

const mutations = {
    updateField,
};

const actions = {
    async fillTransaction({
        commit,
        state,
        rootState,
    }: Vuex.ActionContext<ITransactionState, any>) {
        const service = Container.get(CashTransactionService);
        const finalParameter = {
            ...rootState.TimeFrameData.parameters,
        };
        const transactionPageResult = await service.getPageByParam(
            state.transactionPage,
            finalParameter,
            rootState.PermanentData.accountMap,
        );
        commit('updateField', { path: 'transactionPageResult', value: transactionPageResult });
    },
    async initWipTransaction(
        { commit }: Vuex.ActionContext<ITransactionState, any>,
        obj: { transactionId: string; duplicate: boolean },
    ) {
        let flatTransaction;
        if (obj.transactionId === 'new') {
            flatTransaction = new FlatCashTransaction();
        } else {
            const service = Container.get(CashTransactionService);
            if (obj.duplicate) {
                flatTransaction = await service.duplicate(obj.transactionId);
            } else {
                flatTransaction = await service.getFlat(obj.transactionId);
            }
        }
        commit('updateField', { path: 'wipTransaction', value: flatTransaction });
    },
    async removeWipTransaction({ commit }: Vuex.ActionContext<ITransactionState, any>) {
        commit('updateField', { path: 'wipTransaction', value: null });
    },
    async saveTransaction(
        { dispatch, commit }: Vuex.ActionContext<ITransactionState, any>,
        wipTransaction: FlatCashTransaction,
    ) {
        const service = Container.get(CashTransactionService);
        await service.save(wipTransaction);
        Notification.success({
            title: i18n.t('Transaction saved').toString(),
            message: '',
        });
        await dispatch('fillTransaction');
        commit('updateField', { path: 'wipTransaction', value: null });
        await dispatch('TimeFrameData/resetAllSplit', {}, { root: true });
    },
    async saveTransactionList(
        { dispatch, commit }: Vuex.ActionContext<ITransactionState, any>,
        wipTransactionList: FlatCashTransaction[],
    ) {
        const service = Container.get(CashTransactionService);
        await service.saveList(wipTransactionList);
        Notification.success({
            title: i18n
                .t('{total} transactions saved', {
                    total: wipTransactionList.filter((item) => !item.doNotImport).length,
                })
                .toString(),
            message: '',
        });
        await dispatch('fillTransaction');
        commit('updateField', { path: 'wipTransaction', value: null });
        await dispatch('TimeFrameData/resetAllSplit', {}, { root: true });
    },
    async deleteTransaction(
        { dispatch }: Vuex.ActionContext<ITransactionState, any>,
        transactionId: string,
    ) {
        const service = Container.get(CashTransactionService);
        await service.delete(transactionId);
        Notification.success({
            title: i18n.t('Transaction deleted').toString(),
            message: '',
        });
        await dispatch('fillTransaction');
        await dispatch('TimeFrameData/resetAllSplit', {}, { root: true });
    },
    async deleteTransactionList(
        { dispatch }: Vuex.ActionContext<ITransactionState, any>,
        transactionIdList: string[],
    ) {
        if (transactionIdList.length === 1) {
            await dispatch('deleteTransaction', transactionIdList[0]);
        } else {
            const service = Container.get(CashTransactionService);
            await service.deleteList(transactionIdList);
            Notification.success({
                title: i18n
                    .t('{total} transactions deleted', { total: transactionIdList.length })
                    .toString(),
                message: '',
            });
            await dispatch('fillTransaction');
            await dispatch('TimeFrameData/resetAllSplit', {}, { root: true });
        }
    },
    async updateTransactionPage(
        { commit }: Vuex.ActionContext<ITransactionState, any>,
        transactionPage: number,
    ) {
        commit('updateField', { path: 'transactionPage', value: transactionPage });
    },
};

export default {
    namespaced: true,
    state,
    getters,
    mutations,
    actions,
};
