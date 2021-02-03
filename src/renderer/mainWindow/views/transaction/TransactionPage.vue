<template>
    <div class="main-wrapper">
        <navbar>
            <template slot="first-line-left">
                <transaction-parameters @update:parameters="() => changePage(1)" />
            </template>
            <template slot="first-line-right">
                <transaction-date-range-parameters @update:dateRange="() => changePage(1)" />
            </template>
            <template slot="second-line-left">
                <gen-tooltip
                    :content="$t('New transaction')"
                    v-if="d_multipleSelection.length === 0"
                >
                    <gen-button circle size="small" @click="create()">
                        <fa icon="plus" fixed-width></fa>
                    </gen-button>
                </gen-tooltip>
                <gen-tooltip
                    :content="$t('Import transactions')"
                    v-if="d_multipleSelection.length === 0"
                >
                    <gen-button circle size="small" @click="importTransactions()">
                        <fa icon="file-upload" fixed-width></fa>
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
                <gen-tooltip
                    :content="$t('Edit transaction')"
                    v-if="d_multipleSelection.length === 1 || d_multipleSelection.length > 0"
                >
                    <gen-button circle @click="edit()" size="small">
                        <fa icon="pen" fixed-width></fa>
                    </gen-button>
                </gen-tooltip>
                <gen-tooltip
                    :content="$t('Duplicate transaction')"
                    v-if="d_multipleSelection.length === 1"
                >
                    <gen-button circle @click="duplicate()" size="small">
                        <fa icon="clone" fixed-width></fa>
                    </gen-button>
                </gen-tooltip>
                <gen-tooltip
                    :content="$t('Remove transaction')"
                    v-if="d_multipleSelection.length > 0"
                >
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
                <el-table-column :label="$t('Date')">
                    <template slot-scope="scope">
                        <i class="el-icon-time"></i>
                        <span style="margin-left: 10px">{{ printDate(scope.row) }}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="description" :label="$t('Description')"></el-table-column>
                <el-table-column :label="$t('Amount')">
                    <template slot-scope="scope">
                        <span>{{ printAmount(scope.row) }}</span>
                    </template>
                </el-table-column>
                <el-table-column :label="$t('From')">
                    <template slot-scope="scope">
                        <span
                            @click="
                                () =>
                                    openAccountPage(
                                        getAccount(getNegativeSplit(scope.row).accountId),
                                    )
                            "
                            >{{ getAccount(getNegativeSplit(scope.row).accountId).name }}</span
                        >
                    </template>
                </el-table-column>
                <el-table-column :label="$t('To')">
                    <template slot-scope="scope">
                        <span
                            @click="
                                () =>
                                    openAccountPage(
                                        getAccount(getPositiveSplit(scope.row).accountId),
                                    )
                            "
                            >{{ getAccount(getPositiveSplit(scope.row).accountId).name }}</span
                        >
                    </template>
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
                    <el-button @click="d_dialogVisible = false">{{ $t('Cancel') }}</el-button>
                    <el-button type="primary" @click="remove()">{{ $t('Confirm') }}</el-button>
                </span>
            </el-dialog>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import CashTransactionUtil from '../../backend/utils/CashTransactionUtils';
import PrintUtil from '../../backend/utils/PrintUtils';
import CashTransaction from '../../backend/database/entity/CashTransaction';
import CashAccount from '../../backend/database/entity/CashAccount';
import CashSplit from '../../backend/database/entity/CashSplit';
import _ from 'lodash';
import CashAccountUtils from '../../backend/utils/CashAccountUtils';
import { Container } from 'typedi';
import CashTransactionService from '../../backend/service/CashTransactionService';
import Navbar from '../../components/Navbar.vue';
import TransactionParameters from '../../components/genericparameters/TransactionParameters.vue';
import TransactionDateRangeParameters from '../../components/genericparameters/TransactionDateRangeParameters.vue';
import PaginationStatus from '../../components/PaginationStatus.vue';
import GenButton from '../../components/GenButton.vue';
import GenTooltip from '../../components/GenTooltip.vue';
import VueScrollTo from 'vue-scrollto';
import DateUtils from '../../backend/utils/DateUtils';

