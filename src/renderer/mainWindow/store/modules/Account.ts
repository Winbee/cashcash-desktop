import * as Vuex from 'vuex';
import CashAccountService from '../../backend/service/CashAccountService';
import { Container } from 'typedi';
import CashAccount from '../../backend/database/entity/CashAccount';
import { getField, updateField } from 'vuex-map-fields';
import CashSplitService from '../../backend/service/CashSplitService';
import CashCurrency from '../../backend/database/entity/CashCurrency';
import { Notification } from 'element-ui';
import CashAccountUtils from '../../backend/utils/CashAccountUtils';
import { MockService } from '../../backend/service/MockService';
import i18n from '@/renderer/common/i18n/i18n';

interface IAccountState {
    selectedInternalAccount: CashAccount | null;
    selectedExternalAccount: CashAccount | null;
    wipAccount: CashAccount | null;
    wipAccountHasSplits: boolean;
    showActiveAccountOnly: boolean;
    groupByParentAccounts: boolean;
}

const state: IAccountState = {
    selectedInternalAccount: null,
    selectedExternalAccount: null,
    wipAccount: null,
    wipAccountHasSplits: true,
    showActiveAccountOnly: false,
    groupByParentAccounts: false,
};

const getters = {
    getField,
};

const mutations = {
    updateField,
};

const actions = {
    async initWipAccount(
        { commit, state }: Vuex.ActionContext<IAccountState, any>,
        { accountId, parentAccount }: { accountId: string; parentAccount: CashAccount },
    ) {
        let wipAccount;
        let wipAccountHasSplits;
        if (accountId === 'new') {
            wipAccount = new CashAccount({ parentAccount });
            wipAccountHasSplits = false;
        } else {
            const service = Container.get(CashAccountService);
            wipAccount = await service.get(accountId);
            const splitService = Container.get(CashSplitService);
            wipAccountHasSplits = await splitService.hasSplits(accountId);
        }
        commit('updateField', { path: 'wipAccount', value: wipAccount });
        commit('updateField', { path: 'wipAccountHasSplits', value: wipAccountHasSplits });
    },
    async saveAccount(
        { dispatch, commit, rootState }: Vuex.ActionContext<IAccountState, any>,
        wipAccount: CashAccount,
    ) {
        const service = Container.get(CashAccountService);
        await service.save(wipAccount, rootState.PermanentData.accountMap);
        Notification.success({
            title: i18n.t('Account saved').toString(),
            message: '',
        });
        await dispatch('PermanentData/fillAccount', {}, { root: true });
        await dispatch('PermanentData/fillBudgetSplit', {}, { root: true });
        await dispatch('TimeFrameData/resetAllSplit', {}, { root: true });
        commit('updateField', { path: 'wipAccount', value: null });
        await dispatch('selectAccount', wipAccount);
    },
    async selectAccount(
        { commit }: Vuex.ActionContext<IAccountState, any>,
        selectedAccount: CashAccount,
    ) {
        if (CashAccountUtils.isInternal(selectedAccount)) {
            commit('updateField', { path: 'selectedInternalAccount', value: selectedAccount });
        } else {
            commit('updateField', { path: 'selectedExternalAccount', value: selectedAccount });
        }
    },
    async deleteAccount(
        { dispatch, commit, state, rootState }: Vuex.ActionContext<IAccountState, any>,
        accountId: string,
    ) {
        const service = Container.get(CashAccountService);
        await service.delete(accountId);
        const deletedAccount = rootState.PermanentData.accountMap.get(accountId);
        const accountToSelect = rootState.PermanentData.accountMap.get(
            deletedAccount.parentAccountId,
        );
        Notification.success({
            title: i18n.t('Account deleted').toString(),
            message: '',
        });
        if (state.selectedInternalAccount && state.selectedInternalAccount.id === +accountId) {
            commit('updateField', { path: 'selectedInternalAccount', value: null });
        } else if (
            state.selectedExternalAccount &&
            state.selectedExternalAccount.id === +accountId
        ) {
            commit('updateField', { path: 'selectedExternalAccount', value: null });
        }
        await dispatch('PermanentData/fillAccount', {}, { root: true });
        await dispatch('PermanentData/fillBudgetSplit', {}, { root: true });
        await dispatch('TimeFrameData/resetAllSplit', {}, { root: true });
        await dispatch('selectAccount', accountToSelect);
    },
    async updateShowActiveAccountOnly(
        { commit }: Vuex.ActionContext<IAccountState, any>,
        value: boolean,
    ) {
        commit('updateField', {
            path: 'showActiveAccountOnly',
            value: !!value,
        });
    },
    async updateGroupByParentAccounts(
        { commit }: Vuex.ActionContext<IAccountState, any>,
        value: boolean,
    ) {
        commit('updateField', {
            path: 'groupByParentAccounts',
            value: !!value,
        });
    },
    async createAllAccounts(
        { dispatch }: Vuex.ActionContext<IAccountState, any>,
        currency: CashCurrency,
    ) {
        const service = Container.get(CashAccountService);
        await service.init(currency);
        if (process.env.NODE_ENV === 'development') {
            const mockService = Container.get(MockService);
            await mockService.addMockData();
        }
        await dispatch('PermanentData/fillAccount', {}, { root: true });
        await dispatch('PermanentData/fillBudgetSplit', {}, { root: true });
        await dispatch('TimeFrameData/resetAllSplit', {}, { root: true });
    },
};

export default {
    namespaced: true,
    state,
    getters,
    mutations,
    actions,
};
