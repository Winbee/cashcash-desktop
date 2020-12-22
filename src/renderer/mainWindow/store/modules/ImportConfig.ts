import * as Vuex from 'vuex';
import { Container } from 'typedi';

import { getField, updateField } from 'vuex-map-fields';
import Page from '../../backend/service/dto/Page';
import { ImportConfigParameters } from '../../backend/service/dto/Parameters';
import CashImportConfig from '../../backend/database/entity/CashImportConfig';
import CashImportConfigService from '../../backend/service/CashImportConfigService';
import { Notification } from 'element-ui';
import i18n from '@/renderer/common/i18n/i18n';

interface IImportConfigState {
    parameters: ImportConfigParameters;
    importConfigPage: Page<CashImportConfig>;
    wipImportConfig: CashImportConfig | null;
}

const state: IImportConfigState = {
    parameters: {},
    importConfigPage: {
        itemList: [],
        currentPage: 1,
        itemPerPage: 0,
        totalItem: 0,
    },
    wipImportConfig: null,
};

const getters = {
    getField,
};

const mutations = {
    updateField,
};

const actions = {
    async fillImportConfig(
        { commit, state }: Vuex.ActionContext<IImportConfigState, any>,
        { page } = {
            page: 1,
        },
    ) {
        const service = Container.get(CashImportConfigService);
        const importConfigPage = await service.getPage(page, state.parameters);
        commit('updateField', { path: 'importConfigPage', value: importConfigPage });
        commit('updateField', { path: 'wipImportConfig', value: null });
    },
    async initWipImportConfig(
        { commit }: Vuex.ActionContext<IImportConfigState, any>,
        obj: { importConfigId: string; duplicate: boolean },
    ) {
        let config;
        if (obj.importConfigId === 'new') {
            config = new CashImportConfig();
        } else {
            const service = Container.get(CashImportConfigService);
            if (obj.duplicate) {
                config = await service.duplicate(obj.importConfigId);
            } else {
                config = await service.get(obj.importConfigId);
            }
        }
        commit('updateField', { path: 'wipImportConfig', value: config });
    },
    async removeWipImportConfig({ commit }: Vuex.ActionContext<IImportConfigState, any>) {
        commit('updateField', { path: 'wipImportConfig', value: null });
    },
    async saveImportConfig(
        { dispatch }: Vuex.ActionContext<IImportConfigState, any>,
        wipImportConfig: CashImportConfig,
    ) {
        const service = Container.get(CashImportConfigService);
        await service.save(wipImportConfig);
        Notification.success({
            title: i18n.t('Import config saved').toString(),
            message: '',
        });
        await dispatch('fillImportConfig');
    },
    async deleteImportConfig(
        { dispatch }: Vuex.ActionContext<IImportConfigState, any>,
        importConfigId: string,
    ) {
        const service = Container.get(CashImportConfigService);
        await service.delete(importConfigId);
        Notification.success({
            title: i18n.t('Import config deleted').toString(),
            message: '',
        });
        await dispatch('fillImportConfig');
    },
    async deleteImportConfigList(
        { dispatch }: Vuex.ActionContext<IImportConfigState, any>,
        importConfigIdList: string[],
    ) {
        if (importConfigIdList.length === 1) {
            await dispatch('deleteImportConfig', importConfigIdList[0]);
        } else {
            const service = Container.get(CashImportConfigService);
            await service.deleteList(importConfigIdList);
            Notification.success({
                title: i18n
                    .t('{total} import configs deleted', { total: importConfigIdList.length })
                    .toString(),
                message: '',
            });
            await dispatch('fillImportConfig');
        }
    },
    async updateParameters(
        { commit }: Vuex.ActionContext<IImportConfigState, any>,
        parameters: ImportConfigParameters,
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
