<template>
    <div class="main-wrapper">
        <navbar>
            <template slot="first-line-left">
                <transaction-parameters @update:parameters="fetchData" />
            </template>
            <template slot="first-line-right">
                <transaction-date-range-parameters @update:dateRange="fetchData" />
            </template>
            <template slot="second-line-left">
                <gen-tooltip
                    :content="c_showTopTen ? $t('Top ten accounts per type') : $t('Total per type')"
                >
                    <gen-button circle size="small" @click="toggleShowTopTen()">
                        <fa :icon="c_showTopTen ? 'dice-six' : 'dice-one'" fixed-width></fa>
                    </gen-button>
                </gen-tooltip>
            </template>
        </navbar>
        <div class="main-content">
            <!-- <cashcash-logo></cashcash-logo>
            <br> -->
            <div class="container">
                <div class="arrow arrowLeft" @click="gotoTransaction('INCOME')">
                    <el-popover
                        placement="bottom"
                        width="200"
                        trigger="hover"
                        :content="$t('INCOME')"
                    >
                        <div slot="reference">→</div>
                    </el-popover>
                </div>
                <div class="arrow arrowRight" @click="gotoTransaction('EXPENSE')">
                    <el-popover
                        placement="bottom"
                        width="200"
                        trigger="hover"
                        :content="$t('EXPENSE')"
                    >
                        <div slot="reference">→</div>
                    </el-popover>
                </div>
                <div class="arrowBottomArea">
                    <div @click="gotoTransaction('LIABILITY_DECREASE')" class="arrow arrowDown">
                        <el-popover
                            placement="bottom"
                            width="200"
                            trigger="hover"
                            :content="$t('LIABILITY_DECREASE')"
                        >
                            <div slot="reference">→</div>
                        </el-popover>
                    </div>
                    <div @click="gotoTransaction('LIABILITY_INCREASE')" class="arrow arrowUp">
                        <el-popover
                            placement="bottom"
                            width="200"
                            trigger="hover"
                            :content="$t('LIABILITY_INCREASE')"
                        >
                            <div slot="reference">→</div>
                        </el-popover>
                    </div>
                </div>
                <div class="box-card inc" shadow="hover">
                    <div class="title">
                        <gen-button @click="gotoToAccount('INC')">{{ $t('Income') }}</gen-button>
                    </div>
                    <chart :options="c_incomeOptionChart" :autoresize="true"></chart>
                </div>
                <div class="box-card ass" shadow="hover">
                    <div @click="gotoTransaction('ASSET_TRANSFER')" class="arrow arrowCorner">
                        <el-popover
                            placement="bottom"
                            width="200"
                            trigger="hover"
                            :content="$t('ASSET_TRANSFER')"
                        >
                            <div slot="reference">↻</div>
                        </el-popover>
                    </div>
                    <div class="title">
                        <gen-button @click="gotoToAccount('ASS')">{{ $t('Asset') }}</gen-button>
                    </div>
                    <chart :options="c_assetOptionChart" :autoresize="true"></chart>
                </div>
                <div class="box-card lia" shadow="hover">
                    <div @click="gotoTransaction('LIABILITY_TRANSFER')" class="arrow arrowCorner">
                        <el-popover
                            placement="bottom"
                            width="200"
                            trigger="hover"
                            :content="$t('LIABILITY_TRANSFER')"
                        >
                            <div slot="reference">↻</div>
                        </el-popover>
                    </div>
                    <div class="title">
                        <gen-button @click="gotoToAccount('LIA')">{{ $t('Liability') }}</gen-button>
                    </div>
                    <chart :options="c_liabilityOptionChart" :autoresize="true"></chart>
                </div>
                <div class="box-card exp" shadow="hover">
                    <div class="title">
                        <gen-button @click="gotoToAccount('EXP')">{{ $t('Expense') }}</gen-button>
                    </div>
                    <chart :options="c_expenseOptionChart" :autoresize="true"></chart>
                </div>
            </div>
            <div class="activity-container">
                <div class="box-card" shadow="hover" v-if="c_optionChart2">
                    <div class="title">{{ $t('Activity heatmap') }}</div>
                    <chart :options="c_optionChart2" :autoresize="true"></chart>
                </div>
            </div>
            <el-dialog
                :title="$t('Welcome to Cashcash')"
                :visible.sync="welcomeDialogVisible"
                :close-on-click-modal="false"
                :close-on-press-escape="false"
                :show-close="false"
                v-if="welcomeDialogVisible"
            >
                <p>{{ $t('pick.your.default.currency') }}</p>
                <el-form ref="form" :model="wipPreferences" label-width="170px" :rules="rules">
                    <el-form-item :label="$t('Language')" prop="jsonPreferences.lang">
                        <enum-autocomplete
                            :stringValue="wipPreferences.jsonPreferences.lang"
                            @update:stringValue="updateLang"
                            :optionList="langList"
                        />
                    </el-form-item>
                    <el-form-item :label="$t('Default currency')" prop="preferedCurrency">
                        <currency-autocomplete
                            :object.sync="wipPreferences.preferedCurrency"
                            :optionList="c_currencyList"
                        />
                    </el-form-item>
                </el-form>
                <span slot="footer" class="dialog-footer">
                    <el-button type="primary" @click="submitForm()">{{ $t('Confirm') }}</el-button>
                </span>
            </el-dialog>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import CashAccount from '../backend/database/entity/CashAccount';
