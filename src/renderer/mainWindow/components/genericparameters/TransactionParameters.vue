<template>
    <div class="transaction-parameters">
        <generic-parameters
            :parameters="c_parameters"
            :actionableParameters="c_actionnableParameters"
            :vuexDispatch="'TimeFrameData/updateParameters'"
            :routeAfterUpdate="routeAfterUpdate"
            :placeholder="$t('Transactions')"
            @update:parameters="(newValue) => $emit('update:parameters', newValue)"
            saveAction
            isTransaction
        />
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import _ from 'lodash';
import GenericParameters from './GenericParameters.vue';

export default Vue.extend({
    name: 'transaction-parameters',
    components: {
        GenericParameters,
    },
    props: {
        routeAfterUpdate: String,
    },
    data(this: any) {
        return {};
    },
    computed: {
        c_parameters(this: any) {
            return this.$store.state.TimeFrameData.parameters;
        },
        c_actionnableParameters() {
            return [
                'searchString',
                'detailSearchString',
                'account',
                'fromAccount',
                'toAccount',
                'currency',
                'amountEquals',
                'amountLessThan',
                'amountGreaterThan',
                'transactionType',
            ];
        },
    },
    methods: {},
    async created(this: any) {},
});
</script>

<style lang="scss" scoped>
.transaction-parameters {
    width: 100%;
}
</style>
