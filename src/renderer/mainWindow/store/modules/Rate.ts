import * as Vuex from 'vuex';
import { Container } from 'typedi';

import { getField, updateField } from 'vuex-map-fields';
import Page from '../../backend/service/dto/Page';
import { RateParameters } from '../../backend/service/dto/Parameters';
import CashRate from '../../backend/database/entity/CashRate';
import CashRateService from '../../backend/service/CashRateService';
import { Notification } from 'element-ui';
import CashCurrencyService from '../../backend/service/CashCurrencyService';
import i18n from '@/renderer/common/i18n/i18n';

interface IRateState {
    parameters: RateParameters;
    ratePage: Page<CashRate>;
    wipRate: CashRate | null;
}

const state: IRateState = {
    parameters: {
        currencyIdList: [],
    },
    ratePage: {
        itemList: [],
        currentPage: 1,
        itemPerPage: 0,
        totalItem: 0,
    },
    wipRate: null,
};

const getters = {
    getField,
};

const mutations = {
    updateField,
};

const actions = {
    async fillRate(
        { commit, state }: Vuex.ActionContext<IRateState, any>,
        { page } = {
            page: 1,
        },
    ) {
        const service = Container.get(CashRateService);
        const ratePage = await service.getPage(page, state.parameters);
        commit('updateField', { path: 'ratePage', value: ratePage });
        commit('updateField', { path: 'wipRate', value: null });
    },
    async initWipRate(
        { commit }: Vuex.ActionContext<IRateState, any>,
        obj: { rateId: string; fromCurrencyId: number; toCurrencyId: number },
    ) {
        let rate;
        if (obj.rateId === 'new') {
            if (obj.fromCurrencyId && obj.toCurrencyId) {
                const service = Container.get(CashCurrencyService);
                const fromCurrency = await service.get(obj.fromCurrencyId);
                const toCurrency = await service.get(obj.toCurrencyId);
                rate = new CashRate({ fromCurrency, toCurrency });
            } else {
                rate = new CashRate();
            }
        } else {
            const service = Container.get(CashRateService);
            rate = await service.get(obj.rateId);
        }
        commit('updateField', { path: 'wipRate', value: rate });
    },
    async removeWipRate({ commit, state }: Vuex.ActionContext<IRateState, any>) {
        commit('updateField', { path: 'wipRate', value: null });
    },
    async saveRate(
        { dispatch, commit, state }: Vuex.ActionContext<IRateState, any>,
        wipRate: CashRate,
    ) {
        const service = Container.get(CashRateService);
        await service.save(wipRate);
        Notification.success({
            title: i18n.t('Rate saved').toString(),
            message: '',
        });
        await dispatch('fillRate');
        await dispatch('TimeFrameData/resetAllSplit', {}, { root: true });
    },
    async deleteRate(
        { dispatch, commit, state }: Vuex.ActionContext<IRateState, any>,
        rateId: string,
    ) {
        const service = Container.get(CashRateService);
        await service.delete(rateId);
        Notification.success({
            title: i18n.t('Rate deleted').toString(),
            message: '',
        });
        await dispatch('fillRate');
        await dispatch('TimeFrameData/resetAllSplit', {}, { root: true });
    },
    async deleteRateList(
        { dispatch, commit, state }: Vuex.ActionContext<IRateState, any>,
        rateIdList: string[],
    ) {
        if (rateIdList.length === 1) {
            await dispatch('deleteRate', rateIdList[0]);
        } else {
            const service = Container.get(CashRateService);
            await service.deleteList(rateIdList);
            Notification.success({
                title: i18n.t('{total} rates deleted', { total: rateIdList.length }).toString(),
                message: '',
            });
            await dispatch('fillRate');
            await dispatch('TimeFrameData/resetAllSplit', {}, { root: true });
        }
    },
    async updateParameters(
        { commit }: Vuex.ActionContext<IRateState, any>,
        parameters: RateParameters,
    ) {
        commit('updateField', { path: 'parameters', value: parameters });
    },
};

export default {
    namespaced: true,
    state,
    getters,
    mutations,
    actions,
};