import CashAccountUtils from '../backend/utils/CashAccountUtils';
import { Container } from 'typedi';
import CashAccountService from '../backend/service/CashAccountService';
import Navbar from '../components/Navbar.vue';
import _ from 'lodash';
import CurrencyAutocomplete from './currency/CurrencyAutocomplete.vue';
import CashTransactionType from '../backend/database/entity/enumeration/CashTransactionType';
import WaitType from '../backend/database/entity/enumeration/WaitType';
import TransactionParameters from '../components/genericparameters/TransactionParameters.vue';
import TransactionDateRangeParameters from '../components/genericparameters/TransactionDateRangeParameters.vue';
import GenButton from '../components/GenButton.vue';
import GenTooltip from '../components/GenTooltip.vue';
import CashcashLogo from '../../common/components/CashcashLogo.vue';
import CashPreferences from '../backend/database/entity/CashPreferences';
import EnumAutocomplete from '../components/EnumAutocomplete.vue';

export default Vue.extend({
    name: 'home-page',
    components: {
        Navbar,
        CurrencyAutocomplete,
        TransactionParameters,
        TransactionDateRangeParameters,
        GenButton,
        GenTooltip,
        CashcashLogo,
        EnumAutocomplete,
    },
    data() {
        return {
            wipPreferences: null as CashPreferences | null,
            welcomeDialogVisible: false,
            langList: ['en', 'fr'].map((item) => {
                return { value: item, label: this.$t(item) };
            }),
            rules: {
                'jsonPreferences.lang': [
                    {
                        type: 'string',
                        required: true,
                        message: this.$t('Please define a language'),
                        trigger: 'blur',
                    },
                ],
                'preferedCurrency': [
                    {
                        type: 'object',
                        required: true,
                        message: this.$t('Please define a currency'),
                        trigger: 'blur',
                    },
                ],
            },
        };
    },
    computed: {
        c_accountList(this: any): CashAccount[] {
            return this.$store.state.PermanentData.accountList;
        },
        c_currencyList(this: any) {
            return this.$store.state.PermanentData.currencyList;
        },
        c_expenseOptionChart(this: any): any {
            return this.$store.state.Home.expenseOptionChart;
        },
        c_incomeOptionChart(this: any): any {
            return this.$store.state.Home.incomeOptionChart;
        },
        c_assetOptionChart(this: any): any {
            return this.$store.state.Home.assetOptionChart;
        },
        c_liabilityOptionChart(this: any): any {
            return this.$store.state.Home.liabilityOptionChart;
        },
        c_showTopTen(this: any): boolean {
            return this.$store.state.Home.showTopTen;
        },
        c_optionChart2(this: any): any {
            return this.$store.state.Home.optionChart2;
        },
    },
    methods: {
        gotoTransaction(this: any, transactionType: CashTransactionType) {
            this.$store.dispatch('TimeFrameData/updateParameters', {
                ...this.$store.state.TimeFrameData.parameters,
                transactionTypeList: [transactionType],
            });
            this.$router.push({ name: 'transaction-page' });
        },
        gotoToAccount(this: any, accountCode: string) {
            const account = this.c_accountList.find((a) => a.code === accountCode);
            if (account) {
                const isInternal = CashAccountUtils.isInternal(account);
                const pageName = isInternal ? 'account-internal-page' : 'account-external-page';
                this.$store.dispatch('Account/selectAccount', account);
                this.$router.push({ name: pageName });
            }
        },
        async submitForm(this: any) {
            const isValid = await new Promise((resolve, reject) => {
                this.$refs['form'].validate((valid, errorObject) => {
                    if (valid) {
                        resolve(true);
                    } else {
                        resolve(false);
                    }
                });
            });
            if (isValid) {
                await this.$store.dispatch('App/savePreferences', this.wipPreferences);
                await this.$store.dispatch(
                    'Account/createAllAccounts',
                    this.wipPreferences.preferedCurrency,
                );
                this.welcomeDialogVisible = false;
            }
        },
        async fetchData(this: any) {
            this.$wait.start(WaitType.HOME_PAGE);
            try {
                await this.$store.dispatch('TimeFrameData/fillSplitList');
                await this.$store.dispatch('Home/generateOptionChart');
            } finally {
                this.$wait.end(WaitType.HOME_PAGE);
            }
        },
        toggleShowTopTen(this: any) {
            this.$store.dispatch('Home/updateShowTopTen', !this.c_showTopTen);
        },
        updateLang(this: any, event: any) {
            if (event) {
                this.wipPreferences.jsonPreferences.lang = event;
                this.$i18n.locale = event;
            }
        },
    },
    watch: {
        c_showTopTen(this: any) {
            this.fetchData();
        },
    },
    async created(this: any) {
        const service = Container.get(CashAccountService);
        const hasAccount = await service.hasAccount();
        if (!hasAccount) {
            this.welcomeDialogVisible = true;
            this.wipPreferences = _.cloneDeep(this.$store.state.App.preferences);
        } else {
            this.welcomeDialogVisible = false;
            await this.fetchData();
        }
    },
});
</script>

