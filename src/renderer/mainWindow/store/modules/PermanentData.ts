import * as Vuex from 'vuex';
import CashAccountService from '../../backend/service/CashAccountService';
import { Container } from 'typedi';
import CashAccount from '../../backend/database/entity/CashAccount';
import { getField, updateField } from 'vuex-map-fields';
import CashCurrency from '../../backend/database/entity/CashCurrency';
import CashCurrencyService from '../../backend/service/CashCurrencyService';
import CashAccountUtils from '../../backend/utils/CashAccountUtils';
import GraphSplitExtended from '../../backend/service/dto/GraphSplitExtended';
import CashBudgetSplitService from '../../backend/service/CashBudgetSplitService';
import CashConverterService from '../../backend/service/CashConverterService';
import { simpleTransactionParameters } from '../../backend/service/dto/Parameters';

interface IPermanentDataState {
    accountList: CashAccount[];
    accountMap: Map<number, CashAccount>;
    accountDescendantMap: Map<number, number[]>;
    accountTree: CashAccount[];
    currencyList: CashCurrency[];
    budgetSplitList: GraphSplitExtended[];
}

const state: IPermanentDataState = {
    accountList: [],
    accountMap: new Map(),
    accountDescendantMap: new Map(),
    accountTree: [],
    currencyList: [],
    budgetSplitList: [],
};

const getters = {
    getField,
    directoryAccountList(state: IPermanentDataState): CashAccount[] {
        return state.accountList.filter((item) => item.isDirectory === true);
    },
    leafAccountList(state: IPermanentDataState): CashAccount[] {
        return state.accountList.filter((item) => item.isDirectory === false);
    },
    currencyMap(state: IPermanentDataState): Map<number, CashCurrency> {
        return new Map(state.currencyList.map((currency) => [currency.id, currency]));
    },
};

const mutations = {
    updateField,
};

const actions = {
    async fillAccount({ commit }: Vuex.ActionContext<IPermanentDataState, any>) {
        const service = Container.get(CashAccountService);
        const list = await service.getList();
        list.sort((a, b) => a.name.localeCompare(b.name));
        const { accountTree, accountMap, accountDescendantMap } = CashAccountUtils.listToTreeAndMap(
            list,
        );
        commit('updateField', { path: 'accountList', value: list });
        commit('updateField', { path: 'accountTree', value: accountTree });
        commit('updateField', { path: 'accountMap', value: accountMap });
        commit('updateField', { path: 'accountDescendantMap', value: accountDescendantMap });
    },
    async fillCurrency({ commit }: Vuex.ActionContext<IPermanentDataState, any>) {
        const service = Container.get(CashCurrencyService);
        const list = await service.getList();
        commit('updateField', { path: 'currencyList', value: list });
    },
    async fillBudgetSplit({ commit, rootState }: Vuex.ActionContext<IPermanentDataState, any>) {
        const service = Container.get(CashBudgetSplitService);

        const parameters = {
            ...simpleTransactionParameters,
            outputCurrency: rootState.App.preferences.preferedCurrency,
        };
        const splitList = await service.getListByParam(
            parameters,
            rootState.PermanentData.accountMap,
        );
        const convertService = Container.get(CashConverterService);
        const result = convertService.convertToGraphSplitListAndGetActiveAccounts(splitList);
        commit('updateField', { path: 'budgetSplitList', value: result.splitList });
    },
};

export default {
    namespaced: true,
    state,
    getters,
    mutations,
    actions,
};
