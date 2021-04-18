<template>
    <div class="main-wrapper">
        <navbar>
            <template slot="first-line-left">
                <generic-parameters
                    :parameters="c_parameters"
                    :actionableParameters="[
                        'searchString',
                        'createdDateFrom',
                        'createdDateTo',
                        'updatedDateFrom',
                        'updatedDateTo',
                    ]"
                    :vuexDispatch="'Tag/updateParameters'"
                    :placeholder="$t('Tags')"
                />
            </template>
            <template slot="second-line-left">
                <gen-tooltip :content="$t('New tag')" v-if="d_multipleSelection.length === 0">
                    <gen-button circle size="small" @click="create()">
                        <fa icon="plus" fixed-width></fa>
                    </gen-button>
                </gen-tooltip>
                <span class="small-font" v-if="d_multipleSelection.length > 0">
                    {{ c_selectedLabel }}
                    <gen-button
                        @click="toggleSelectAll()"
                        size="small"
                        v-if="
                            d_multipleSelection.length > 0 &&
                            d_multipleSelection.length === c_page.itemList.length &&
                            !this.d_selectAll
                        "
                        >{{ $t('Select all') }}</gen-button
                    >
                </span>
                <el-divider direction="vertical" v-if="d_multipleSelection.length > 0"></el-divider>
                <gen-tooltip :content="$t('Edit tag')" v-if="d_multipleSelection.length === 1">
                    <gen-button circle @click="edit()" size="small">
                        <fa icon="pen" fixed-width></fa>
                    </gen-button>
                </gen-tooltip>
                <gen-tooltip :content="$t('Duplicate tag')" v-if="d_multipleSelection.length === 1">
                    <gen-button circle @click="duplicate()" size="small">
                        <fa icon="clone" fixed-width></fa>
                    </gen-button>
                </gen-tooltip>
                <gen-tooltip :content="$t('Delete tag')" v-if="d_multipleSelection.length > 0">
                    <gen-button circle @click="showRemoveDialog()" size="small">
                        <fa icon="trash" fixed-width></fa>
                    </gen-button>
                </gen-tooltip>
            </template>
            <template slot="second-line-right">
                <pagination-status
                    :total="c_page.totalItem"
                    :current-page="c_page.currentPage"
                    :page-size="c_page.itemPerPage"
                    @current-change="changePage"
                ></pagination-status>
            </template>
        </navbar>
        <div class="main-content">
            <el-table
                :data="c_page.itemList"
                stripe
                style="width: 100%"
                row-key="id"
                @row-dblclick="selectAndEdit"
                @selection-change="handleSelectionChange"
            >
                <el-table-column type="selection" width="55"></el-table-column>
                <el-table-column prop="name" :label="$t('Name')"></el-table-column>
            </el-table>

            <el-dialog
                :title="d_multipleSelection.length === 1 ? $t('Delete') : $t('Multi delete')"
                v-if="d_dialogVisible"
                :visible.sync="d_dialogVisible"
                width="30%"
            >
                <p>{{ getDeleteLabel() }}</p>
                <span slot="footer" class="dialog-footer">
                    <gen-button @click="d_dialogVisible = false">{{ $t('Cancel') }}</gen-button>
                    <el-button type="primary" @click="remove()">{{ $t('Confirm') }}</el-button>
                </span>
            </el-dialog>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import _ from 'lodash';
import CashTag from '../../backend/database/entity/CashTag';
import Navbar from '../../components/Navbar.vue';
import GenericParameters from '../../components/genericparameters/GenericParameters.vue';
import Container from 'typedi';
import CashTagService from '../../backend/service/CashTagService';
import PaginationStatus from '../../components/PaginationStatus.vue';
import GenButton from '../../components/GenButton.vue';
import GenTooltip from '../../components/GenTooltip.vue';
import VueScrollTo from 'vue-scrollto';

