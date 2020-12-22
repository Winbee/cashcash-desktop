<template>
    <div class="main-wrapper">
        <navbar>
            <template slot="first-line-left">
                <transaction-parameters @update:parameters="fetchData" />
            </template>
            <template slot="first-line-right">
                <transaction-date-range-parameters @update:dateRange="fetchData" />
            </template>
            <template slot="second-line-left" v-if="c_selectedAccount">
                <gen-tooltip
                    :content="
                        c_showActiveAccountOnly
                            ? $t('Only accounts with transactions appear in the tree')
                            : $t('All accounts appear in the tree')
                    "
                >
                    <gen-button circle size="small" @click="toggleShowActiveAccountOnly()">
                        <fa :icon="c_showActiveAccountOnly ? 'eye-slash' : 'eye'" fixed-width></fa>
                    </gen-button>
                </gen-tooltip>
                <gen-tooltip
                    :content="
                        c_groupByParentAccounts
                            ? $t('Transactions in graph are grouped by folders')
                            : $t('Transactions in graph are independents')
                    "
                >
                    <gen-button circle size="small" @click="toggleGroupByParentAccounts()">
                        <fa :icon="c_groupByParentAccounts ? 'link' : 'unlink'" fixed-width></fa>
                    </gen-button>
                </gen-tooltip>
                <el-divider direction="vertical" v-if="c_selectedAccount"></el-divider>
                <gen-tooltip :content="$t('New account')" v-if="c_selectedAccount.isDirectory">
                    <gen-button class="item" circle size="small" @click="create()">
                        <fa icon="plus" fixed-width></fa>
                    </gen-button>
                </gen-tooltip>
                <gen-tooltip :content="$t('Edit account')">
                    <gen-button class="item" circle size="small" @click="edit()">
                        <fa icon="pen" fixed-width></fa>
                    </gen-button>
                </gen-tooltip>
                <gen-tooltip :content="$t('Delete account')" v-if="!c_selectedAccount.isProtected">
                    <gen-button class="item" circle size="small" @click="showRemoveDialog()">
                        <fa icon="trash" fixed-width></fa>
                    </gen-button>
                </gen-tooltip>
                <gen-tooltip :content="$t('Show transactions from this account')">
                    <gen-button class="item" circle size="small" @click="openTransactionPage()">
                        <fa icon="exchange-alt" fixed-width></fa>
                    </gen-button>
                </gen-tooltip>
                <gen-tooltip
                    :content="$t('Show budget from this account')"
                    v-if="selectedAccountIsAsset()"
                >
                    <gen-button class="item" circle size="small" @click="openBudgetPage()">
                        <fa icon="balance-scale" fixed-width></fa>
                    </gen-button>
                </gen-tooltip>
            </template>
        </navbar>
        <div class="main-content-two-panel">
            <div class="left-panel">
                <tree-root
                    v-if="this.c_selectedAccount"
                    :models="accountTree"
                    class="tree"
                ></tree-root>
            </div>
            <div class="right-panel">
                <transition name="fade" mode="out-in">
                    <account-preview
                        v-if="this.c_selectedAccount"
                        :account="this.c_selectedAccount"
                    ></account-preview>
                </transition>
            </div>
        </div>
        <el-dialog
            :title="dependentObjectList.length > 0 ? $t('Impossible to delete') : $t('Delete')"
            v-if="c_selectedAccount"
            :visible.sync="d_dialogVisible"
            width="30%"
        >
            <v-wait :for="waitType">
                <template slot="waiting">
                    <div v-loading="true"></div>
                </template>
                <div v-if="dependentObjectList.length > 0">
                    <p>
                        {{
                            $t('Other objects are linked to this account') + ". " + $t('They should be modified or deleted first') + ".",
                        }}
                    </p>
                    <el-table
                        :data="dependentObjectList"
                        stripe
                        style="width: 100%"
                        row-key="description"
                    >
                        <el-table-column
                            prop="description"
                            :label="$t('Dependencies')"
                        ></el-table-column>
                        <el-table-column prop="numberOfDep" :label="$t('Count')"></el-table-column>
                    </el-table>
                </div>
                <div v-else>
                    <span>{{ $t('Delete the account') }} '{{ c_selectedAccount.name }}'?</span>
                </div>
            </v-wait>
            <span slot="footer" class="dialog-footer">
                <v-wait :for="waitType">
                    <div v-if="dependentObjectList.length > 0">
                        <el-button type="primary" @click="d_dialogVisible = false">{{
                            $t('Close')
                        }}</el-button>
                    </div>
                    <div v-else>
                        <gen-button @click="d_dialogVisible = false">{{ $t('Cancel') }}</gen-button>
                        <el-button type="primary" @click="remove()">{{ $t('Confirm') }}</el-button>
                    </div>
                </v-wait>
            </span>
        </el-dialog>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import TreeRoot from './TreeRoot.vue';
import AccountPreview from './AccountPreview.vue';
import CashAccountUtils from '../../backend/utils/CashAccountUtils';
import Navbar from '../../components/Navbar.vue';
import TransactionParameters from '../../components/genericparameters/TransactionParameters.vue';
import TransactionDateRangeParameters from '../../components/genericparameters/TransactionDateRangeParameters.vue';
import GenButton from '../../components/GenButton.vue';
import GenTooltip from '../../components/GenTooltip.vue';
import WaitType from '../../backend/database/entity/enumeration/WaitType';
import Container from 'typedi';
import CashAccountService from '../../backend/service/CashAccountService';
import CashAccountType from '../../backend/database/entity/enumeration/CashAccountType';