export default Vue.extend({
    name: 'transaction-page',
    components: {
        TransactionParameters,
        TransactionDateRangeParameters,
        Navbar,
        PaginationStatus,
        GenButton,
        GenTooltip,
    },
    data(this: any) {
        return {
            d_dialogVisible: false,
            d_multipleSelection: [] as CashTransaction[],
            d_selectAll: false,
        };
    },
    computed: {
        c_page(this: any) {
            return this.$store.state.Transaction.transactionPageResult;
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
        c_parameters(this: any) {
            return this.$store.state.TimeFrameData.parameters;
        },
        c_accountMap(this: any) {
            return this.$store.state.PermanentData.accountMap;
        },
    },
    methods: {
        async edit(this: any) {
            if (this.d_selectAll && this.d_multipleSelection.length > 1) {
                const service = Container.get(CashTransactionService);
                const list = await service.getListByParam(this.c_parameters, this.c_accountMap);
                this.$router.push({
                    name: 'multi-edit-rule-page',
                    params: {
                        transactionList: list,
                    },
                });
            } else if (this.d_multipleSelection.length > 1) {
                this.$router.push({
                    name: 'multi-edit-rule-page',
                    params: {
                        transactionList: this.d_multipleSelection,
                    },
                });
            } else {
                this.$router.push({
                    name: 'transaction-edit-page',
                    params: { transactionId: this.d_multipleSelection[0].id },
                });
            }
        },
        async duplicate(this: any) {
            this.$router.push({
                name: 'transaction-edit-page',
                params: { transactionId: this.d_multipleSelection[0].id, duplicate: true },
            });
        },
        showRemoveDialog(this: any) {
            this.d_dialogVisible = true;
        },
        async remove(this: any) {
            this.d_dialogVisible = false;
            if (this.d_selectAll) {
                await this.$store.dispatch(
                    'Transaction/deleteTransactionByQuery'
                );
            } else if (this.d_multipleSelection.length === 1) {
                await this.$store.dispatch(
                    'Transaction/deleteTransaction',
                    this.d_multipleSelection[0].id,
                );
            } else if (this.d_multipleSelection.length > 1) {
                await this.$store.dispatch(
                    'Transaction/deleteTransactionList',
                    this.d_multipleSelection.map((item) => item.id),
                );
            }
        },
        printAmount(this: any, transaction: CashTransaction): string {
            const accountMap = this.$store.state.PermanentData.accountMap;
            const currencyMap = this.$store.getters['PermanentData/currencyMap'];
            const stringValue = CashTransactionUtil.printAmount(
                transaction,
                accountMap,
                currencyMap,
            );
            if (transaction.isMultiCurrency) {
                return stringValue + ` (${this.$t('Multicurrency')})`;
            } else {
                return stringValue;
            }
        },
        getPositiveSplit(transaction: CashTransaction): CashSplit {
            return CashTransactionUtil.getPositiveSplit(transaction);
        },
        getNegativeSplit(transaction: CashTransaction): CashSplit {
            return CashTransactionUtil.getNegativeSplit(transaction);
        },
        getAccount(this: any, accountId: string): CashAccount {
            return this.$store.state.PermanentData.accountMap.get(accountId);
        },
        printDate(transaction: CashTransaction): string {
            return DateUtils.formatHumanDate(transaction.transactionDate);
        },
        changePage(this: any, pageNumber: number) {
            VueScrollTo.scrollTo('.main-content', 800, {
                container: '.main-content',
                easing: 'ease-in-out',
            });
            this.$store.dispatch('Transaction/updateTransactionPage', pageNumber);
            this.fetchData();
        },
        fetchData(this: any) {
            this.$store.dispatch('Transaction/fillTransaction');
        },
        openAccountPage(this: any, account: CashAccount) {
            const isInternal = CashAccountUtils.isInternal(account);
            const pageName = isInternal ? 'account-internal-page' : 'account-external-page';
            this.$store.dispatch('Account/selectAccount', account);
            this.$router.push({ name: pageName });
        },
        selectAndEdit(this: any, transaction: CashTransaction) {
            this.d_multipleSelection = [transaction];
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
        toggleSelectAll(this: any) {
            this.d_selectAll = !this.d_selectAll;
        },
        getDeleteLabel(this: any) {
            if (this.d_selectAll && this.d_multipleSelection.length !== 1) {
                return this.$t('Delete {total} transactions?', { total: this.c_page.totalItem });
            } else if (this.d_multipleSelection.length === 1) {
                return this.$t('Delete the transaction {name}?', {
                    name: this.d_multipleSelection[0].description,
                });
            } else {
                return this.$t('Delete {total} transactions?', {
                    total: this.d_multipleSelection.length,
                });
            }
        },
        async create(this: any) {
            this.goto('/transaction/new');
        },
        importTransactions() {
            this.$router.push({ name: 'import-file-page' });
        },
        goto(this: any, path: string) {
            this.$router.push({ path });
        },
    },
    async created(this: any) {
        // fetch the data when the view is created and the data is
        // already being observed
        this.changePage(1);
    },
});
</script>

<style lang="scss" scoped></style>
