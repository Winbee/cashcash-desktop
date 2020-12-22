<template>
    <div class="main-wrapper">
        <navbar>
            <template slot="first-line-left">
                <generic-parameters
                    :parameters="c_parameters"
                    :actionableParameters="[
                        'currency',
                        'createdDateFrom',
                        'createdDateTo',
                        'updatedDateFrom',
                        'updatedDateTo',
                    ]"
                    :vuexDispatch="'Rate/updateParameters'"
                    :placeholder="$t('Rates')"
                />
            </template>
            <template slot="second-line-left">
                <gen-tooltip :content="$t('New rate')" v-if="d_multipleSelection.length === 0">
                    <gen-button circle size="small" @click="goto('/rate/new')">
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
                <gen-tooltip :content="$t('Edit rate')" v-if="d_multipleSelection.length === 1">
                    <gen-button circle @click="edit()" size="small">
                        <fa icon="pen" fixed-width></fa>
                    </gen-button>
                </gen-tooltip>
                <gen-tooltip :content="$t('Remove rate')" v-if="d_multipleSelection.length > 0">
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
                <el-table-column
                    prop="fromCurrency"
                    :label="$t('From currency')"
                    :formatter="formatFromCurrency"
                ></el-table-column>
                <el-table-column
                    prop="toCurrency"
                    :label="$t('To currency')"
                    :formatter="formatToCurrency"
                ></el-table-column>
                <el-table-column prop="rate" :label="$t('Rate')"></el-table-column>
            </el-table>

            <el-dialog
                :title="$t('Delete')"
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
import PrintUtil from '../../backend/utils/PrintUtils';
import _ from 'lodash';
import CashRate from '../../backend/database/entity/CashRate';
import CashCurrency from '../../backend/database/entity/CashCurrency';
import Navbar from '../../components/Navbar.vue';
import GenericParameters from '../../components/genericparameters/GenericParameters.vue';
import Container from 'typedi';
import CashRateService from '../../backend/service/CashRateService';
import PaginationStatus from '../../components/PaginationStatus.vue';
import GenButton from '../../components/GenButton.vue';
import GenTooltip from '../../components/GenTooltip.vue';
import VueScrollTo from 'vue-scrollto';
import DateUtils from '../../backend/utils/DateUtils';

export default Vue.extend({
    name: 'rate-page',
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
            d_multipleSelection: [] as CashRate[],
            d_selectAll: false,
        };
    },
    computed: {
        c_page(this: any) {
            return this.$store.state.Rate.ratePage;
        },
        c_parameters(this: any) {
            return this.$store.state.Rate.parameters;
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
        edit(this: any) {
            if (this.d_multipleSelection.length === 1) {
                this.$router.push({
                    name: 'rate-edit-page',
                    params: { rateId: this.d_multipleSelection[0].id },
                });
            }
        },
        showRemoveDialog() {
            this.d_dialogVisible = true;
        },
        async remove(this: any) {
            this.d_dialogVisible = false;
            if (this.d_selectAll) {
                const service = Container.get(CashRateService);
                const list = await service.getListByParam(this.c_parameters);
                await this.$store.dispatch(
                    'Rate/deleteRateList',
                    list.map((item) => item.id),
                );
            } else if (this.d_multipleSelection.length === 1) {
                await this.$store.dispatch('Rate/deleteRate', this.d_multipleSelection[0].id);
            } else if (this.d_multipleSelection.length > 1) {
                await this.$store.dispatch(
                    'Rate/deleteRateList',
                    this.d_multipleSelection.map((item) => item.id),
                );
            }
        },
        printDate(rate: CashRate): string {
            return DateUtils.formatHumanDate(rate.updatedDate);
        },
        changePage(this: any, pageNumber: number) {
            VueScrollTo.scrollTo('.main-content', 800, {
                container: '.main-content',
                easing: 'ease-in-out',
            });
            const route = {
                name: 'rate-page',
                query: {
                    page: pageNumber,
                },
            };
            this.$router.push(route);
        },
        fetchData(this: any) {
            const page = this.$route.query.page ? Number(this.$route.query.page) : 1;
            this.$store.dispatch('Rate/fillRate', { page });
        },
        formatFromCurrency(this: any, row: CashRate): CashCurrency {
            return this.$store.getters['PermanentData/currencyMap'].get(row.fromCurrencyId).isoCode;
        },
        formatToCurrency(this: any, row: CashRate): CashCurrency {
            return this.$store.getters['PermanentData/currencyMap'].get(row.toCurrencyId).isoCode;
        },
        goto(this: any, path: string) {
            this.$router.push({ path });
        },
        selectAndEdit(this: any, item: CashRate) {
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
                return this.$t('Delete {total} rates?', { total: this.c_page.totalItem });
            } else if (this.d_multipleSelection.length === 1) {
                return this.$t('Delete the rate {name}?', { name: this.d_multipleSelection[0].id });
            } else {
                return this.$t('Delete {total} rates?', { total: this.d_multipleSelection.length });
            }
        },
        toggleSelectAll(this: any) {
            this.d_selectAll = !this.d_selectAll;
        },
    },
});
</script>

<style lang="scss" scoped></style>