export default Vue.extend({
    name: 'account-page',
    components: {
        TreeRoot,
        AccountPreview,
        Navbar,
        TransactionParameters,
        TransactionDateRangeParameters,
        GenButton,
        GenTooltip,
    },
    props: {
        accountTree: Array,
    },
    data(this: any) {
        return {
            d_dialogVisible: false,
            dependentObjectList: [],
            waitType: WaitType.CHECK_ACCOUNT_DEP,
        };
    },
    computed: {
        c_isInternal(this: any) {
            return CashAccountUtils.isInternal(this.accountTree[0]);
        },
        c_selectedAccount(this: any) {
            return this.c_isInternal
                ? this.$store.state.Account.selectedInternalAccount
                : this.$store.state.Account.selectedExternalAccount;
        },
        c_showActiveAccountOnly(this: any): boolean {
            return this.$store.state.Account.showActiveAccountOnly;
        },
        c_groupByParentAccounts(this: any): boolean {
            return this.$store.state.Account.groupByParentAccounts;
        },
    },
    methods: {
        async fetchData(this: any) {
            this.$wait.start(WaitType.PREVIEW_ACCOUNT);
            try {
                if (this.c_isInternal) {
                    await this.$store.dispatch('TimeFrameData/fillAll');
                } else {
                    await this.$store.dispatch('TimeFrameData/fillSplitList');
                }
                let selectedAccount = this.c_isInternal
                    ? this.$store.state.Account.selectedInternalAccount
                    : this.$store.state.Account.selectedExternalAccount;

                if (
                    !selectedAccount ||
                    !this.$store.state.PermanentData.accountMap.get(selectedAccount.id)
                ) {
                    selectedAccount = this.c_isInternal
                        ? this.$store.state.PermanentData.accountTree.find((item) =>
                              CashAccountUtils.isInternal(item),
                          )
                        : this.$store.state.PermanentData.accountTree.find((item) =>
                              CashAccountUtils.isExternal(item),
                          );
                    await this.$store.dispatch('Account/selectAccount', selectedAccount);
                }
                await this.$store.dispatch('AccountPreview/initAccountPreview', selectedAccount.id);
                await this.$store.dispatch('AccountPreview/generateOptionChart');
            } finally {
                this.$wait.end(WaitType.PREVIEW_ACCOUNT);
            }
        },
        edit(this: any) {
            const pageName = this.c_isInternal
                ? 'account-internal-edit-page'
                : 'account-external-edit-page';
            this.$router.push({
                name: pageName,
                params: { accountId: this.c_selectedAccount.id },
            });
        },
        async showRemoveDialog(this: any) {
            this.dependentObjectList = [];
            this.d_dialogVisible = true;
            const service = Container.get(CashAccountService);
            this.$wait.start(WaitType.CHECK_ACCOUNT_DEP);
            try {
                const responseList = await service.countDependentObject(this.c_selectedAccount.id);
                this.dependentObjectList = responseList.filter((item) => item.numberOfDep > 0);
            } finally {
                this.$wait.end(WaitType.CHECK_ACCOUNT_DEP);
            }
        },
        async remove(this: any) {
            this.d_dialogVisible = false;
            await this.$store.dispatch('Account/deleteAccount', this.c_selectedAccount.id);
        },
        async create(this: any) {
            const pageName = this.c_isInternal
                ? 'account-internal-edit-page'
                : 'account-external-edit-page';
            this.$router.push({
                name: pageName,
                params: { accountId: 'new', parentAccount: this.c_selectedAccount },
            });
        },
        openTransactionPage(this: any) {
            this.$store.dispatch('TimeFrameData/updateParameters', {
                ...this.$store.state.TimeFrameData.parameters,
                accountIdList: [this.c_selectedAccount.id],
            });
            this.$router.push({ name: 'transaction-page' });
        },
        openBudgetPage(this: any) {
            if (this.c_selectedAccount && this.c_selectedAccount.type === CashAccountType.ASSET) {
                this.$store.dispatch(
                    'BudgetTransaction/updateContextAccount',
                    this.c_selectedAccount,
                );
                this.$router.push({ name: 'budget-transaction-page' });
            }
        },
        toggleShowActiveAccountOnly(this: any) {
            this.$store.dispatch(
                'Account/updateShowActiveAccountOnly',
                !this.c_showActiveAccountOnly,
            );
        },
        toggleGroupByParentAccounts(this: any) {
            this.$store.dispatch(
                'Account/updateGroupByParentAccounts',
                !this.c_groupByParentAccounts,
            );
        },
        selectedAccountIsAsset(this: any) {
            return this.c_selectedAccount && this.c_selectedAccount.type === CashAccountType.ASSET;
        },
    },
    watch: {
        c_groupByParentAccounts(this: any) {
            this.fetchData();
        },
    },
    async created(this: any) {
        await this.fetchData();
    },
});
</script>

<style lang="scss" scoped>
.main-content-two-panel {
    flex: 1;
    display: flex;
    flex-flow: row;
    overflow-y: auto;
}

.left-panel {
    flex: 0 0 auto;
    /* Shorthand for:
            flex-grow
            flex-shrink
            flex-basis
         */
    overflow-y: auto;
    border-right: 1px solid #ebeef5;
    padding: 10px 20px;
    min-width: 35%;
}

.right-panel {
    flex: 1;
    /* Shorthand for:
            flex-grow
            flex-shrink
            flex-basis
         */
    overflow-y: auto;
    padding: 10px 20px;
}
</style>
