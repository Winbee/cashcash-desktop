import * as Vuex from 'vuex';
import { Container } from 'typedi';
import CashAccount from '../../backend/database/entity/CashAccount';
import { getField, updateField } from 'vuex-map-fields';
import CashGraphService from '../../backend/service/CashGraphService';
import { TransactionParameters } from '../../backend/service/dto/Parameters';
import CashAccountUtils from '../../backend/utils/CashAccountUtils';
import _ from 'lodash';
import CashAccountType from '../../backend/database/entity/enumeration/CashAccountType';

interface IAccountPreviewState {
    accountPreview: CashAccount | null;
    optionChart: any | null;
    optionChart2: any | null;
    optionChart3: any | null;
    optionChart4: any | null;
}

const state: IAccountPreviewState = {
    accountPreview: null,
    optionChart: null,
    optionChart2: null,
    optionChart3: null,
    optionChart4: null,
};

const getters = {
    getField,
};

const mutations = {
    updateField,
};

const actions = {
    async initAccountPreview(
        { commit, rootState }: Vuex.ActionContext<IAccountPreviewState, any>,
        accountId: string,
    ) {
        const account = rootState.PermanentData.accountMap.get(accountId);
        commit('updateField', { path: 'accountPreview', value: account });
    },
    async generateOptionChart({
        commit,
        state,
        rootState,
        rootGetters,
    }: Vuex.ActionContext<IAccountPreviewState, any>) {
        if (!state.accountPreview) {
            return;
        }
        const service = Container.get(CashGraphService);
        const accountIdList = CashAccountUtils.extractAccountAndSubAccounts(
            rootState.PermanentData.accountMap,
            state.accountPreview.id,
        );
        const parameters: TransactionParameters = {
            ...rootState.TimeFrameData.parameters,
            accountIdList,
        };
        let optionChart;
        let optionChart2;
        let optionChart3;
        let optionChart4;
        if (CashAccountUtils.isExternal(state.accountPreview)) {
            const inversed = state.accountPreview.type === CashAccountType.INCOME;
            const level = rootState.Account.groupByParentAccounts
                ? state.accountPreview.level + 1
                : undefined;
            optionChart = await service.generateExternalGraph(
                parameters,
                _.cloneDeep(rootState.TimeFrameData.splitList),
                rootState.PermanentData.accountMap,
                rootGetters['PermanentData/currencyMap'],
                inversed,
                level,
            );

            const useOriginalCurrency = false;
            const useOtherSplitAccountId = false;
            optionChart2 = await service.generatePieGraph(
                parameters,
                _.cloneDeep(rootState.TimeFrameData.splitList),
                rootState.PermanentData.accountMap,
                rootGetters['PermanentData/currencyMap'],
                useOriginalCurrency,
                100,
                inversed ? 'isFromSplit' : 'isToSplit',
                useOtherSplitAccountId,
                level,
            );
        } else {
            const useOriginalCurrency = !state.accountPreview.isDirectory;
            const merged = true;
            const useOtherSplitAccountId = true;
            optionChart = await service.generateInternalGraph(
                parameters,
                _.cloneDeep(rootState.TimeFrameData.splitList),
                _.cloneDeep(rootState.TimeFrameData.splitSumList),
                rootState.PermanentData.accountMap,
                rootGetters['PermanentData/currencyMap'],
                useOriginalCurrency,
                merged,
            );
            optionChart2 = await service.generateInOutGraph(
                parameters,
                _.cloneDeep(rootState.TimeFrameData.splitList),
                rootState.PermanentData.accountMap,
                rootGetters['PermanentData/currencyMap'],
                useOriginalCurrency,
            );

            const level = rootState.Account.groupByParentAccounts ? 1 : undefined;

            optionChart3 = await service.generatePieGraph(
                parameters,
                _.cloneDeep(rootState.TimeFrameData.splitList),
                rootState.PermanentData.accountMap,
                rootGetters['PermanentData/currencyMap'],
                useOriginalCurrency,
                100,
                'isToSplit',
                useOtherSplitAccountId,
                level,
            );

            optionChart4 = await service.generatePieGraph(
                parameters,
                _.cloneDeep(rootState.TimeFrameData.splitList),
                rootState.PermanentData.accountMap,
                rootGetters['PermanentData/currencyMap'],
                useOriginalCurrency,
                100,
                'isFromSplit',
                useOtherSplitAccountId,
                level,
            );
        }

        commit('updateField', { path: 'optionChart', value: optionChart });
        commit('updateField', { path: 'optionChart2', value: optionChart2 });
        commit('updateField', { path: 'optionChart3', value: optionChart3 });
        commit('updateField', { path: 'optionChart4', value: optionChart4 });
    },
};

export default {
    namespaced: true,
    state,
    getters,
    mutations,
    actions,
};
