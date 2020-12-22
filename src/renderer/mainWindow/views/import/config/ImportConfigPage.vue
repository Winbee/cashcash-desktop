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
                    :vuexDispatch="'ImportConfig/updateParameters'"
                    :placeholder="$t('Import configs')"
                />
            </template>
            <template slot="second-line-left">
                <gen-tooltip :content="$t('New config')" v-if="d_multipleSelection.length === 0">
                    <gen-button circle size="small" @click="goto('/import-config/new')">
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
                <gen-tooltip :content="$t('Edit config')" v-if="d_multipleSelection.length === 1">
                    <gen-button circle @click="edit()" size="small">
                        <fa icon="pen" fixed-width></fa>
                    </gen-button>
                </gen-tooltip>
                <gen-tooltip
                    :content="$t('Duplicate config')"
                    v-if="d_multipleSelection.length === 1"
                >
                    <gen-button circle @click="duplicate()" size="small">
                        <fa icon="clone" fixed-width></fa>
                    </gen-button>
                </gen-tooltip>
                <gen-tooltip :content="$t('Remove config')" v-if="d_multipleSelection.length > 0">
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
                <el-table-column :label="$t('Operations')">
                    <template slot-scope="scope">
                        <gen-tooltip :content="$t('Import file')">
                            <el-button size="mini" @click="uploadFile(scope.row)">
                                <fa icon="file-upload" fixed-width></fa>
                            </el-button>
                        </gen-tooltip>
                    </template>
                </el-table-column>
            </el-table>

            <el-dialog
                :title="$t('Delete')"
                v-if="d_dialogVisible"
                :visible.sync="d_dialogVisible"
                width="30%"
            >
                <span>{{ getDeleteLabel() }}</span>
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
import CashImportConfig from '../../../backend/database/entity/CashImportConfig';
import Navbar from '../../../components/Navbar.vue';
import GenericParameters from '../../../components/genericparameters/GenericParameters.vue';
import Container from 'typedi';
import CashImportConfigService from '../../../backend/service/CashImportConfigService';
import PaginationStatus from '../../../components/PaginationStatus.vue';
import GenButton from '../../../components/GenButton.vue';
import GenTooltip from '../../../components/GenTooltip.vue';
import VueScrollTo from 'vue-scrollto';

export default Vue.extend({
    name: 'import-config-page',
    components: {
        Navbar,
        GenericParameters,
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
            d_dialogItem: {} as CashImportConfig,
            d_multipleSelection: [] as CashImportConfig[],
            d_selectAll: false,
        };
    },
    computed: {
        c_page(this: any): any {
            return this.$store.state.ImportConfig.importConfigPage;
        },
        c_parameters(this: any) {
            return this.$store.state.ImportConfig.parameters;
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
        edit(this: any) {
            if (this.d_multipleSelection.length === 1) {
                this.$router.push({
                    name: 'import-config-edit-page',
                    params: { importConfigId: this.d_multipleSelection[0].id },
                });
            }
        },
        async duplicate(this: any) {
            this.$router.push({
                name: 'import-config-edit-page',
                params: { importConfigId: this.d_multipleSelection[0].id, duplicate: true },
            });
        },
        showRemoveDialog() {
            this.d_dialogVisible = true;
        },
        async remove(this: any) {
            this.d_dialogVisible = false;
            if (this.d_selectAll) {
                const service = Container.get(CashImportConfigService);
                const list = await service.getListByParam(this.c_parameters);
                await this.$store.dispatch(
                    'mportConfig/deleteImportConfigList',
                    list.map((item) => item.id),
                );
            } else if (this.d_multipleSelection.length === 1) {
                await this.$store.dispatch(
                    'ImportConfig/deleteImportConfig',
                    this.d_multipleSelection[0].id,
                );
            } else if (this.d_multipleSelection.length > 1) {
                await this.$store.dispatch(
                    'ImportConfig/deleteImportConfigList',
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
                name: 'import-config-page',
                query: {
                    page: pageNumber,
                },
            };
            this.$router.push(route);
        },
        fetchData(this: any) {
            const page = this.$route.query.page ? Number(this.$route.query.page) : 1;
            this.$store.dispatch('ImportConfig/fillImportConfig', { page });
        },
        uploadFile(this: any, item: CashImportConfig) {
            this.$router.push({ name: 'import-file-page', params: { importConfig: item } });
        },
        goto(this: any, path: string) {
            this.$router.push({ path });
        },
        selectAndEdit(this: any, item: CashImportConfig) {
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
                return this.$t('Delete {total} configs?', { total: this.c_page.totalItem });
            } else if (this.d_multipleSelection.length === 1) {
                return this.$t('Delete the config {name}?', {
                    name: this.d_multipleSelection[0].name,
                });
            } else {
                return this.$t('Delete {total} configs?', {
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

<style lang="scss" scoped></style>
