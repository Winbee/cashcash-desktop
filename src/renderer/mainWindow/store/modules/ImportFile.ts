import * as Vuex from 'vuex';
import { getField, updateField } from 'vuex-map-fields';
import FlatCashTransaction from '../../backend/database/entity/proxy/FlatCashTransaction';
import Papa from 'papaparse';
import CashImportConfig from '../../backend/database/entity/CashImportConfig';
import { Container } from 'typedi';
import CashImportConfigService from '../../backend/service/CashImportConfigService';
import CashImportService from '../../backend/service/CashImportService';
import CashAccount from '../../backend/database/entity/CashAccount';

interface IImportFileState {
    fileName: string | null;
    parsedCsv: Papa.ParseResult | null;
    wipTransactionList: FlatCashTransaction[];
    importConfigList: CashImportConfig[];
    selectedImportConfig: CashImportConfig | null;
    selectedAccount: CashAccount | null;
    progress: number;
}

const state: IImportFileState = {
    fileName: null,
    parsedCsv: null,
    wipTransactionList: [],
    importConfigList: [],
    selectedImportConfig: null,
    selectedAccount: null,
    progress: 0,
};

const getters = {
    getField,
};

const mutations = {
    updateField,
};

const actions = {
    async clear({ commit, state }: Vuex.ActionContext<IImportFileState, any>) {
        commit('updateField', { path: 'wipTransactionList', value: [] });
        commit('updateField', { path: 'parsedCsv', value: null });
        commit('updateField', { path: 'fileName', value: null });
        const cashImportConfigService = Container.get(CashImportConfigService);
        const list = await cashImportConfigService.getList();
        commit('updateField', { path: 'importConfigList', value: list });
        commit('updateField', { path: 'selectedImportConfig', value: null });
    },
    async saveFileName({ commit }: Vuex.ActionContext<IImportFileState, any>, fileName: string) {
        commit('updateField', { path: 'fileName', value: fileName });
    },
    async saveParsedCsv(
        { commit }: Vuex.ActionContext<IImportFileState, any>,
        parsedCsv: Papa.ParseResult,
    ) {
        commit('updateField', { path: 'parsedCsv', value: parsedCsv });
    },
    async saveSelectedImportConfig(
        { commit }: Vuex.ActionContext<IImportFileState, any>,
        selectedImportConfig: CashImportConfig,
    ) {
        commit('updateField', { path: 'selectedImportConfig', value: selectedImportConfig });
    },
    async saveSelectedAccount(
        { commit }: Vuex.ActionContext<IImportFileState, any>,
        selectedAccount: CashAccount,
    ) {
        commit('updateField', { path: 'selectedAccount', value: selectedAccount });
    },
    async convertCsvToTransaction({
        commit,
        state,
        dispatch,
        rootState,
    }: Vuex.ActionContext<IImportFileState, any>) {
        commit('updateField', { path: 'progress', value: 0 });
        const cashImportService = Container.get(CashImportService);
        const transactions = await cashImportService.convertCsvToTransaction(
            state.parsedCsv!,
            state.selectedImportConfig!,
            state.selectedAccount,
            rootState.PermanentData.accountMap,
            false,
            (progress) => commit('updateField', { path: 'progress', value: progress }),
        );
        commit('updateField', {
            path: 'wipTransactionList',
            value: transactions.sort(sortTransactionByAscDate),
        });
    },
};

function sortTransactionByAscDate(a: FlatCashTransaction, b: FlatCashTransaction): number {
    if (!a.transactionDate || (b.transactionDate && a.transactionDate > b.transactionDate)) {
        return 1; // b comes first
    } else if (!b.transactionDate || (a.transactionDate && a.transactionDate < b.transactionDate)) {
        return -1; // a comes first
    } else {
        return 0;
    }
}

export default {
    namespaced: true,
    state,
    getters,
    mutations,
    actions,
};
