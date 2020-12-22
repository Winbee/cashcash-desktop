<template>
    <div class="tree-menu">
        <el-tree
            :data="models"
            node-key="id"
            default-expand-all
            :expand-on-click-node="false"
            :filter-node-method="filterNode"
            ref="tree"
            @node-click="selectAccount"
            :highlight-current="true"
            :current-node-key="c_selectedAccount ? c_selectedAccount.id : null"
        >
            <div class="custom-tree-node" slot-scope="{ node, data }">
                <tree-item :account="data" />
            </div>
        </el-tree>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import CashAccount from '../../backend/database/entity/CashAccount';
import TreeItem from './TreeItem.vue';
import CashAccountUtils from '../../backend/utils/CashAccountUtils';
import VueScrollTo from 'vue-scrollto';

export default Vue.extend({
    name: 'tree-root',
    props: {
        models: Array,
    },
    components: {
        TreeItem,
    },
    data(this: any) {
        return {};
    },
    computed: {
        c_isInternal(this: any): any {
            return CashAccountUtils.isInternal(this.models[0]);
        },
        c_parameters(this: any) {
            return this.$store.state.Account.filterParameters;
        },
        c_selectedAccount(this: any) {
            return this.c_isInternal
                ? this.$store.state.Account.selectedInternalAccount
                : this.$store.state.Account.selectedExternalAccount;
        },
        c_activeAccountIdSet(this: any): Set<number> {
            return this.$store.state.TimeFrameData.activeAccountIdSet;
        },
        c_showActiveAccountOnly(this: any): Set<number> {
            return this.$store.state.Account.showActiveAccountOnly;
        },
    },
    methods: {
        filterNode(_: void, data: CashAccount) {
            if (this.c_showActiveAccountOnly && !this.c_activeAccountIdSet.has(data.id)) {
                return false;
            }
            return true;
        },
        async selectAccount(this: any, account: CashAccount) {
            this.$store.dispatch('Account/selectAccount', account);

            await this.$store.dispatch('AccountPreview/initAccountPreview', account.id);
            await this.$store.dispatch('AccountPreview/generateOptionChart');
        },
    },
    watch: {
        c_parameters(this: any) {
            this.$refs.tree.filter(null);
        },
        c_showActiveAccountOnly(this: any) {
            this.$refs.tree.filter(null);
        },
    },
    mounted(this: any) {
        this.$refs.tree.filter(null);
        if (this.c_selectedAccount) {
            VueScrollTo.scrollTo('#tree-item-' + this.c_selectedAccount.id, 0, {
                container: '.left-panel',
                offset: -10,
            });
        }
    },
});
</script>

<style lang="scss" scoped>
.el-badge {
    vertical-align: bottom;

    .el-badge__content {
        line-height: 17px;
    }
}
.input {
    padding-bottom: 10px;
}
</style>
