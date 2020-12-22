<template>
    <div class="main-wrapper">
        <navbar>
            <template slot="first-line-left">
                <span class="title">{{ $t('Preferences') }}</span>
            </template>
            <template slot="second-line-left">
                <gen-tooltip :content="$t('Export current database file')">
                    <gen-button @click.prevent="exportDatabase()" size="small" circle>
                        <fa icon="upload" fixed-width></fa>
                    </gen-button>
                </gen-tooltip>
                <gen-tooltip :content="$t('Import external database file')">
                    <gen-button @click.prevent="d_dialogVisible = true" size="small" circle>
                        <fa icon="download" fixed-width></fa>
                    </gen-button>
                </gen-tooltip>
                <gen-tooltip :content="$t('Delete current database file')">
                    <gen-button @click.prevent="d_deleteDialogVisible = true" size="small" circle>
                        <fa icon="trash" fixed-width></fa>
                    </gen-button>
                </gen-tooltip>
                <el-divider direction="vertical"></el-divider>
                <gen-button @click.prevent="cancel()" size="small">{{ $t('Cancel') }}</gen-button>
                <el-button type="primary" @click.prevent="submitForm()" size="small">{{
                    $t('Save')
                }}</el-button>
            </template>
        </navbar>
        <div class="main-content">
            <el-form v-if="wipPreferences" label-width="300px" ref="form" :model="wipPreferences">
                <h3>{{ $t('General') }}</h3>
                <el-form-item :label="$t('Language')">
                    <enum-autocomplete
                        :stringValue.sync="wipPreferences.jsonPreferences.lang"
                        :optionList="langList"
                    />
                </el-form-item>
                <el-form-item :label="$t('Default currency')">
                    <currency-autocomplete
                        :object.sync="wipPreferences.preferedCurrency"
                        :optionList="c_currencyList"
                        :key="componentKey"
                    />
                </el-form-item>
                <el-form-item :label="$t('Extended Sidebar')">
                    <el-switch v-model="wipPreferences.jsonPreferences.sidebarIsOpen"></el-switch>
                </el-form-item>
                <h3>{{ $t('Home page') }}</h3>
                <el-form-item :label="$t('Show top 10 accounts per type by default')">
                    <el-switch v-model="wipPreferences.jsonPreferences.showTopTen"></el-switch>
                </el-form-item>
                <el-form-item :label="$t('Invert income and expense values')">
                    <el-switch v-model="wipPreferences.jsonPreferences.invertIncAndExp"></el-switch>
                </el-form-item>
                <h3>{{ $t('Internal and external accounts pages') }}</h3>
                <el-form-item :label="$t('Only show active accounts by default')">
                    <el-switch
                        v-model="wipPreferences.jsonPreferences.showActiveAccountOnly"
                    ></el-switch>
                </el-form-item>
                <el-form-item :label="$t('Group transactions by folder by default')">
                    <el-switch
                        v-model="wipPreferences.jsonPreferences.groupByParentAccounts"
                    ></el-switch>
                </el-form-item>
            </el-form>
        </div>
        <el-dialog :title="$t('Import external database file')" :visible.sync="d_dialogVisible">
            <el-form ref="form" label-width="120px">
                <el-form-item :label="$t('File')">
                    <el-upload
                        drag
                        action="http://localhost/"
                        :on-change="handleChange"
                        :before-remove="handleRemove"
                        :file-list="uploadedFileList"
                        :list-type="'text'"
                        :multiple="false"
                        :auto-upload="false"
                        :accept="c_acceptedFormat"
                    >
                        <i class="el-icon-upload"></i>
                        <div class="el-upload__text">
                            {{ $t('Drop file here or') }}
                            <em>{{ $t('click to upload') }}</em>
                        </div>
                        <div class="el-upload__tip" slot="tip">{{ $t('sqlite files') }}</div>
                    </el-upload>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="d_dialogVisible = false">{{ $t('Cancel') }}</el-button>
                <el-button
                    @click.prevent="importDatabase()"
                    type="primary"
                    :disabled="uploadedFileList.length === 0"
                    >{{ $t('Import') }}</el-button
                >
            </span>
        </el-dialog>
        <el-dialog
            :title="$t('Delete current database file')"
            :visible.sync="d_deleteDialogVisible"
        >
            <el-form ref="form" label-width="120px"> </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="d_deleteDialogVisible = false">{{ $t('Cancel') }}</el-button>
                <el-button @click.prevent="deleteDatabase()" type="primary">{{
                    $t('Delete')
                }}</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import _ from 'lodash';
