<template>
    <account-page :accountTree="accountTree" />
</template>

<script lang="ts">
import Vue from 'vue';
import AccountPage from './AccountPage.vue';
import CashAccount from '../../backend/database/entity/CashAccount';
import CashAccountUtils from '../../backend/utils/CashAccountUtils';

export default Vue.extend({
    name: 'account-external-page',
    components: {
        AccountPage,
    },
    computed: {
        accountTree(this: any): CashAccount[] {
            return this.$store.state.PermanentData.accountTree.filter((a: CashAccount) =>
                CashAccountUtils.isExternal(a),
            );
        },
    },
    methods: {},
});
</script>
