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
                <gen-button
                    @click.prevent="goToPrevious()"
                    size="small"
                    :disabled="$wait.waiting(waitType)"
                    >{{ $t('Previous') }}</gen-button
                >
                <el-button
                    type="primary"
                    @click.prevent="goToNext()"
                    size="small"
                    :disabled="$wait.waiting(waitType)"
                    >{{ getNextLabel() }}</el-button
                >
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
                        <div slot="header" class="clearfix">
                            <el-switch
                                v-model="oneTransaction.doNotImport"
                                style="float: left; padding: 3px 0"
                                active-color="#dcdfe6"
                                inactive-color="#409eff"
                                :active-text="$t('Ignore')"
                                :inactive-text="$t('Import')"
                                @change="() => clearValidate(index)"
                            />
                        </div>
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
import TransactionEditComponent from '../transaction/TransactionEditComponent.vue';
import FlatCashTransaction from '../../backend/database/entity/proxy/FlatCashTransaction';
import _ from 'lodash';
import Page from '../../backend/service/dto/Page';
import Navbar from '../../components/Navbar.vue';
import PaginationStatus from '../../components/PaginationStatus.vue';
import GenericParameters from '../../components/genericparameters/GenericParameters.vue';
import GenButton from '../../components/GenButton.vue';
import WaitType from '../../backend/database/entity/enumeration/WaitType';
import VueScrollTo from 'vue-scrollto';

const ITEM_PER_PAGE = 5;

export default Vue.extend({
    name: 'import-transaction-page',
    components: {
        TransactionEditComponent,
        Navbar,
        GenericParameters,
        PaginationStatus,
        GenButton,
    },
    data(this: any) {
        const wipTransactionList = _.cloneDeep(this.$store.state.ImportFile.wipTransactionList);
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
        c_totalPage(this: any) {
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
            return this.$store.state.ImportConfig.parameters;
        },
    },
    methods: {
        goToPrevious(this: any) {
            if (this.currentPage === 1) {
                this.$router.push({ name: 'import-file-page' });
            } else {
                VueScrollTo.scrollTo('.main-content', 800, {
                    container: '.main-content',
                    easing: 'ease-in-out',
                });
                this.currentPage--;
            }
        },
        async goToNext(this: any) {
            const isValid = await this.validate();
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
        async validate(this: any): Promise<boolean> {
            return await new Promise((resolve, reject) => {
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
        },
        clearValidate(this: any, index) {
            const propertyName = this.getPropertyName(index);
            for (const key of Object.keys(this.c_pagedTransactionList.itemList[index])) {
                this.$refs['form'].clearValidate(propertyName + '.' + key);
            }
        },
    },
});
</script>

<style lang="scss" scoped>
.box-card {
    margin-bottom: 30px;
}
</style>
