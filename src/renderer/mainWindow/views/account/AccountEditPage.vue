<template>
    <div class="main-wrapper">
        <navbar>
            <template slot="first-line-left">
                <transaction-parameters
                    :routeAfterUpdate="
                        this.c_isInternal ? 'account-internal-page' : 'account-external-page'
                    "
                />
            </template>
            <template slot="first-line-right">
                <transaction-date-range-parameters />
            </template>
            <template slot="second-line-left">
                <gen-button @click.prevent="cancel()" size="mini">{{ $t('Cancel') }}</gen-button>
                <el-button type="primary" @click.prevent="submitForm()" size="mini">{{
                    $t('Save')
                }}</el-button>
            </template>
        </navbar>
        <div class="main-content">
            <div v-if="wipAccount">
                <el-form ref="form" :model="wipAccount" :rules="rules" label-width="120px">
                    <el-form-item prop="isDirectory">
                        <el-switch
                            v-if="isNew"
                            style="display: block"
                            v-model="wipAccount.isDirectory"
                            active-color="#66b1ff"
                            inactive-color="#66b1ff"
                            :active-text="$t('Directory')"
                            :inactive-text="$t('Account')"
                        ></el-switch>
                        <div v-else>
                            <fa :icon="getIconName()" fixed-width></fa>
                            {{ wipAccount.isDirectory ? $t('Directory') : $t('Account') }}
                        </div>
                    </el-form-item>
                    <el-form-item :label="$t('Name')" prop="name">
                        <div v-if="wipAccount.isProtected">{{ wipAccount.name }}</div>
                        <el-input
                            v-else
                            v-model="wipAccount.name"
                            v-autosize="wipAccount.name"
                            size="small"
                        ></el-input>
                    </el-form-item>
                    <el-form-item :label="$t('Code')" prop="code">
                        <div v-if="wipAccount.isProtected">{{ wipAccount.code }}</div>
                        <el-input
                            v-else
                            v-model="wipAccount.code"
                            v-autosize="wipAccount.code"
                            size="small"
                        ></el-input>
                    </el-form-item>
                    <el-form-item v-if="isInternalLeaf()" :label="$t('Currency')" prop="currency">
                        <currency-autocomplete
                            :object.sync="wipAccount.currency"
                            :optionList="c_currencyList"
                            :disabled="disableCurrency"
                        />
                    </el-form-item>
                    <el-form-item :label="$t('Parent')" prop="parentAccount">
                        <div v-if="wipAccount.isProtected">
                            {{ wipAccount.parentAccount ? wipAccount.parentAccount.name : 'None' }}
                        </div>
                        <account-autocomplete
                            v-else
                            :object.sync="wipAccount.parentAccount"
                            :optionList="c_possibleParentDirectory"
                        />
                    </el-form-item>
                    <el-form-item :label="$t('Type')">
                        <div>{{ c_accountType }}</div>
                    </el-form-item>
                    <el-form-item v-if="wipAccount.createdDate" :label="$t('Created at')">
                        <div>{{ formatDate(wipAccount.createdDate) }}</div>
                    </el-form-item>
                    <el-form-item v-if="wipAccount.updatedDate" :label="$t('Updated at')">
                        <div>{{ formatDate(wipAccount.updatedDate) }}</div>
                    </el-form-item>
                </el-form>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import CashAccount from '../../backend/database/entity/CashAccount';
import AccountAutocomplete from './AccountAutocomplete.vue';
import CurrencyAutocomplete from '../currency/CurrencyAutocomplete.vue';
import EnumAutocomplete from '../../components/EnumAutocomplete.vue';
import CashCurrency from '../../backend/database/entity/CashCurrency';
import _ from 'lodash';
import CashAccountType from '../../backend/database/entity/enumeration/CashAccountType';
import CashAccountUtils from '../../backend/utils/CashAccountUtils';
import TransactionParameters from '../../components/genericparameters/TransactionParameters.vue';
import TransactionDateRangeParameters from '../../components/genericparameters/TransactionDateRangeParameters.vue';
import Navbar from '../../components/Navbar.vue';
import GenButton from '../../components/GenButton.vue';
import PrintUtils from '../../backend/utils/PrintUtils';
import DateUtils from '../../backend/utils/DateUtils';