<style lang="scss" scoped>
@import '../styles/variables.scss';

.main-content {
    padding-top: 35px;
    padding-left: 15px;
    padding-right: 15px;
    background: #f5f7fa;
}
.container {
    .echarts {
        width: 100%;
        height: 350px;
    }
    display: grid;
    grid-template-rows: auto auto auto;
    grid-template-columns: 1fr 1fr 50px 1fr 50px 1fr 50px 1fr 1fr;
    grid-template-areas:
        'inc  inc arrowLeft  ass         ass          ass         arrowRight exp  exp'
        '.    .   .          .           arrowBottom  .           .          .    .'
        '.    .   .          lia         lia          lia         .          .    .';
    justify-items: center;
    align-items: stretch;
    justify-content: center;
    grid-row-gap: 15px;

    .box-card {
        position: relative;
        width: 100%;
        border-radius: 4px;
        border: 0;
        background-color: #ffffff;
        box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 3px 1px -2px rgba(0, 0, 0, 0.12),
            0 1px 5px 0 rgba(0, 0, 0, 0.2);
        padding-bottom: 10px;

        .title {
            text-align: center;
            padding: 2px;
        }

        &.inc {
            grid-area: inc;
        }
        &.ass {
            grid-area: ass;
        }
        &.lia {
            grid-area: lia;
        }
        &.equ {
            grid-area: equ;
        }
        &.exp {
            grid-area: exp;
        }
    }

    .arrow {
        color: #c1c1c1;
        font-size: 2em;
        transition: all 0.15s;
        cursor: pointer;

        &:hover {
            color: #717171;
        }

        &:active {
            color: #1b1b1b;
        }

        &.arrowUp {
            -webkit-transform: rotate(-90deg);
            position: relative;
            left: -8px;
        }
        &.arrowDown {
            -webkit-transform: rotate(90deg);
            position: relative;
        }

        &.arrowCorner {
            -webkit-transform: rotate(75deg);
            position: absolute;
            top: -25px;
            left: -20px;
        }
    }
    .arrowLeft {
        grid-area: arrowLeft;
        display: flex;
        justify-content: center;
        align-items: center;
        font-weight: bold;
    }
    .arrowRight {
        grid-area: arrowRight;
        display: flex;
        justify-content: center;
        align-items: center;
        font-weight: bold;
    }
    .arrowBottomArea {
        grid-area: arrowBottom;
        display: flex;
        flex-flow: row;
        font-weight: bold;
    }
}
.activity-container {
    margin: 50px 30px;
    .echarts {
        width: 100%;
        height: 520px;
    }
    .box-card {
        position: relative;
        width: 100%;
        border-radius: 4px;
        border: 0;
        background-color: #ffffff;
        box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 3px 1px -2px rgba(0, 0, 0, 0.12),
            0 1px 5px 0 rgba(0, 0, 0, 0.2);
        padding-bottom: 10px;

        .title {
            text-align: center;
            padding: 2px;
            padding-top: 12px;
            height: 44px;
        }
    }
}
</style>
