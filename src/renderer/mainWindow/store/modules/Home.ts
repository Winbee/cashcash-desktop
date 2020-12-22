import * as Vuex from 'vuex';
import { Container } from 'typedi';
import { getField, updateField } from 'vuex-map-fields';
import CashGraphService from '../../backend/service/CashGraphService';
import {
    TransactionParameters,
    simpleTransactionParameters,
} from '../../backend/service/dto/Parameters';
import _ from 'lodash';
import CashAccountType from '../../backend/database/entity/enumeration/CashAccountType';

interface IAccountPreviewState {
    incomeOptionChart: any | null;
    expenseOptionChart: any | null;
    liabilityOptionChart: any | null;
    assetOptionChart: any | null;
    optionChart2: any | null;
    showTopTen: boolean;
}

const state: IAccountPreviewState = {
    incomeOptionChart: null,
    expenseOptionChart: null,
    liabilityOptionChart: null,
    assetOptionChart: null,
    optionChart2: null,
    showTopTen: true,
};

const getters = {
    getField,
};

const mutations = {
    updateField,
};

const actions = {
    async generateOptionChart({
        commit,
        rootState,
        rootGetters,
    }: Vuex.ActionContext<IAccountPreviewState, any>) {
        const service = Container.get(CashGraphService);
        let parameters: TransactionParameters = {
            ...simpleTransactionParameters,
            accountTypeList: [CashAccountType.INCOME],
        };

        const inversed = rootState.App.preferences.jsonPreferences.invertIncAndExp;
        const maxSize = state.showTopTen ? 10 : 1;
        let optionChart = await service.generateTopBarGraph(
            parameters,
            _.cloneDeep(rootState.TimeFrameData.splitList),
            rootState.PermanentData.accountMap,
            rootGetters['PermanentData/currencyMap'],
            inversed,
            maxSize,
        );
        commit('updateField', { path: 'incomeOptionChart', value: optionChart });

        parameters = {
            ...simpleTransactionParameters,
            accountTypeList: [CashAccountType.EXPENSE],
        };
        optionChart = await service.generateTopBarGraph(
            parameters,
            _.cloneDeep(rootState.TimeFrameData.splitList),
            rootState.PermanentData.accountMap,
            rootGetters['PermanentData/currencyMap'],
            inversed,
            maxSize,
        );
        commit('updateField', { path: 'expenseOptionChart', value: optionChart });

        parameters = {
            ...simpleTransactionParameters,
            accountTypeList: [CashAccountType.ASSET],
        };
        optionChart = await service.generateTopBarGraph(
            parameters,
            _.cloneDeep(rootState.TimeFrameData.splitList),
            rootState.PermanentData.accountMap,
            rootGetters['PermanentData/currencyMap'],
            false,
            maxSize,
        );
        commit('updateField', { path: 'assetOptionChart', value: optionChart });

        parameters = {
            ...simpleTransactionParameters,
            accountTypeList: [CashAccountType.LIABILITY],
        };
        optionChart = await service.generateTopBarGraph(
            parameters,
            _.cloneDeep(rootState.TimeFrameData.splitList),
            rootState.PermanentData.accountMap,
            rootGetters['PermanentData/currencyMap'],
            false,
            maxSize,
        );
        commit('updateField', { path: 'liabilityOptionChart', value: optionChart });

        const optionChart2 = await service.generateActivityGraph(
            rootState.TimeFrameData.parameters,
            _.cloneDeep(rootState.TimeFrameData.splitList),
            rootState.PermanentData.accountMap,
            rootGetters['PermanentData/currencyMap'],
        );
        commit('updateField', { path: 'optionChart2', value: optionChart2 });
    },
    async updateShowTopTen(
        { commit }: Vuex.ActionContext<IAccountPreviewState, any>,
        value: boolean,
    ) {
        commit('updateField', { path: 'showTopTen', value: !!value });
    },
};

export default {
    namespaced: true,
    state,
    getters,
    mutations,
    actions,
};
