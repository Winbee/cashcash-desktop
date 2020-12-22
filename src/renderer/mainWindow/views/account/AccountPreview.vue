<template>
    <div class="account-preview">
        <div class="content">
            <v-wait :for="waitType">
                <template slot="waiting">
                    <div class="cash-loading" v-loading="true"></div>
                </template>
                <div>{{ account.name }}</div>
                <chart :options="c_optionChart" :autoresize="true"></chart>
                <chart v-if="c_optionChart2" :options="c_optionChart2" :autoresize="true"></chart>
                <chart v-if="c_optionChart3" :options="c_optionChart3" :autoresize="true"></chart>
                <chart v-if="c_optionChart4" :options="c_optionChart4" :autoresize="true"></chart>
            </v-wait>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import GenericNavbar from '../../components/GenericNavbar.vue';
import WaitType from '../../backend/database/entity/enumeration/WaitType';

export default Vue.extend({
    name: 'account-preview',
    components: {
        GenericNavbar,
    },
    props: {
        account: Object,
    },
    data(this: any) {
        return {
            d_dialogVisible: false,
            waitType: WaitType.PREVIEW_ACCOUNT,
        };
    },
    computed: {
        c_optionChart(this: any): any {
            return this.$store.state.AccountPreview.optionChart;
        },
        c_optionChart2(this: any): any {
            return this.$store.state.AccountPreview.optionChart2;
        },
        c_optionChart3(this: any): any {
            return this.$store.state.AccountPreview.optionChart3;
        },
        c_optionChart4(this: any): any {
            return this.$store.state.AccountPreview.optionChart4;
        },
    },
});
</script>

<style lang="scss" scoped>
.navbar {
    p {
        margin: auto 15px auto 15px;
        font-size: 1.3em;
    }
}
.echarts {
    width: 100%;
}
</style>
