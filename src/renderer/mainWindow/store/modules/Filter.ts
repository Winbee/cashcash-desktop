import * as Vuex from 'vuex';
import { Container } from 'typedi';

import { getField, updateField } from 'vuex-map-fields';
import Page from '../../backend/service/dto/Page';
import { RuleParameters } from '../../backend/service/dto/Parameters';
import CashFilter from '../../backend/database/entity/CashFilter';
import CashFilterService from '../../backend/service/CashFilterService';
import { Notification } from 'element-ui';
import i18n from '@/renderer/common/i18n/i18n';

interface IFilterState {
    parameters: RuleParameters;
    filterPage: Page<CashFilter>;
    filterList: CashFilter[];
    filterWithoutRuleList: CashFilter[];
    wipFilter: CashFilter | null;
}

const state: IFilterState = {
    parameters: {},
    filterPage: {
        itemList: [],
        currentPage: 1,
        itemPerPage: 0,
        totalItem: 0,
    },
    filterList: [],
    filterWithoutRuleList: [],
    wipFilter: null,
};

const getters = {
    getField,
};

const mutations = {
    updateField,
};

const actions = {
    async fillFilter(
        { commit, state }: Vuex.ActionContext<IFilterState, any>,
        { page } = {
            page: 1,
        },
    ) {
        const service = Container.get(CashFilterService);
        const filterPage = await service.getPage(page, state.parameters);
        const filterList = await service.getList();
        const filterWithoutRuleList = await service.getListWithoutRule();
        commit('updateField', { path: 'filterPage', value: filterPage });
        commit('updateField', { path: 'filterList', value: filterList });
        commit('updateField', { path: 'filterWithoutRuleList', value: filterWithoutRuleList });
        commit('updateField', { path: 'wipFilter', value: null });
    },
    async initWipFilter(
        { commit }: Vuex.ActionContext<IFilterState, any>,
        obj: { filterId: string; filter: CashFilter; duplicate: boolean },
    ) {
        let wipFilter;
        if (obj.filterId === 'new') {
            if (!obj.filter) {
                wipFilter = new CashFilter();
            } else {
                wipFilter = obj.filter;
            }
        } else {
            const service = Container.get(CashFilterService);
            if (obj.duplicate) {
                wipFilter = await service.duplicate(obj.filterId);
            } else {
                wipFilter = await service.get(obj.filterId);
            }
        }
        commit('updateField', { path: 'wipFilter', value: wipFilter });
    },
    async initWipFilterFromFilter(
        { commit, state }: Vuex.ActionContext<IFilterState, any>,
        filter: CashFilter,
    ) {
        commit('updateField', { path: 'wipFilter', value: filter });
    },
    async removeWipFilter({ commit, state }: Vuex.ActionContext<IFilterState, any>) {
        commit('updateField', { path: 'wipFilter', value: null });
    },
    async saveFilter(
        { dispatch, commit, state }: Vuex.ActionContext<IFilterState, any>,
        wipFilter: CashFilter,
    ) {
        const service = Container.get(CashFilterService);
        await service.save(wipFilter);
        Notification.success({
            title: i18n.t('Filter saved').toString(),
            message: '',
        });
        await dispatch('fillFilter');
    },
    async deleteFilter(
        { dispatch, commit, state }: Vuex.ActionContext<IFilterState, any>,
        filterId: string,
    ) {
        const service = Container.get(CashFilterService);
        await service.delete(filterId);
        Notification.success({
            title: i18n.t('Filter deleted').toString(),
            message: '',
        });
        await dispatch('fillFilter');
    },
    async deleteFilterList(
        { dispatch, commit, state }: Vuex.ActionContext<IFilterState, any>,
        filterIdList: string[],
    ) {
        if (filterIdList.length === 1) {
            await dispatch('deleteFilter', filterIdList[0]);
        } else {
            const service = Container.get(CashFilterService);
            await service.deleteList(filterIdList);
            Notification.success({
                title: i18n.t('{total} filters deleted', { total: filterIdList.length }).toString(),
                message: '',
            });
            await dispatch('fillFilter');
        }
    },
    async updateParameters(
        { commit }: Vuex.ActionContext<IFilterState, any>,
        parameters: RuleParameters,
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
