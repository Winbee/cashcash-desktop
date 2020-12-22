import * as Vuex from 'vuex';
import { Container } from 'typedi';
import _ from 'lodash';

import { getField, updateField } from 'vuex-map-fields';
import CashRule from '../../backend/database/entity/CashRule';
import FlatCashTransaction from '../../backend/database/entity/proxy/FlatCashTransaction';
import CashRuleService from '../../backend/service/CashRuleService';
import CashTransactionService from '../../backend/service/CashTransactionService';
import CashTransaction from '../../backend/database/entity/CashTransaction';
import CashRuleToApply from '../../backend/database/entity/enumeration/CashRuleToApply';

interface IMultiEditState {
    transactionListId: string[];
    wipTransactionList: FlatCashTransaction[];
    rulesToApply: CashRuleToApply;
    selectedRuleList: CashRule[];
    skipIfNoRuleApply: boolean;
    progress: number;
}

const state: IMultiEditState = {
    transactionListId: [],
    wipTransactionList: [],
    rulesToApply: CashRuleToApply.NONE,
    selectedRuleList: [],
    skipIfNoRuleApply: false,
    progress: 0,
};

const getters = {
    getField,
};

const mutations = {
    updateField,
    reset(state: IMultiEditState) {
        state = {
            transactionListId: [],
            wipTransactionList: [],
            rulesToApply: CashRuleToApply.NONE,
            selectedRuleList: [],
            skipIfNoRuleApply: false,
            progress: 0,
        };
    },
};

const actions = {
    async initWipTransaction(
        { commit }: Vuex.ActionContext<IMultiEditState, any>,
        transactionList: CashTransaction[] = [],
    ) {
        const transactionListId = transactionList.map((item) => item.id.toString());
        commit('updateField', { path: 'transactionListId', value: transactionListId });
    },
    async fillParameters(
        { commit, state }: Vuex.ActionContext<IMultiEditState, any>,
        parameters: {
            rulesToApply: CashRuleToApply;
            selectedRuleList: CashRule[];
            skipIfNoRuleApply: boolean;
        },
    ) {
        commit('updateField', { path: 'rulesToApply', value: parameters.rulesToApply });
        commit('updateField', { path: 'selectedRuleList', value: parameters.selectedRuleList });
        commit('updateField', { path: 'skipIfNoRuleApply', value: parameters.skipIfNoRuleApply });
    },
    async doMultiEdit({
        commit,
        state,
        rootState,
        dispatch,
    }: Vuex.ActionContext<IMultiEditState, any>) {
        commit('updateField', { path: 'progress', value: 0 });
        const service = Container.get(CashRuleService);
        let selectedRuleList;
        if (state.rulesToApply === CashRuleToApply.NONE) {
            selectedRuleList = [];
        } else if (state.rulesToApply === CashRuleToApply.ALL) {
            selectedRuleList = await service.getList();
        } else {
            selectedRuleList = _.cloneDeep(state.selectedRuleList);
        }
        const transactionService = Container.get(CashTransactionService);
        let flatTransactionList = await transactionService.getFlatList(state.transactionListId);
        flatTransactionList = await service.assignListWithRules(
            flatTransactionList,
            rootState.PermanentData.accountMap,
            selectedRuleList,
            state.skipIfNoRuleApply,
            (progress) => commit('updateField', { path: 'progress', value: progress }),
        );
        commit('updateField', { path: 'wipTransactionList', value: flatTransactionList });
    },
    async reset({ commit, state }: Vuex.ActionContext<IMultiEditState, any>) {
        commit('reset');
    },
};

export default {
    namespaced: true,
    state,
    getters,
    mutations,
    actions,
};
