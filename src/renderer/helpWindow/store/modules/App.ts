import Vue from 'vue';
import { getField, updateField } from 'vuex-map-fields';
import Container from 'typedi';
import * as Vuex from 'vuex';
import { useContainer as ormUseContainer } from 'typeorm';
import i18n from '../../../common/i18n/i18n';
import CashPreferencesService from '../../../mainWindow/backend/service/CashPreferenceService';
import CashPreferences from '../../../mainWindow/backend/database/entity/CashPreferences';
import { DatabaseManager } from '../../../mainWindow/backend/database/DatabaseManager';

interface IAppState {
    preferences: CashPreferences | null;
}

const state: IAppState = {
    preferences: null,
};

const getters = {
    getField,
};

const mutations = {
    updateField,
};

const actions = {
    async fillPreferences({ commit, dispatch }: Vuex.ActionContext<IAppState, any>) {
        const service = Container.get(CashPreferencesService);
        const preferences = await service.get();
        if (preferences.jsonPreferences.lang) {
            i18n.locale = preferences.jsonPreferences.lang;
        }
    },
    async init({ commit, dispatch }: Vuex.ActionContext<IAppState, any>) {
        ormUseContainer(Container);
        const databaseManager = Container.get(DatabaseManager);
        await databaseManager.getConnection();
        await dispatch('fillPreferences');
    },
};

export default {
    namespaced: true,
    state,
    getters,
    mutations,
    actions,
};
