import * as Vuex from 'vuex';
import { Container } from 'typedi';

import { getField, updateField } from 'vuex-map-fields';
import Page from '../../backend/service/dto/Page';
import { RuleParameters } from '../../backend/service/dto/Parameters';
import CashAction from '../../backend/database/entity/CashAction';
import CashActionService from '../../backend/service/CashActionService';
import { Notification } from 'element-ui';
import i18n from '@/renderer/common/i18n/i18n';

interface IActionState {
    parameters: RuleParameters;
    actionPage: Page<CashAction>;
    actionList: CashAction[];
    wipAction: CashAction | null;
}

const state: IActionState = {
    parameters: {},
    actionPage: {
        itemList: [],
        currentPage: 1,
        itemPerPage: 0,
        totalItem: 0,
    },
    actionList: [],
    wipAction: null,
};

const getters = {
    getField,
};

const mutations = {
    updateField,
};

const actions = {
    async fillAction(
        { commit, state }: Vuex.ActionContext<IActionState, any>,
        { page } = {
            page: 1,
        },
    ) {
        const service = Container.get(CashActionService);
        const actionPage = await service.getPage(page, state.parameters);
        const actionList = await service.getList();
        commit('updateField', { path: 'actionPage', value: actionPage });
        commit('updateField', { path: 'actionList', value: actionList });
        commit('updateField', { path: 'wipAction', value: null });
    },
    async initWipAction(
        { commit }: Vuex.ActionContext<IActionState, any>,
        { actionId, action }: { actionId: string; action: CashAction },
    ) {
        if (actionId === 'new') {
            if (!action) {
                action = new CashAction();
            }
        } else {
            const service = Container.get(CashActionService);
            action = (await service.get(actionId)) as CashAction;
        }
        commit('updateField', { path: 'wipAction', value: action });
    },
    async initWipActionFromAction(
        { commit, state }: Vuex.ActionContext<IActionState, any>,
        action: CashAction,
    ) {
        commit('updateField', { path: 'wipAction', value: action });
    },
    async removeWipAction({ commit, state }: Vuex.ActionContext<IActionState, any>) {
        commit('updateField', { path: 'wipAction', value: null });
    },
    async saveAction(
        { dispatch, commit, state }: Vuex.ActionContext<IActionState, any>,
        wipAction: CashAction,
    ) {
        const service = Container.get(CashActionService);
        await service.save(wipAction);
        Notification.success({
            title: i18n.t('Action saved').toString(),
            message: '',
        });
        await dispatch('fillAction');
    },
    async duplicateAction(
        { dispatch, commit, state }: Vuex.ActionContext<IActionState, any>,
        id: string,
    ) {
        const service = Container.get(CashActionService);
        await service.duplicate(id);
        Notification.success({
            title: i18n.t('Action duplicated').toString(),
            message: '',
        });
        await dispatch('fillAction');
    },
    async deleteAction(
        { dispatch, commit, state }: Vuex.ActionContext<IActionState, any>,
        actionId: string,
    ) {
        const service = Container.get(CashActionService);
        await service.delete(actionId);
        Notification.success({
            title: i18n.t('Action deleted').toString(),
            message: '',
        });
        await dispatch('fillAction');
    },
    async deleteActionList(
        { dispatch, commit, state }: Vuex.ActionContext<IActionState, any>,
        actionIdList: string[],
    ) {
        if (actionIdList.length === 1) {
            await dispatch('deleteAction', actionIdList[0]);
        } else {
            const service = Container.get(CashActionService);
            await service.deleteList(actionIdList);
            Notification.success({
                title: i18n.t('{total} actions deleted', { total: actionIdList.length }).toString(),
                message: '',
            });
            await dispatch('fillAction');
        }
    },
    async updateParameters(
        { commit }: Vuex.ActionContext<IActionState, any>,
        parameters: IActionState,
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
