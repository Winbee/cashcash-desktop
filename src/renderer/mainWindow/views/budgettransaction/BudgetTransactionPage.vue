<template>
    <div class="main-wrapper">
        <navbar>
            <template slot="first-line-left">
                <transaction-parameters @update:parameters="() => fetchSplitData()" />
            </template>
            <template slot="first-line-right">
                <transaction-date-range-parameters @update:dateRange="() => fetchSplitData()" />
            </template>
            <template slot="second-line-left">
                <account-autocomplete
                    :object="c_contextAccount"
                    :optionList="c_accountList"
                    @update:object="updateContextAccount"
                />
                <el-divider direction="vertical"></el-divider>
                <gen-tooltip
                    :content="$t('New budget entry')"
                    v-if="c_multipleSelection.length === 0"
                >
                    <gen-button circle size="small" @click="create()">
                        <fa icon="plus" fixed-width></fa>
                    </gen-button>
                </gen-tooltip>
                <span class="small-font" v-if="c_multipleSelection.length > 0">
                    {{ c_selectedLabel }}
                </span>
                <el-divider direction="vertical" v-if="c_multipleSelection.length > 0"></el-divider>
                <gen-tooltip
                    :content="$t('Edit budget entry')"
                    v-if="c_multipleSelection.length === 1"
                >
                    <gen-button circle @click="edit()" size="small">
                        <fa icon="pen" fixed-width></fa>
                    </gen-button>
                </gen-tooltip>
                <gen-tooltip
                    :content="$t('Remove budget entry')"
                    v-if="c_multipleSelection.length > 0"
                >
                    <gen-button circle @click="showRemoveDialog()" size="small">
                        <fa icon="trash" fixed-width></fa>
                    </gen-button>
                </gen-tooltip>
                <gen-tooltip
                    :content="$t('Show account')"
                    v-if="c_contextAccount && c_multipleSelection.length === 0"
                >
                    <gen-button class="item" circle size="small" @click="openContextAccountPage()">
                        <fa icon="university" fixed-width></fa>
                    </gen-button>
                </gen-tooltip>
            </template>
            <template slot="second-line-right">
                <budget-pagination-status
                    :current-date="c_budgetDate"
                    :max-date="c_transactionDataTo"
                    :min-date="c_transactionDataFrom"
                    @current-change="updateBudgetDate"
                ></budget-pagination-status>
            </template>
        </navbar>
        <div class="main-content">
            <h2>{{ c_contextAccount ? c_contextAccount.name : null }} - {{ $t('Budget') }}</h2>
            <div class="top-content">
                <chart :options="c_optionChart" :autoresize="true"></chart>
                <el-table :data="c_formatedDelta">
                    <el-table-column prop="title" :label="$t('Delta')" />
                    <el-table-column prop="deltaBudget" :label="$t('Budget')"
                /></el-table>
            </div>
            <el-table
                :data="c_outBudgetSplitList"
                stripe
                style="width: 100%"
                row-key="transactionId"
                @row-dblclick="outSelectAndEdit"
                @selection-change="outHandleSelectionChange"
                show-summary
                :summary-method="outGetSummaries"
                :row-class-name="getRowClass"
            >
                <el-table-column :label="$t('Out budget')">
                    <el-table-column type="selection" width="60"></el-table-column>
                    <el-table-column :label="$t('From')">
                        <template slot-scope="scope">
                            <span v-if="scope.row.transactionId !== -1">{{
                                getAccountNameByType(scope.row, 'from')
                            }}</span>
                            <span v-else>{{ $t('Not budgeted') }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column :label="$t('To')">
                        <template slot-scope="scope">
                            <span v-if="scope.row.transactionId !== -1">{{
                                getAccountNameByType(scope.row, 'to')
                            }}</span>
                            <span v-else>{{ $t('Not budgeted') }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column :label="$t('Budget')" align="right">
                        <template slot-scope="scope">
                            <span v-if="scope.row.transactionId !== -1">{{
                                printAmount(scope.row, true)
                            }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column :label="$t('Status')" align="center">
                        <template slot-scope="scope">
                            <el-progress
                                v-if="scope.row.transactionId !== -1"
                                :text-inside="true"
                                :stroke-width="18"
                                :percentage="calculateStatusPercent(scope.row)"
                                :color="calculateColor(scope.row, true)"
                                :format="(percent) => formatText(percent, scope.row)"
                                :show-text="true"
                            ></el-progress>
                        </template>
                    </el-table-column>
                    <el-table-column :label="$t('Current')" align="left">
                        <template slot-scope="scope">
                            <span v-if="scope.row.transactionId !== -1">{{
                                printCurrentAmount(scope.row)
                            }}</span>
                            <span v-else>({{ printOutNoneBudgetedCurrentAmount() }})</span>
                        </template>
                    </el-table-column>
                </el-table-column>
            </el-table>
            <br />
            <el-table
                :data="c_inBudgetSplitList"
                stripe
                style="width: 100%"
                row-key="transactionId"
                @row-dblclick="inSelectAndEdit"
                @selection-change="inHandleSelectionChange"
                show-summary
                :summary-method="inGetSummaries"
                :row-class-name="getRowClass"
            >
                <el-table-column :label="$t('In budget')">
                    <el-table-column type="selection" width="60"></el-table-column>
                    <el-table-column :label="$t('From')">
                        <template slot-scope="scope">
                            <span v-if="scope.row.transactionId !== -1">{{
                                getAccountNameByType(scope.row, 'from')
                            }}</span>
                            <span v-else>{{ $t('Not budgeted') }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column :label="$t('To')">
                        <template slot-scope="scope">
                            <span v-if="scope.row.transactionId !== -1">{{
                                getAccountNameByType(scope.row, 'to')
                            }}</span>
                            <span v-else>{{ $t('Not budgeted') }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column :label="$t('Budget')" align="right">
                        <template slot-scope="scope">
                            <span v-if="scope.row.transactionId !== -1">{{
                                printAmount(scope.row)
                            }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column :label="$t('Status')" align="center">
                        <template slot-scope="scope">
                            <el-progress
                                v-if="scope.row.transactionId !== -1"
                                :text-inside="true"
                                :stroke-width="18"
                                :percentage="calculateStatusPercent(scope.row)"
                                :color="calculateColor(scope.row, true)"
                                :format="(percent) => formatText(percent, scope.row)"
                                :show-text="true"
                            ></el-progress>
                        </template>
                    </el-table-column>
                    <el-table-column :label="$t('Current')" align="left">
                        <template slot-scope="scope">
                            <span v-if="scope.row.transactionId !== -1">{{
                                printCurrentAmount(scope.row)
                            }}</span>
                            <span v-else>({{ printInNoneBudgetedCurrentAmount() }})</span>
                        </template>
                    </el-table-column>
                </el-table-column>
            </el-table>

            <el-dialog
                :title="c_multipleSelection.length === 1 ? $t('Delete') : $t('Multi delete')"
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
import CashAccount from '../../backend/database/entity/CashAccount';
import CashSplit from '../../backend/database/entity/CashSplit';
import _ from 'lodash';
import CashAccountUtils from '../../backend/utils/CashAccountUtils';
import { Container } from 'typedi';
import Navbar from '../../components/Navbar.vue';
import TransactionParameters from '../../components/genericparameters/TransactionParameters.vue';
import TransactionDateRangeParameters from '../../components/genericparameters/TransactionDateRangeParameters.vue';
import BudgetPaginationStatus from '../../components/BudgetPaginationStatus.vue';
import GenButton from '../../components/GenButton.vue';
import GenTooltip from '../../components/GenTooltip.vue';
import VueScrollTo from 'vue-scrollto';
import DateUtils from '../../backend/utils/DateUtils';
import CashBudgetTransactionService from '../../backend/service/CashBudgetTransactionService';
import CashBudgetTransaction from '../../backend/database/entity/CashBudgetTransaction';
import PrintUtils from '../../backend/utils/PrintUtils';
import GraphSplitExtended from '../../backend/service/dto/GraphSplitExtended';
import Page from '../../backend/service/dto/Page';
import AccountAutocomplete from '../account/AccountAutocomplete.vue';
import { DeltaBudgetObject, DeltaCurrentObject } from '../../store/modules/BudgetTransaction';
import CashAccountType from '../../backend/database/entity/enumeration/CashAccountType';
import CashBudgetUtils from '../../backend/utils/CashBudgetUtils';

export default Vue.extend({
    name: 'budget-transaction-page',
    components: {
        AccountAutocomplete,
        TransactionParameters,
        TransactionDateRangeParameters,
        Navbar,
        BudgetPaginationStatus,
        GenButton,
        GenTooltip,
    },
    data(this: any) {
        return {
            d_dialogVisible: false,
            d_inMultipleSelection: [] as GraphSplitExtended[],
            d_outMultipleSelection: [] as GraphSplitExtended[],
            d_contextAccount: null,
            d_fakeBudgetSplit: {
                accountId: -1,
                transactionDate: new Date(),
                amount: -1,
                currencyId: -1,
                originalAmount: -1,
                originalCurrencyId: -1,
                transactionId: -1,
                otherSplitAccountId: -1,
                isToSplit: false,
            },
        };
    },
    computed: {
        c_multipleSelection(this: any) {
            return [...this.d_inMultipleSelection, ...this.d_outMultipleSelection];
        },
        c_selectedLabel(this: any) {
            if (this.c_multipleSelection.length === 0) {
                return '';
            } else {
                return this.$t('{length} selected', { length: this.c_multipleSelection.length });
            }
        },
        c_parameters(this: any) {
            return this.$store.state.TimeFrameData.parameters;
        },
        c_contextAccount(this: any) {
            return this.$store.state.BudgetTransaction.contextAccount;
        },
        c_accountMap(this: any) {
            return this.$store.state.PermanentData.accountMap;
        },
        c_accountList(this: any) {
            return this.$store.state.PermanentData.accountList.filter(
                (item) => item.type === CashAccountType.ASSET,
            );
        },
        c_splitList(this: any) {
            return this.$store.state.TimeFrameData.splitList;
        },
        c_inBudgetSplitList(this: any) {
            return [
                ...Array.from(this.c_inOutBudgetSplitObject.inBudgetSplitMap.values()).sort(
                    (a: any, b: any) => b.amount - a.amount,
                ),
                this.d_fakeBudgetSplit,
            ];
        },
        c_outBudgetSplitList(this: any) {
            return [
                ...Array.from(this.c_inOutBudgetSplitObject.outBudgetSplitMap.values()).sort(
                    (a: any, b: any) => b.amount - a.amount,
                ),
                this.d_fakeBudgetSplit,
            ];
        },
        c_currencyMap() {
            return this.$store.getters['PermanentData/currencyMap'];
        },
        c_currency() {
            return this.$store.state.App.preferences.preferedCurrency;
        },
        c_budgetDate(this: any) {
            return this.$store.state.BudgetTransaction.budgetDate;
        },
        c_transactionDataFrom(this: any) {
            return this.$store.state.TimeFrameData.parameters.transactionDateFrom;
        },
        c_transactionDataTo(this: any) {
            return this.$store.state.TimeFrameData.parameters.transactionDateTo;
        },
        c_inOutBudgetSplitObject(this: any) {
            return this.$store.getters['BudgetTransaction/inOutBudgetSplitObject'];
        },
        c_inOutCurrentSplitObject(this: any) {
            return this.$store.getters['BudgetTransaction/inOutCurrentSplitObject'];
        },
        c_optionChart(this: any): any {
            return this.$store.getters['BudgetTransaction/optionChart'];
        },
        c_formatedDelta(this: any): any {
            const deltaBudgetObject: DeltaBudgetObject = this.$store.getters[
                'BudgetTransaction/deltaBudgetObject'
            ];
            const deltaCurrentObject: DeltaCurrentObject = this.$store.getters[
                'BudgetTransaction/deltaCurrentObject'
            ];

            return [
                {
                    title: this.$t('Per month'),
                    deltaBudget: PrintUtils.printAmount(
                        deltaBudgetObject.deltaPerMonth,
                        this.c_currency.id,
                        this.c_currencyMap,
                    ),
                    deltaCurrent: PrintUtils.printAmount(
                        deltaCurrentObject.deltaPerMonth,
                        this.c_currency.id,
                        this.c_currencyMap,
                    ),
                },
                {
                    title: this.$t('Per week'),
                    deltaBudget: PrintUtils.printAmount(
                        deltaBudgetObject.deltaPerWeek,
                        this.c_currency.id,
                        this.c_currencyMap,
                    ),
                    deltaCurrent: PrintUtils.printAmount(
                        deltaCurrentObject.deltaPerWeek,
                        this.c_currency.id,
                        this.c_currencyMap,
                    ),
                },
                {
                    title: this.$t('Per day'),
                    deltaBudget: PrintUtils.printAmount(
                        deltaBudgetObject.deltaPerDay,
                        this.c_currency.id,
                        this.c_currencyMap,
                    ),
                    deltaCurrent: PrintUtils.printAmount(
                        deltaCurrentObject.deltaPerWeek,
                        this.c_currency.id,
                        this.c_currencyMap,
                    ),
                },
            ];
        },
    },
    methods: {
        async edit(this: any) {
            if (this.c_multipleSelection.length === 1) {
                this.$router.push({
                    name: 'budget-transaction-edit-page',
                    params: { transactionId: this.c_multipleSelection[0].transactionId },
                });
            }
        },
        showRemoveDialog(this: any) {
            this.d_dialogVisible = true;
        },
        async remove(this: any) {
            this.d_dialogVisible = false;
            if (this.c_multipleSelection.length === 1) {
                await this.$store.dispatch(
                    'BudgetTransaction/deleteTransaction',
                    this.c_multipleSelection[0].transactionId,
                );
            } else if (this.c_multipleSelection.length > 1) {
                await this.$store.dispatch(
                    'BudgetTransaction/deleteTransactionList',
                    this.c_multipleSelection.map((item) => item.transactionId),
                );
            }
        },
        printAmount(this: any, item: GraphSplitExtended, invert = false): string {
            const accountMap = this.$store.state.PermanentData.accountMap;
            const currencyMap = this.$store.getters['PermanentData/currencyMap'];
            const stringValue = PrintUtils.printAmount(
                invert ? -Math.abs(+item.amount) : Math.abs(+item.amount),
                item.currencyId,
                currencyMap,
            );
            return stringValue;
        },
        getAccountNameByType(this: any, item: GraphSplitExtended, type: 'from' | 'to'): string {
            if (item.transactionId === -1) {
                return 'test';
            }
            let accountId;
            if (item.isToSplit) {
                if (type === 'to') {
                    accountId = item.accountId;
                } else {
                    accountId = item.otherSplitAccountId;
                }
            } else {
                if (type === 'to') {
                    accountId = item.otherSplitAccountId;
                } else {
                    accountId = item.accountId;
                }
            }
            return this.getAccount(accountId).name;
        },
        getAccount(this: any, accountId: string): CashAccount {
            return this.$store.state.PermanentData.accountMap.get(accountId);
        },
        fetchData(this: any) {
            if (!this.c_contextAccount) {
                this.$store.dispatch('BudgetTransaction/updateContextAccount', null);
            }
            this.$store.dispatch('PermanentData/fillBudgetSplit');
        },
        async fetchSplitData(this: any) {
            await this.$store.dispatch('TimeFrameData/fillSplitList');
            await this.fetchData();
        },
        inSelectAndEdit(this: any, item: GraphSplitExtended) {
            this.d_inMultipleSelection = [item];
            this.d_outMultipleSelection = [];
            this.edit();
        },
        outSelectAndEdit(this: any, item: GraphSplitExtended) {
            this.d_inMultipleSelection = [];
            this.d_outMultipleSelection = [item];
            this.edit();
        },
        inHandleSelectionChange(this: any, value) {
            this.d_inMultipleSelection = (value || []).filter((item) => item.transactionId !== -1);
        },
        outHandleSelectionChange(this: any, value) {
            this.d_outMultipleSelection = (value || []).filter((item) => item.transactionId !== -1);
        },
        getDeleteLabel(this: any) {
            if (this.c_multipleSelection.length === 1) {
                return `Delete ${this.c_multipleSelection.length} entrie?`;
            } else {
                return `Delete ${this.c_multipleSelection.length} entries?`;
            }
        },
        async create(this: any) {
            this.goto('/budget-transaction/new');
        },
        goto(this: any, path: string) {
            this.$router.push({ path });
        },
        printCurrentAmount(this: any, item: GraphSplitExtended): string {
            const key = CashBudgetUtils.generateKey(item);
            const currentAmount = this.c_inOutCurrentSplitObject.currentSumMap.get(key) || 0;
            return PrintUtils.printAmount(currentAmount, this.c_currency.id, this.c_currencyMap);
        },
        printOutNoneBudgetedCurrentAmount(this: any) {
            return PrintUtils.printAmount(
                this.c_inOutCurrentSplitObject.outNoneBudgetedCurrentSplitSum,
                this.c_currency.id,
                this.c_currencyMap,
            );
        },
        printInNoneBudgetedCurrentAmount(this: any) {
            return PrintUtils.printAmount(
                this.c_inOutCurrentSplitObject.inNoneBudgetedCurrentSplitSum,
                this.c_currency.id,
                this.c_currencyMap,
            );
        },
        calculateStatusPercent(this: any, item: GraphSplitExtended): number {
            const budgetAmount: number = Math.abs(+item.amount);
            const key = CashBudgetUtils.generateKey(item);
            const currentAmount = Math.abs(
                this.c_inOutCurrentSplitObject.currentSumMap.get(key) || 0,
            );

            if (currentAmount >= budgetAmount) {
                return 100;
            }
            return +PrintUtils.printNumber((currentAmount / budgetAmount) * 100, 0);
        },
        formatText(this: any, percentage, item: GraphSplitExtended) {
            if (percentage === 100) {
                const key = CashBudgetUtils.generateKey(item);
                const currentAmount = this.c_inOutCurrentSplitObject.currentSumMap.get(key) || 0;
                const budgetAmount = Math.abs(+item.amount);
                return `${PrintUtils.printNumber((currentAmount / budgetAmount) * 100, 0)}%`;
            }
            return `${percentage}%`;
        },
        calculateColor(this: any, item: GraphSplitExtended): string {
            const percent = this.calculateStatusPercent(item);
            return this.colorGradient(percent / 100);
        },
        colorGradient(fadeFraction) {
            // Green
            const rgbColor3 = {
                r: 103,
                g: 194,
                b: 58,
            };
            // Orange
            const rgbColor2 = {
                r: 230,
                g: 162,
                b: 60,
            };
            // Red
            const rgbColor1 = {
                r: 245,
                g: 108,
                b: 108,
            };
            let color1 = rgbColor1;
            let color2 = rgbColor2;
            let fade = fadeFraction;

            // Do we have 3 colors for the gradient? Need to adjust the params.
            if (rgbColor3) {
                fade = fade * 2;
                // Find which interval to use and adjust the fade percentage
                if (fade >= 1) {
                    fade -= 1;
                    color1 = rgbColor2;
                    color2 = rgbColor3;
                }
            }

            const diffRed = color2.r - color1.r;
            const diffGreen = color2.g - color1.g;
            const diffBlue = color2.b - color1.b;

            const gradient = {
                r: parseInt('' + Math.floor(color1.r + diffRed * fade), 10),
                g: parseInt('' + Math.floor(color1.g + diffGreen * fade), 10),
                b: parseInt('' + Math.floor(color1.b + diffBlue * fade), 10),
            };

            return 'rgb(' + gradient.r + ',' + gradient.g + ',' + gradient.b + ')';
        },
        async adjustBudgetDateIfNeeded(this: any) {
            await this.$store.dispatch('BudgetTransaction/adjustBudgetDateIfNeeded');
        },
        updateBudgetDate(this: any, item: Date) {
            this.$store.dispatch('BudgetTransaction/updateBudgetDate', item);
            this.fetchData();
        },
        updateContextAccount(this: any, item: CashAccount) {
            this.$store.dispatch('BudgetTransaction/updateContextAccount', item);
            this.fetchData();
        },
        outGetSummaries(this: any) {
            const budgetSum = this.c_inOutBudgetSplitObject.outBudgetSplitSum;
            const currentSum = this.c_inOutCurrentSplitObject.outBudgetedCurrentSplitSum;
            const currentFullSum =
                currentSum + this.c_inOutCurrentSplitObject.outNoneBudgetedCurrentSplitSum;
            const currentSumString = PrintUtils.printAmount(
                currentSum,
                this.c_currency.id,
                this.c_currencyMap,
            );
            const currentFullSumString = PrintUtils.printAmount(
                currentFullSum,
                this.c_currency.id,
                this.c_currencyMap,
            );
            const currentString = `${currentSumString}\n(${currentFullSumString})`;

            const sums = [
                'Total',
                '',
                '',
                PrintUtils.printAmount(budgetSum, this.c_currency.id, this.c_currencyMap),
                '',
                currentString,
            ];

            return sums;
        },
        inGetSummaries(this: any) {
            const budgetSum = this.c_inOutBudgetSplitObject.inBudgetSplitSum;
            const currentSum = this.c_inOutCurrentSplitObject.inBudgetedCurrentSplitSum;
            const currentFullSum =
                currentSum + this.c_inOutCurrentSplitObject.inNoneBudgetedCurrentSplitSum;
            const currentSumString = PrintUtils.printAmount(
                currentSum,
                this.c_currency.id,
                this.c_currencyMap,
            );
            const currentFullSumString = PrintUtils.printAmount(
                currentFullSum,
                this.c_currency.id,
                this.c_currencyMap,
            );
            const currentString = `${currentSumString}\n(${currentFullSumString})`;

            const sums = [
                'Total',
                '',
                '',
                PrintUtils.printAmount(budgetSum, this.c_currency.id, this.c_currencyMap),
                '',
                currentString,
            ];

            return sums;
        },
        getRowClass({ row, rowIndex }) {
            if (row.transactionId === -1) {
                return 'not-budgeted';
            }
        },
        openContextAccountPage(this: any) {
            if (this.c_contextAccount) {
                this.$store.dispatch('Account/selectAccount', this.c_contextAccount);
                this.$router.push({ name: 'account-internal-page' });
            }
        },
    },
    async created(this: any) {
        // fetch the data when the view is created and the data is
        // already being observed
        this.adjustBudgetDateIfNeeded();
        this.fetchData();
        this.$store.dispatch('BudgetTransaction/updateIsPageOpen', true);
    },
    async destroyed(this: any) {
        this.$store.dispatch('BudgetTransaction/updateIsPageOpen', false);
    },
});
</script>
<style lang="scss" scoped>
.top-content {
    display: flex;
    flex-direction: row;
}
.echarts {
    flex: 65%;
    height: 350px;
}
</style>
