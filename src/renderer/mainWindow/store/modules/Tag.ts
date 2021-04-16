import * as Vuex from 'vuex';
import { Container } from 'typedi';

import { getField, updateField } from 'vuex-map-fields';
import Page from '../../backend/service/dto/Page';
import { TagParameters } from '../../backend/service/dto/Parameters';
import CashTag from '../../backend/database/entity/CashTag';
import CashTagService from '../../backend/service/CashTagService';
import { Notification } from 'element-ui';
import i18n from '@/renderer/common/i18n/i18n';

interface ITagState {
    parameters: TagParameters;
    tagPage: Page<CashTag>;
    wipTag: CashTag | null;
}

const state: ITagState = {
    parameters: {},
    tagPage: {
        itemList: [],
        currentPage: 1,
        itemPerPage: 0,
        totalItem: 0,
    },
    wipTag: null,
};

const getters = {
    getField,
};

const mutations = {
    updateField,
};

const actions = {
    async fillTag(
        { commit, state }: Vuex.ActionContext<ITagState, any>,
        { page } = {
            page: 1,
        },
    ) {
        const service = Container.get(CashTagService);
        const tagPage = await service.getPage(page, state.parameters);
        commit('updateField', { path: 'tagPage', value: tagPage });
        commit('updateField', { path: 'wipTag', value: null });
    },
    async initWipTag(
        { commit }: Vuex.ActionContext<ITagState, any>,
        obj: { tagId: string; tag: CashTag; duplicate: boolean },
    ) {
        let wipTag;
        if (obj.tagId === 'new') {
            if (!obj.tag) {
                wipTag = new CashTag();
            } else {
                wipTag = obj.tag;
            }
        } else {
            const service = Container.get(CashTagService);
            if (obj.duplicate) {
                wipTag = await service.duplicate(obj.tagId);
            } else {
                wipTag = await service.get(obj.tagId);
            }
        }
        commit('updateField', { path: 'wipTag', value: wipTag });
    },
    async initWipTagFromTag({ commit, state }: Vuex.ActionContext<ITagState, any>, tag: CashTag) {
        commit('updateField', { path: 'wipTag', value: tag });
    },
    async removeWipTag({ commit, state }: Vuex.ActionContext<ITagState, any>) {
        commit('updateField', { path: 'wipTag', value: null });
    },
    async saveTag(
        { dispatch, commit, state }: Vuex.ActionContext<ITagState, any>,
        wipTag: CashTag,
    ) {
        const service = Container.get(CashTagService);
        await service.save(wipTag);
        Notification.success({
            title: i18n.t('Tag saved').toString(),
            message: '',
        });
        await dispatch('fillTag');
        await dispatch('PermanentData/fillTag', {}, { root: true });
    },
    async deleteTag(
        { dispatch, commit, state }: Vuex.ActionContext<ITagState, any>,
        tagId: string,
    ) {
        const service = Container.get(CashTagService);
        await service.delete(tagId);
        Notification.success({
            title: i18n.t('Tag deleted').toString(),
            message: '',
        });
        await dispatch('fillTag');
        await dispatch('PermanentData/fillTag', {}, { root: true });
    },
    async deleteTagList(
        { dispatch, commit, state }: Vuex.ActionContext<ITagState, any>,
        tagIdList: string[],
    ) {
        if (tagIdList.length === 1) {
            await dispatch('deleteTag', tagIdList[0]);
        } else {
            const service = Container.get(CashTagService);
            await service.deleteList(tagIdList);
            Notification.success({
                title: i18n.t('{total} tags deleted', { total: tagIdList.length }).toString(),
                message: '',
            });
            await dispatch('fillTag');
            await dispatch('PermanentData/fillTag', {}, { root: true });
        }
    },
    async updateParameters(
        { commit }: Vuex.ActionContext<ITagState, any>,
        parameters: TagParameters,
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
