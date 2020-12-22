<template>
    <div class="main-wrapper">
        <navbar>
            <template slot="first-line-left">
                <transaction-parameters :routeAfterUpdate="'transaction-page'" />
            </template>
            <template slot="first-line-right">
                <transaction-date-range-parameters />
            </template>
            <template slot="second-line-left">
                <gen-button @click.prevent="goToPrevious()" size="small">{{
                    $t('Previous')
                }}</gen-button>
                <el-button type="primary" @click.prevent="goToNext()" size="small">{{
                    getNextLabel()
                }}</el-button>
            </template>
            <template slot="second-line-right">
                <pagination-status
                    :total="c_pagedTransactionList.totalItem"
                    :current-page="c_pagedTransactionList.currentPage"
                    :page-size="c_pagedTransactionList.itemPerPage"
                    hideButtons
                ></pagination-status>
            </template>
        </navbar>
        <div class="main-content">
            <v-wait :for="waitType">
                <template slot="waiting">
                    <div class="cash-loading" v-loading="true"></div>
                </template>
                <el-form label-width="120px" ref="form" :model="formObject">
                    <el-card
                        v-for="(oneTransaction, index) in c_pagedTransactionList.itemList"
                        :key="oneTransaction.uniqTempId"
                        class="box-card"
                    >
                        <transaction-edit-component
                            :wipTransaction="oneTransaction"
                            :isDisabled="oneTransaction.doNotImport"
                            :propertyName="getPropertyName(index)"
                            :index="index"
                            @validate="validateProp"
                        />
                    </el-card>
                </el-form>
            </v-wait>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import TransactionEditComponent from '../../transaction/TransactionEditComponent.vue';
import FlatCashTransaction from '../../../backend/database/entity/proxy/FlatCashTransaction';
import _ from 'lodash';
import Page from '../../../backend/service/dto/Page';
import Navbar from '../../../components/Navbar.vue';
import TransactionParameters from '../../../components/genericparameters/TransactionParameters.vue';
import TransactionDateRangeParameters from '../../../components/genericparameters/TransactionDateRangeParameters.vue';
import PaginationStatus from '../../../components/PaginationStatus.vue';
import GenButton from '../../../components/GenButton.vue';
import WaitType from '../../../backend/database/entity/enumeration/WaitType';
import VueScrollTo from 'vue-scrollto';
import Container from 'typedi';
import CashTransactionService from '../../../backend/service/CashTransactionService';

const ITEM_PER_PAGE = 5;

export default Vue.extend({
    name: 'multi-edit-transaction-page',
    components: {
        TransactionEditComponent,
        Navbar,
        TransactionParameters,
        TransactionDateRangeParameters,
        PaginationStatus,
        GenButton,
    },
    data(this: any) {
        const wipTransactionList = _.cloneDeep(
            this.$store.state.MultiEditTransaction.wipTransactionList,
        );
        return {
            formObject: {
                wipTransactionList,
            },
            isLoaded: true,
            currentPage: 1,
            waitType: WaitType.SAVE_TRANSACTION_LIST,
        };
    },
    computed: {
        c_totalPage(this: any): number {
            return Math.ceil(this.formObject.wipTransactionList.length / ITEM_PER_PAGE);
        },
        c_pagedTransactionList(this: any): Page<FlatCashTransaction> {
            const firstIndex = (this.currentPage - 1) * ITEM_PER_PAGE;
            return {
                currentPage: this.currentPage,
                itemPerPage: ITEM_PER_PAGE,
                totalItem: this.formObject.wipTransactionList.length,
                itemList: this.formObject.wipTransactionList.slice(
                    firstIndex,
                    firstIndex + ITEM_PER_PAGE,
                ),
            };
        },
        c_parameters(this: any) {
            return this.$store.state.TimeFrameData.parameters;
        },
        c_dateRange(this: any) {
            return [
                this.$store.state.TimeFrameData.parameters.transactionDateFrom,
                this.$store.state.TimeFrameData.parameters.transactionDateTo,
            ];
        },
    },
    methods: {
        goToPrevious(this: any) {
            if (this.currentPage === 1) {
                this.$router.push({ name: 'multi-edit-rule-page' });
            } else {
                VueScrollTo.scrollTo('.main-content', 800, {
                    container: '.main-content',
                    easing: 'ease-in-out',
                });
                this.currentPage--;
            }
        },
        async goToNext(this: any) {
            const isValid = await new Promise((resolve, reject) => {
                this.$refs['form'].validate((valid, errorObject) => {
                    if (valid) {
                        VueScrollTo.scrollTo('.main-content', 800, {
                            container: '.main-content',
                            easing: 'ease-in-out',
                        });
                        resolve(true);
                    } else {
                        setTimeout(() => {
                            VueScrollTo.scrollTo('.is-error', 800, {
                                container: '.main-content',
                                easing: 'ease-in-out',
                                offset: -40,
                            });
                        }, 300);
                        resolve(false);
                    }
                });
            });
            if (isValid) {
                if (this.currentPage === this.c_totalPage) {
                    this.save();
                } else {
                    this.currentPage++;
                }
            }
        },
        getNextLabel() {
            return this.currentPage === this.c_totalPage ? 'Save' : 'Next';
        },
        changePage(this: any, pageNumber: number) {
            this.currentPage = pageNumber;
        },
        async save(this: any) {
            this.$wait.start(WaitType.SAVE_TRANSACTION_LIST);
            try {
                await this.$store.dispatch(
                    'Transaction/saveTransactionList',
                    this.formObject.wipTransactionList,
                );
                await this.$store.dispatch('MultiEditTransaction/reset');
                this.$router.push({ name: 'transaction-page' });
            } finally {
                this.$wait.end(WaitType.SAVE_TRANSACTION_LIST);
            }
        },
        async cancel(this: any) {
            this.$router.push({ name: 'transaction-page' });
        },
        getPropertyName(this: any, index): string {
            const realIndex =
                (this.c_pagedTransactionList.currentPage - 1) *
                    this.c_pagedTransactionList.itemPerPage +
                index;
            return 'wipTransactionList.' + realIndex.toString();
        },
        validateProp(this: any, propName) {
            this.$refs['form'].validateField(propName);
        },
    },
});
</script>

<style lang="scss" scoped>
.box-card {
    margin-bottom: 30px;
}
</style>