export default Vue.extend({
    name: 'account-edit-page',
    components: {
        AccountAutocomplete,
        CurrencyAutocomplete,
        EnumAutocomplete,
        Navbar,
        TransactionParameters,
        TransactionDateRangeParameters,
        GenButton,
    },
    data(this: any) {
        const checkParentAccount = (rule, value, callback, source) => {
            if (!this.wipAccount.isProtected && !value) {
                callback(new Error(this.$t('Please define a parent account')));
            } else {
                callback();
            }
        };
        const checkUniqueCode = (rule, value, callback, source) => {
            const upperCaseValue = value ? value.toUpperCase() : null;
            if (this.c_otherAccountCodeSet.has(upperCaseValue)) {
                callback(new Error(this.$t('Account code must be unique')));
            } else {
                callback();
            }
        };

        const trim = (stringValue) => (stringValue ? stringValue.trim() : null);
        return {
            wipAccount: null as CashAccount | null,
            isNew: this.$route.params.accountId === 'new',
            disableCurrency: true,
            rules: {
                name: [
                    {
                        type: 'string',
                        whitespace: true,
                        message: this.$t('Whitespace only is not possible'),
                        trigger: 'blur',
                        transform: (stringValue) => trim(stringValue),
                    },
                    {
                        type: 'string',
                        min: 3,
                        max: 40,
                        message: this.$t('Length should be between 3 and 40'),
                        trigger: 'blur',
                    },
                ],
                code: [
                    {
                        type: 'string',
                        whitespace: true,
                        message: this.$t('Whitespace only is not possible'),
                        trigger: 'blur',
                        transform: (stringValue) => {
                            stringValue = trim(stringValue);
                            return stringValue ? stringValue.toUpperCase() : null;
                        },
                    },
                    {
                        type: 'string',
                        min: 3,
                        max: 10,
                        message: this.$t('Length should be between 3 and 10'),
                        trigger: 'blur',
                    },
                    { validator: checkUniqueCode, trigger: 'blur' },
                ],
                currency: [
                    {
                        type: 'object',
                        required: true,
                        message: this.$t('Please define a currency'),
                        trigger: 'blur',
                    },
                    { validator: checkParentAccount, trigger: 'blur' },
                ],
                parentAccount: [{ validator: checkParentAccount, trigger: 'blur' }],
            },
        };
    },
    computed: {
        c_currencyList(this: any): CashCurrency[] {
            return this.$store.state.PermanentData.currencyList;
        },
        c_isInternal(this: any): boolean {
            return this.wipAccount && CashAccountUtils.isInternal(this.wipAccount);
        },
        c_accountType(this: any): CashAccountType {
            if (!this.wipAccount) {
                return CashAccountType.ASSET;
            }
            return this.wipAccount.parentAccount
                ? this.wipAccount.parentAccount.type
                : this.wipAccount.type;
        },
        c_possibleParentDirectory(this: any): CashAccount[] {
            let possibleParentDirectory = this.$store.getters[
                'PermanentData/directoryAccountList'
            ].filter((a) => a.type === this.c_accountType);
            if (this.wipAccount.id) {
                const childrenAndHimselfIds = [
                    this.wipAccount.id,
                    ...CashAccountUtils.extractSubAccounts(
                        this.$store.state.PermanentData.accountMap,
                        this.wipAccount.id,
                    ),
                ];
                possibleParentDirectory = possibleParentDirectory.filter(
                    (item) => !childrenAndHimselfIds.includes(item.id),
                );
            }
            return possibleParentDirectory;
        },
        c_otherAccountCodeSet(this: any): Set<string> {
            return new Set(
                this.$store.state.PermanentData.accountList
                    .filter((a) => a.id !== this.wipAccount.id && a.code)
                    .map((a) => a.code),
            );
        },
    },
    methods: {
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
                this.save();
            }
        },
        async save(this: any) {
            await this.$store.dispatch('Account/saveAccount', this.wipAccount);
            if (this.c_isInternal) {
                this.$router.push({ name: 'account-internal-page' });
            } else {
                this.$router.push({ name: 'account-external-page' });
            }
        },
        async cancel(this: any) {
            this.$router.go(-1);
        },
        getIconName(this: any) {
            return this.wipAccount.isDirectory ? 'folder-open' : 'book';
        },
        isInternalLeaf(this: any) {
            return !this.wipAccount.isDirectory && this.c_isInternal;
        },
        formatDate(this: any, dateObj: Date): string {
            return DateUtils.formatHumanDate(dateObj);
        },
    },
    async created(this: any) {
        const accountId = this.$route.params.accountId;
        const parentAccount = this.$route.params.parentAccount;
        await this.$store.dispatch('Account/initWipAccount', {
            accountId,
            parentAccount,
        });
        this.wipAccount = _.cloneDeep(this.$store.state.Account.wipAccount);
        this.disableCurrency =
            this.$store.state.Account.wipAccountHasSplits &&
            !this.wipAccount.isDirectory &&
            CashAccountUtils.isInternal(this.wipAccount);
        if (!this.wipAccount.isProtected) {
            this.rules.parentAccount.push({
                required: true,
                message: this.$t('Please define a parent'),
                trigger: 'blur',
            });
            this.rules.name.push({
                required: true,
                message: this.$t('Please define a name'),
                trigger: 'blur',
            });
        }
    },
});
</script>

<style lang="scss" scoped></style>
