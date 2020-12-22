<template>
    <div class="main-wrapper">
        <navbar>
            <template slot="first-line-left">
                <generic-parameters
                    :parameters="c_parameters"
                    :actionableParameters="[
                        'searchString',
                        'account',
                        'createdDateFrom',
                        'createdDateTo',
                        'updatedDateFrom',
                        'updatedDateTo',
                    ]"
                    :vuexDispatch="'Rule/updateParameters'"
                    :placeholder="$t('Rules')"
                />
            </template>
            <template slot="second-line-left">
                <gen-tooltip :content="$t('New rule')" v-if="d_multipleSelection.length === 0">
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
                <gen-tooltip :content="$t('Edit rule')" v-if="d_multipleSelection.length === 1">
                    <gen-button circle @click="edit()" size="small">
                        <fa icon="pen" fixed-width></fa>
                    </gen-button>
                </gen-tooltip>
                <gen-tooltip
                    :content="$t('Duplicate rule')"
                    v-if="d_multipleSelection.length === 1"
                >
                    <gen-button circle @click="duplicate()" size="small">
                        <fa icon="clone" fixed-width></fa>
                    </gen-button>
                </gen-tooltip>
                <gen-tooltip :content="$t('Remove rule')" v-if="d_multipleSelection.length > 0">
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
                <el-table-column :label="$t('Filter name')">
                    <template slot-scope="scope">{{ scope.row.filter.name }}</template>
                </el-table-column>
                <el-table-column :label="$t('Accounts in filter')">
                    <template slot-scope="scope">{{ getDetectionAccountName(scope.row) }}</template>
                </el-table-column>
                <el-table-column :label="$t('Accounts in action')">
                    <template slot-scope="scope">{{ getActionAccountName(scope.row) }}</template>
                </el-table-column>
            </el-table>

            <el-dialog
                :title="d_multipleSelection.length === 1 ? $t('Delete') : $t('Multi delete')"
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
import CashRule from '../../backend/database/entity/CashRule';
import {
    FieldNameDetectionType,
    FieldNameActionType,
} from '../../backend/database/entity/proxy/CashRuleV1';
import Navbar from '../../components/Navbar.vue';
import GenericParameters from '../../components/genericparameters/GenericParameters.vue';
import Container from 'typedi';
import CashRuleService from '../../backend/service/CashRuleService';
import PaginationStatus from '../../components/PaginationStatus.vue';
import GenButton from '../../components/GenButton.vue';
import GenTooltip from '../../components/GenTooltip.vue';
import VueScrollTo from 'vue-scrollto';

export default Vue.extend({
    name: 'rule-page',
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
            d_multipleSelection: [] as CashRule[],
            d_selectAll: false,
        };
    },
    computed: {
        c_page(this: any) {
            return this.$store.state.Rule.rulePage;
        },
        c_accountMap(this: any) {
            return this.$store.state.PermanentData.accountMap;
        },
        c_parameters(this: any) {
            return this.$store.state.Rule.parameters;
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
        edit(this: any, rule: CashRule) {
            if (this.d_multipleSelection.length === 1) {
                this.$router.push({
                    name: 'rule-edit-page',
                    params: { ruleId: this.d_multipleSelection[0].id },
                });
            }
        },
        async duplicate(this: any) {
            if (this.d_multipleSelection.length === 1) {
                this.$router.push({
                    name: 'rule-edit-page',
                    params: { ruleId: this.d_multipleSelection[0].id, duplicate: true },
                });
            }
        },
        showRemoveDialog() {
            this.d_dialogVisible = true;
        },
        async remove(this: any) {
            this.d_dialogVisible = false;
            if (this.d_selectAll) {
                const service = Container.get(CashRuleService);
                const list = await service.getListByParam(this.c_parameters);
                await this.$store.dispatch(
                    'Rule/deleteRuleList',
                    list.map((item) => item.id),
                );
            } else if (this.d_multipleSelection.length === 1) {
                await this.$store.dispatch('Rule/deleteRule', this.d_multipleSelection[0].id);
            } else if (this.d_multipleSelection.length > 1) {
                await this.$store.dispatch(
                    'Rule/deleteRuleList',
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
                name: 'rule-page',
                query: {
                    page: pageNumber,
                },
            };
            this.$router.push(route);
        },
        fetchData(this: any) {
            const page = this.$route.query.page ? Number(this.$route.query.page) : 1;
            this.$store.dispatch('Filter/fillFilter');
            this.$store.dispatch('Rule/fillRule', { page });
        },
        getDetectionAccountName(item: CashRule) {
            for (const filter of item.filter.jsonFilter.list) {
                if (filter.fieldName === FieldNameDetectionType.ACCOUNT) {
                    const account = this.c_accountMap.get(+filter.parameter);
                    return account ? account.name : 'Error...';
                }
            }
            return 'None';
        },
        getActionAccountName(item: CashRule) {
            for (const action of item.action.jsonActionList) {
                if (
                    action.fieldName === FieldNameActionType.ACCOUNT_FROM ||
                    action.fieldName === FieldNameActionType.ACCOUNT_TO
                ) {
                    const account = this.c_accountMap.get(+action.parameter);
                    return account ? account.name : 'Error...';
                }
            }
            return 'None';
        },
        async create(this: any) {
            this.goto('/rule/new');
        },
        goto(this: any, path: string) {
            this.$router.push({ path });
        },
        selectAndEdit(this: any, item: CashRule) {
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
                return this.$t('Delete {total} rules?', { total: this.c_page.totalItem });
            } else if (this.d_multipleSelection.length === 1) {
                return this.$t('Delete the rule {name}?', {
                    name: this.d_multipleSelection[0].name,
                });
            } else {
                return this.$t('Delete {total} rules?', { total: this.d_multipleSelection.length });
            }
        },
        toggleSelectAll(this: any) {
            this.d_selectAll = !this.d_selectAll;
        },
    },
});
</script>

<style lang="scss" scoped></style>
