import * as Vuex from 'vuex';
import { Container } from 'typedi';

import { getField, updateField } from 'vuex-map-fields';
import Page from '../../backend/service/dto/Page';
import { RuleParameters } from '../../backend/service/dto/Parameters';
import CashRule from '../../backend/database/entity/CashRule';
import CashRuleService from '../../backend/service/CashRuleService';
import { Notification } from 'element-ui';
import CashAction from '../../backend/database/entity/CashAction';
import i18n from '@/renderer/common/i18n/i18n';

interface IRuleState {
    parameters: RuleParameters;
    rulePage: Page<CashRule>;
    ruleList: CashRule[];
    wipRule: CashRule | null;
}

const state: IRuleState = {
    parameters: {},
    rulePage: {
        itemList: [],
        currentPage: 1,
        itemPerPage: 0,
        totalItem: 0,
    },
    ruleList: [],
    wipRule: null,
};

const getters = {
    getField,
};

const mutations = {
    updateField,
};

const actions = {
    async fillRule(
        { commit, state, dispatch }: Vuex.ActionContext<IRuleState, any>,
        { page } = {
            page: 1,
        },
    ) {
        const service = Container.get(CashRuleService);
        const rulePage = await service.getPage(page, state.parameters);
        const ruleList = await service.getList();
        commit('updateField', { path: 'rulePage', value: rulePage });
        commit('updateField', { path: 'ruleList', value: ruleList });
        commit('updateField', { path: 'wipRule', value: null });
        await dispatch('Filter/fillFilter', {}, { root: true });
    },
    async initWipRule(
        { commit }: Vuex.ActionContext<IRuleState, any>,
        obj: { ruleId: string; rule: CashRule; duplicate: boolean },
    ) {
        let wipRule;
        if (obj.ruleId === 'new') {
            if (!obj.rule) {
                wipRule = new CashRule();
                wipRule.action = new CashAction();
            }
        } else {
            const service = Container.get(CashRuleService);
            if (obj.duplicate) {
                wipRule = (await service.duplicate(obj.ruleId)) as CashRule;
            } else {
                wipRule = (await service.get(obj.ruleId)) as CashRule;
            }
        }
        commit('updateField', { path: 'wipRule', value: wipRule });
    },
    async removeWipRule({ commit }: Vuex.ActionContext<IRuleState, any>) {
        commit('updateField', { path: 'wipRule', value: null });
    },
    async saveRule({ dispatch }: Vuex.ActionContext<IRuleState, any>, wipRule: CashRule) {
        const service = Container.get(CashRuleService);
        await service.save(wipRule);
        Notification.success({
            title: i18n.t('Rule saved').toString(),
            message: '',
        });
        await dispatch('fillRule');
    },
    async deleteRule({ dispatch }: Vuex.ActionContext<IRuleState, any>, ruleId: string) {
        const service = Container.get(CashRuleService);
        await service.delete(ruleId);
        Notification.success({
            title: i18n.t('Rule deleted').toString(),
            message: '',
        });
        await dispatch('fillRule');
    },
    async deleteRuleList({ dispatch }: Vuex.ActionContext<IRuleState, any>, ruleIdList: string[]) {
        if (ruleIdList.length === 1) {
            await dispatch('deleteRule', ruleIdList[0]);
        } else {
            const service = Container.get(CashRuleService);
            await service.deleteList(ruleIdList);
            Notification.success({
                title: i18n.t('{total} rules deleted', { total: ruleIdList.length }).toString(),
                message: '',
            });
            await dispatch('fillRule');
        }
    },
    async updateParameters(
        { commit }: Vuex.ActionContext<IRuleState, any>,
        parameters: IRuleState,
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
