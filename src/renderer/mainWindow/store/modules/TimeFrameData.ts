import * as Vuex from 'vuex';
import { Container } from 'typedi';
import { getField, updateField } from 'vuex-map-fields';
import GenericSplit from '../../backend/service/dto/GenericSplit';
import CashSplitSumService from '../../backend/service/CashSplitSumService';
import { AccountCurrencyKey } from '../../backend/database/entity/proxy/CashKey';
import GraphSplit from '../../backend/service/dto/GraphSplit';
import { TransactionParameters } from '../../backend/service/dto/Parameters';
import { addMonths, startOfDay, endOfDay } from 'date-fns';
import CashSplitService from '../../backend/service/CashSplitService';
import CashConverterService from '../../backend/service/CashConverterService';
import RateNotFoundError from '../../backend/database/entity/error/RateNotFoundError';
import { Notification } from 'element-ui';
import WaitType from '../../backend/database/entity/enumeration/WaitType';
import CashAccountUtils from '../../backend/utils/CashAccountUtils';
import Router from '../../router';
import DateUtils from '../../backend/utils/DateUtils';
import GraphSplitExtended from '../../backend/service/dto/GraphSplitExtended';
import i18n from '@/renderer/common/i18n/i18n';

interface ITimeFrameDataState {
    parameters: TransactionParameters;

    splitList: GraphSplitExtended[];
    splitSumList: GraphSplit[];
    activeAccountIdSet: Set<number>;
    splitListValid: boolean;
    splitSumListValid: boolean;
}

const state: ITimeFrameDataState = {
    parameters: {
        accountIdList: [],
        fromAccountIdList: [],
        toAccountIdList: [],
        currencyIdList: [],
        transactionTypeList: [],
        accountTypeList: [],
        createdDateFrom: undefined,
        createdDateTo: undefined,
        updatedDateFrom: undefined,
        updatedDateTo: undefined,
        transactionDateFrom: startOfDay(addMonths(DateUtils.newDate(), -6)),
        transactionDateTo: endOfDay(DateUtils.newDate()),
        searchString: undefined,
        detailSearchString: undefined,
        amountLessThan: undefined,
        amountGreaterThan: undefined,
    },

    splitList: [],
    splitSumList: [],
    activeAccountIdSet: new Set(),
    splitListValid: false,
    splitSumListValid: false,
};

const getters = {
    getField,
    splitSumMap(state: ITimeFrameDataState): Map<AccountCurrencyKey, GenericSplit> {
        return new Map(
            state.splitSumList.map((splitSum) => {
                return [
                    `${CashAccountUtils.generateKey(splitSum.accountId, splitSum.currencyId)}`,
                    splitSum,
                ];
            }) as any,
        );
    },
};

const mutations = {
    updateField,
    updateAll(state: ITimeFrameDataState, { splitList, splitSumList, activeAccountIdSet }: any) {
        state.splitList = splitList;
        state.splitSumList = splitSumList;
        state.activeAccountIdSet = activeAccountIdSet;
        state.splitSumListValid = true;
        state.splitListValid = true;
    },
    updateSplitList(state: ITimeFrameDataState, { splitList, activeAccountIdSet }: any) {
        state.splitList = splitList;
        state.activeAccountIdSet = activeAccountIdSet;
        state.splitListValid = true;
    },
    updateSplitSumList(state: ITimeFrameDataState, { splitSumList }: any) {
        state.splitSumList = splitSumList;
        state.splitSumListValid = true;
    },
    resetAllSplit(state: ITimeFrameDataState) {
        state.splitList = [];
        state.splitSumList = [];
        state.activeAccountIdSet = new Set();
        state.splitListValid = false;
        state.splitSumListValid = false;
    },
};