import Navbar from '../../components/Navbar.vue';
import CurrencyAutocomplete from '../currency/CurrencyAutocomplete.vue';
import CashPreferences from '../../backend/database/entity/CashPreferences';
import Container from 'typedi';
import { DatabaseManager } from '../../backend/database/DatabaseManager';
import GenButton from '../../components/GenButton.vue';
import GenTooltip from '../../components/GenTooltip.vue';
import EnumAutocomplete from '../../components/EnumAutocomplete.vue';

export default Vue.extend({
    name: 'rate-page',
    components: {
        Navbar,
        CurrencyAutocomplete,
        GenButton,
        GenTooltip,
        EnumAutocomplete,
    },
    async created(this: any) {
        await this.$store.dispatch('App/fillPreferences');
        this.wipPreferences = _.cloneDeep(this.$store.state.App.preferences);
    },
    data(this: any) {
        return {
            wipPreferences: null as CashPreferences | null,
            d_dialogVisible: false,
            d_deleteDialogVisible: false,
            uploadedFileList: [],
            componentKey: 0,
            langList: ['en', 'fr'].map((item) => {
                return { value: item, label: this.$t(item) };
            }),
        };
    },
    computed: {
        c_currencyList(this: any) {
            return this.$store.state.PermanentData.currencyList;
        },
        c_acceptedFormat() {
            return '.sqlite';
        },
    },
    watch: {},
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
            await this.$store.dispatch('App/savePreferences', _.cloneDeep(this.wipPreferences));
        },
        async cancel(this: any) {
            this.wipPreferences = _.cloneDeep(this.$store.state.App.preferences);
            this.componentKey++;
        },
        async exportDatabase(this: any) {
            const databaseManager = Container.get(DatabaseManager);
            databaseManager.downloadDatabaseFile();
        },
        async importDatabase(this: any) {
            this.$confirm(
                'This will permanently override your current data (Transactions, Accounts, etc...). Continue?',
                'Warning',
                {
                    confirmButtonText: 'OK',
                    cancelButtonText: 'Cancel',
                    type: 'warning',
                },
            )
                .then(() => {
                    const databaseManager = Container.get(DatabaseManager);
                    if (this.uploadedFileList.length > 0) {
                        databaseManager.importDatabaseFile(this.uploadedFileList[0]);
                    }
                })
                .catch(() => {
                    this.d_dialogVisible = false;
                });
        },
        async deleteDatabase(this: any) {
            this.$confirm(
                'This will permanently delete your current data (Transactions, Accounts, etc...). Continue?',
                'Warning',
                {
                    confirmButtonText: 'OK',
                    cancelButtonText: 'Cancel',
                    type: 'warning',
                },
            )
                .then(() => {
                    const databaseManager = Container.get(DatabaseManager);
                    databaseManager.deleteDatabase();
                })
                .catch(() => {
                    this.d_deleteDialogVisible = false;
                });
        },
        handleChange(this: any, file: File) {
            if (file) {
                this.uploadedFileList = [file];
            } else {
                this.uploadedFileList = [];
            }
        },
        handleRemove(this: any, file: File) {
            this.uploadedFileList = [];
            return true;
        },
    },
});
</script>

<style lang="scss" scoped>
.title {
    color: #606266;
}
h3 {
    color: #606266;
    border-bottom: 1px solid rgb(189, 192, 199);
    padding-bottom: 6px;
    padding-left: 5px;
}
</style>
