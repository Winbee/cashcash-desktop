import Vue from 'vue';
import { getField, updateField } from 'vuex-map-fields';
import CashPreferences from '../../backend/database/entity/CashPreferences';
import Container from 'typedi';
import CashPreferencesService from '../../backend/service/CashPreferenceService';
import * as Vuex from 'vuex';
import { Notification } from 'element-ui';
import CashCurrencyService from '../../backend/service/CashCurrencyService';
import CashImportConfigService from '../../backend/service/CashImportConfigService';
import { DatabaseManager } from '../../backend/database/DatabaseManager';
import { useContainer as ormUseContainer } from 'typeorm';
import CashSplitSumService from '../../backend/service/CashSplitSumService';
import i18n from '../../../common/i18n/i18n';

interface IAppState {
    sidebarOpened: boolean;
    appIsLoading: boolean;
    preferences: CashPreferences | null;
}

const state: IAppState = {
    sidebarOpened: true,
    appIsLoading: true,
    preferences: null,
};

const getters = {
    getField,
};

const mutations = {
    updateField,
    toggleSidebar: (state) => {
        state.sidebarOpened = !state.sidebarOpened;
    },
};

const actions = {
    toggleSideBar({ commit }: Vuex.ActionContext<IAppState, any>) {
        commit('toggleSidebar');
    },
    async fillPreferences(
        { commit, dispatch }: Vuex.ActionContext<IAppState, any>,
        updateSidebar: boolean,
    ) {
        const service = Container.get(CashPreferencesService);
        const preferences = await service.get();
        const ga = (Vue as any).$ga;
        if (ga) {
            (Vue as any).$ga.set('userId', preferences.uuid);
        }
        commit('updateField', { path: 'preferences', value: preferences });
        await dispatch(
            'Account/updateGroupByParentAccounts',
            preferences.jsonPreferences.groupByParentAccounts,
            { root: true },
        );
        await dispatch(
            'Account/updateShowActiveAccountOnly',
            preferences.jsonPreferences.showActiveAccountOnly,
            { root: true },
        );
        await dispatch('Home/updateShowTopTen', preferences.jsonPreferences.showTopTen, {
            root: true,
        });
        await dispatch('PermanentData/fillAccount', {}, { root: true });
        if (updateSidebar) {
            commit('updateField', {
                path: 'sidebarOpened',
                value: preferences.jsonPreferences.sidebarIsOpen,
            });
        }
        if (preferences.jsonPreferences.lang) {
            i18n.locale = preferences.jsonPreferences.lang;
        }
    },
    async savePreferences(
        { dispatch }: Vuex.ActionContext<IAppState, any>,
        preferences: CashPreferences,
    ) {
        const service = Container.get(CashPreferencesService);
        await service.save(preferences);
        Notification.success({
            title: i18n.t('Preference saved').toString(),
            message: '',
        });
        await dispatch('fillPreferences', true);
        await dispatch('TimeFrameData/resetAllSplit', {}, { root: true });
    },
    async init({ commit, dispatch }: Vuex.ActionContext<IAppState, any>) {
        ormUseContainer(Container);
        const databaseManager = Container.get(DatabaseManager);
        await databaseManager.getConnection();
        const cashCurrencyService = Container.get(CashCurrencyService);
        await cashCurrencyService.init();

        const cashImportConfigService = Container.get(CashImportConfigService);
        await cashImportConfigService.init();

        await dispatch('PermanentData/fillCurrency', {}, { root: true });
        await dispatch('PermanentData/fillAccount', {}, { root: true });
        await dispatch('PermanentData/fillTag', {}, { root: true });
        await dispatch('fillPreferences', true);
        await dispatch('PermanentData/fillBudgetSplit', {}, { root: true });
        const service = Container.get(CashSplitSumService);
        await service.resetSplitSumList();
        await dispatch('TimeFrameData/fillAll', {}, { root: true });
        commit('updateField', { path: 'appIsLoading', value: false });
    },
};

export default {
    namespaced: true,
    state,
    getters,
    mutations,
    actions,
};