const actions = {
    async fillAll({
        commit,
        state,
        rootState,
        rootGetters,
        dispatch,
    }: Vuex.ActionContext<ITimeFrameDataState, any>) {
        if (state.splitListValid && state.splitSumListValid) {
            return;
        } else if (!state.splitListValid && state.splitSumListValid) {
            return dispatch('fillSplitList');
        } else if (state.splitListValid && !state.splitSumListValid) {
            return dispatch('fillSplitSumList');
        } else {
            try {
                dispatch('wait/start', WaitType.TIME_FRAME_DATA_FILL_ALL, { root: true });
                const splitService = Container.get(CashSplitService);
                const convertService = Container.get(CashConverterService);
                const parameters = {
                    ...state.parameters,
                    outputCurrency: rootState.App.preferences.preferedCurrency,
                };
                const splitList = await splitService.getListByParam(
                    parameters,
                    rootState.PermanentData.accountMap,
                );
                const result = convertService.convertToGraphSplitListAndGetActiveAccounts(
                    splitList,
                );
                const graphSplitList = result.splitList;
                const activeAccountIdSet = result.activeAccountIdSet;
                const splitSumService = Container.get(CashSplitSumService);
                const splitSumList = await splitSumService.getListByParam(
                    parameters,
                    rootState.PermanentData.accountMap,
                );
                const graphSplitSumList = convertService.convertToGraphSplitList(splitSumList);

                const payload = {
                    splitList: graphSplitList,
                    splitSumList: graphSplitSumList,
                    activeAccountIdSet,
                };
                commit('updateAll', payload);
            } catch (e) {
                commit('resetAllSplit');
                if (e instanceof RateNotFoundError) {
                    const fromCurrency = rootGetters['PermanentData/currencyMap'].get(
                        e.fromCurrencyId,
                    );
                    const toCurrency = rootGetters['PermanentData/currencyMap'].get(e.toCurrencyId);
                    const message = i18n
                        .t('rate.dont.exist', {
                            fromCurrency: fromCurrency.isoCode,
                            toCurrency: toCurrency.isoCode,
                        })
                        .toString();
                    Notification.error({
                        title: i18n.t('Rate not found').toString(),
                        message,
                        onClick: () => {
                            Router.push({
                                name: 'rate-edit-page',
                                params: {
                                    rateId: 'new',
                                    fromCurrencyId: e.fromCurrencyId,
                                    toCurrencyId: e.toCurrencyId,
                                },
                            });
                        },
                    });
                } else {
                    throw e;
                }
            } finally {
                dispatch('wait/end', WaitType.TIME_FRAME_DATA_FILL_ALL, { root: true });
            }
        }
    },
    async fillSplitList({
        commit,
        state,
        rootState,
        rootGetters,
        dispatch,
    }: Vuex.ActionContext<ITimeFrameDataState, any>) {
        if (state.splitListValid) {
            return;
        } else {
            try {
                dispatch('wait/start', WaitType.TIME_FRAME_DATA_FILL_ALL, { root: true });
                const splitService = Container.get(CashSplitService);
                const convertService = Container.get(CashConverterService);
                const parameters = {
                    ...state.parameters,
                    outputCurrency: rootState.App.preferences.preferedCurrency,
                };
                const splitList = await splitService.getListByParam(
                    parameters,
                    rootState.PermanentData.accountMap,
                );
                const result = convertService.convertToGraphSplitListAndGetActiveAccounts(
                    splitList,
                );
                const graphSplitList = result.splitList;
                const activeAccountIdSet = result.activeAccountIdSet;

                const payload = {
                    splitList: graphSplitList,
                    activeAccountIdSet,
                };
                commit('updateSplitList', payload);
            } catch (e) {
                commit('resetAllSplit');
                if (e instanceof RateNotFoundError) {
                    const fromCurrency = rootGetters['PermanentData/currencyMap'].get(
                        e.fromCurrencyId,
                    );
                    const toCurrency = rootGetters['PermanentData/currencyMap'].get(e.toCurrencyId);
                    const message = i18n
                        .t('rate.dont.exist', {
                            fromCurrency: fromCurrency.isoCode,
                            toCurrency: toCurrency.isoCode,
                        })
                        .toString();
                    Notification.error({
                        title: i18n.t('Rate not found').toString(),
                        message,
                        onClick: () => {
                            Router.push({
                                name: 'rate-edit-page',
                                params: {
                                    rateId: 'new',
                                    fromCurrencyId: e.fromCurrencyId,
                                    toCurrencyId: e.toCurrencyId,
                                },
                            });
                        },
                    });
                } else {
                    throw e;
                }
            } finally {
                dispatch('wait/end', WaitType.TIME_FRAME_DATA_FILL_ALL, { root: true });
            }
        }
    },
    async fillSplitSumList({
        commit,
        state,
        rootState,
        rootGetters,
        dispatch,
    }: Vuex.ActionContext<ITimeFrameDataState, any>) {
        if (state.splitSumListValid) {
            return;
        } else {
            try {
                dispatch('wait/start', WaitType.TIME_FRAME_DATA_FILL_ALL, { root: true });
                const convertService = Container.get(CashConverterService);
                const parameters = {
                    ...state.parameters,
                    outputCurrency: rootState.App.preferences.preferedCurrency,
                };
                const splitSumService = Container.get(CashSplitSumService);
                const splitSumList = await splitSumService.getListByParam(
                    parameters,
                    rootState.PermanentData.accountMap,
                );
                const graphSplitSumList = convertService.convertToGraphSplitList(splitSumList);

                const payload = {
                    splitSumList: graphSplitSumList,
                };
                commit('updateSplitSumList', payload);
            } catch (e) {
                commit('resetAllSplit');
                if (e instanceof RateNotFoundError) {
                    const fromCurrency = rootGetters['PermanentData/currencyMap'].get(
                        e.fromCurrencyId,
                    );
                    const toCurrency = rootGetters['PermanentData/currencyMap'].get(e.toCurrencyId);
                    const message = i18n
                        .t('rate.dont.exist', {
                            fromCurrency: fromCurrency.isoCode,
                            toCurrency: toCurrency.isoCode,
                        })
                        .toString();
                    Notification.error({
                        title: i18n.t('Rate not found').toString(),
                        message,
                        onClick: () => {
                            Router.push({
                                name: 'rate-edit-page',
                                params: {
                                    rateId: 'new',
                                    fromCurrencyId: e.fromCurrencyId,
                                    toCurrencyId: e.toCurrencyId,
                                },
                            });
                        },
                    });
                } else {
                    throw e;
                }
            } finally {
                dispatch('wait/end', WaitType.TIME_FRAME_DATA_FILL_ALL, { root: true });
            }
        }
    },
    async updateDateRange(
        { commit, state, dispatch }: Vuex.ActionContext<ITimeFrameDataState, any>,
        dateRange: Date[],
    ) {
        const parameters: TransactionParameters = {
            ...state.parameters,
            transactionDateFrom: dateRange[0],
            transactionDateTo: dateRange[1],
        };
        commit('updateField', { path: 'parameters', value: parameters });
        dispatch('resetAllSplit');
    },
    async updateParameters(
        { commit, state, dispatch }: Vuex.ActionContext<ITimeFrameDataState, any>,
        parameters: TransactionParameters,
    ) {
        const updatedParameters: TransactionParameters = {
            ...parameters,
            transactionDateFrom:
                state.parameters.transactionDateFrom || parameters.transactionDateFrom,
            transactionDateTo: state.parameters.transactionDateTo || parameters.transactionDateTo,
        };
        commit('updateField', { path: 'parameters', value: updatedParameters });
        dispatch('resetAllSplit');
    },
    async resetAllSplit({ commit }: Vuex.ActionContext<ITimeFrameDataState, any>) {
        commit('resetAllSplit');
    },
};

export default {
    namespaced: true,
    state,
    getters,
    mutations,
    actions,
};