export default Vue.extend({
    name: 'tag-page',
    components: {
        GenericParameters,
        Navbar,
        PaginationStatus,
        GenButton,
        GenTooltip,
    },
    created() {
        // fetch the data when the view is created and the data is
        // already being observed
        this.fetchData();
    },
    data(this: any) {
        return {
            d_dialogVisible: false,
            d_multipleSelection: [] as CashTag[],
            d_selectAll: false,
        };
    },
    computed: {
        c_page(this: any) {
            return this.$store.state.Tag.tagPage;
        },
        c_accountMap(this: any) {
            return this.$store.state.PermanentData.accountMap;
        },
        c_parameters(this: any) {
            return this.$store.state.Tag.parameters;
        },
        c_selectedLabel(this: any) {
            if (this.d_multipleSelection.length === 0) {
                return '';
            } else if (
                this.c_page.totalItem === this.d_multipleSelection.length ||
                this.d_selectAll
            ) {
                return this.$t('{total} selected', { total: this.c_page.totalItem });
            } else {
                return this.$t('{total} selected', { total: this.d_multipleSelection.length });
            }
        },
    },
    watch: {
        // call again the method if the route changes
        $route: 'fetchData',
        c_parameters: 'fetchData',
    },
    methods: {
        edit(this: any, tag: CashTag) {
            if (this.d_multipleSelection.length === 1) {
                this.$router.push({
                    name: 'tag-edit-page',
                    params: { tagId: this.d_multipleSelection[0].id },
                });
            }
        },
        async duplicate(this: any) {
            if (this.d_multipleSelection.length === 1) {
                this.$router.push({
                    name: 'tag-edit-page',
                    params: { tagId: this.d_multipleSelection[0].id, duplicate: true },
                });
            }
        },
        showRemoveDialog() {
            this.d_dialogVisible = true;
        },
        async remove(this: any) {
            this.d_dialogVisible = false;
            if (this.d_selectAll) {
                const service = Container.get(CashTagService);
                const list = await service.getListByParam(this.c_parameters);
                await this.$store.dispatch(
                    'Tag/deleteTagList',
                    list.map((item) => item.id),
                );
            } else if (this.d_multipleSelection.length === 1) {
                await this.$store.dispatch('Tag/deleteTag', this.d_multipleSelection[0].id);
            } else if (this.d_multipleSelection.length > 1) {
                await this.$store.dispatch(
                    'Tag/deleteTagList',
                    this.d_multipleSelection.map((item) => item.id),
                );
            }
        },
        changePage(this: any, pageNumber: number) {
            VueScrollTo.scrollTo('.main-content', 800, {
                container: '.main-content',
                easing: 'ease-in-out',
            });
            const route = {
                name: 'tag-page',
                query: {
                    page: pageNumber,
                },
            };
            this.$router.push(route);
        },
        fetchData(this: any) {
            const page = this.$route.query.page ? Number(this.$route.query.page) : 1;
            this.$store.dispatch('Tag/fillTag', { page });
        },
        async create(this: any) {
            this.goto('/tag/new');
        },
        goto(this: any, path: string) {
            this.$router.push({ path });
        },
        selectAndEdit(this: any, item: CashTag) {
            this.d_multipleSelection = [item];
            this.edit();
        },
        handleSelectionChange(this: any, value) {
            this.d_multipleSelection = value;
            if (this.d_multipleSelection.length < this.c_page.itemList.length) {
                this.d_selectAll = false;
            } else if (this.d_multipleSelection.length === this.c_page.totalItem) {
                this.d_selectAll = true;
            }
        },
        getDeleteLabel(this: any) {
            if (this.d_selectAll && this.d_multipleSelection.length !== 1) {
                return this.$t('Delete {total} tags?', { total: this.c_page.totalItem });
            } else if (this.d_multipleSelection.length === 1) {
                return this.$t('Delete the tag {name}?', {
                    name: this.d_multipleSelection[0].name,
                });
            } else {
                return this.$t('Delete {total} tags?', {
                    total: this.d_multipleSelection.length,
                });
            }
        },
        toggleSelectAll(this: any) {
            this.d_selectAll = !this.d_selectAll;
        },
    },
});
</script>

<style lang="scss" scoped>
.dirty-css-button {
    padding: 3px 13px;
}
</style>
