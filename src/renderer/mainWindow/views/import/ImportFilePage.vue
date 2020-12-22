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
                    @click.prevent="cancel()"
                    size="small"
                    :disabled="$wait.waiting(waitType)"
                    >{{ $t('Cancel') }}</gen-button
                >
                <el-button
                    type="primary"
                    @click.prevent="createParsedCsv()"
                    size="small"
                    :disabled="$wait.waiting(waitType) || !c_formIsCompleted"
                    >{{ $t('Next') }}</el-button
                >
            </template>
        </navbar>
        <div class="main-content">
            <v-wait :for="waitType">
                <template slot="waiting">
                    <div class="cash-loading-percent">
                        <el-progress type="circle" :percentage="c_progress"></el-progress>
                    </div>
                </template>
                <el-form ref="form" label-width="120px">
                    <el-form-item :label="$t('Import config')">
                        <import-config-autocomplete
                            :model.sync="selectedImportConfig"
                            :optionList="c_importConfigList"
                            v-if="c_importConfigList && c_importConfigList.length > 0"
                        />
                        <div v-else>
                            {{ $t('None available') }}
                            <gen-tooltip :content="$t('New config')">
                                <gen-button circle size="small" @click="goto('/import-config/new')">
                                    <fa icon="plus" fixed-width></fa>
                                </gen-button>
                            </gen-tooltip>
                        </div>
                    </el-form-item>
                    <el-form-item :label="$t('Account')">
                        <account-autocomplete
                            :object.sync="selectedAccount"
                            :optionList="c_accountList"
                        />
                    </el-form-item>
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
                            <div class="el-upload__tip" slot="tip">{{ c_uploadLabel }}</div>
                        </el-upload>
                    </el-form-item>
                </el-form>
            </v-wait>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Papa from 'papaparse';
import ImportConfigAutocomplete from './ImportConfigAutocomplete.vue';
import AccountAutocomplete from '../account/AccountAutocomplete.vue';
import CashImportConfig from '../../backend/database/entity/CashImportConfig';
import CashAccount from '../../backend/database/entity/CashAccount';
import CashAccountUtils from '../../backend/utils/CashAccountUtils';
import Navbar from '../../components/Navbar.vue';
import GenericParameters from '../../components/genericparameters/GenericParameters.vue';
import GenButton from '../../components/GenButton.vue';
import GenTooltip from '../../components/GenTooltip.vue';
import WaitType from '../../backend/database/entity/enumeration/WaitType';
import Container from 'typedi';
import CashImportService from '../../backend/service/CashImportService';
import ParseResult from '../../backend/service/dto/ParseResult';
import CashImportType from '../../backend/database/entity/enumeration/CashImportType';

export default Vue.extend({
    name: 'import-file-page',
    components: {
        ImportConfigAutocomplete,
        AccountAutocomplete,
        Navbar,
        GenericParameters,
        GenButton,
        GenTooltip,
    },
    data() {
        return {
            selectedImportConfig: null,
            uploadedFileList: [],
            selectedAccount: null,
            waitType: WaitType.IMPORT_FILE_CONVERT_CSV,
        };
    },
    computed: {
        c_accountList(this: any): CashAccount[] {
            return this.$store.getters['PermanentData/leafAccountList'].filter((a) =>
                CashAccountUtils.isInternal(a),
            );
        },
        c_parameters(this: any) {
            return this.$store.state.ImportConfig.parameters;
        },
        c_progress(this: any): number {
            return this.$store.state.ImportFile.progress;
        },
        c_uploadLabel(this: any) {
            if (
                this.selectedImportConfig &&
                (this.selectedImportConfig as any).jsonConfig.parsing.type ===
                    CashImportType.SPREADSHEET
            ) {
                return '"xls", "xlsx", "ods"' + this.$t('files');
            } else {
                return '"csv"' + this.$t('files');
            }
        },
        c_acceptedFormat() {
            if (
                this.selectedImportConfig &&
                (this.selectedImportConfig as any).jsonConfig.parsing.type ===
                    CashImportType.SPREADSHEET
            ) {
                return '.xls,.xlsx,.ods,application/vnd.oasis.opendocument.spreadsheet,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel';
            } else {
                return '.csv,text/csv';
            }
        },
        c_formIsCompleted(this: any) {
            return (
                this.uploadedFileList.length > 0 &&
                this.selectedImportConfig &&
                this.selectedAccount
            );
        },
        c_importConfigList(this: any) {
            return this.$store.state.ImportFile.importConfigList;
        },
    },
    methods: {
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
        async createParsedCsv(this: any) {
            await this.$store.dispatch('ImportFile/saveFileName', this.uploadedFileList[0].name);
            if (this.uploadedFileList.length > 0) {
                const cashImportService = Container.get(CashImportService);
                const parsingConfig = this.selectedImportConfig.jsonConfig.parsing;
                const parsedCsv: ParseResult = await cashImportService.parseFileToArray(
                    this.uploadedFileList[0] as any,
                    parsingConfig,
                );
                if (parsedCsv.errors.length > 0) {
                    this.$message({
                        type: 'error',
                        message:
                            'Error during parsing: ' +
                            parsedCsv.errors.map((error) => error.message).join('.'),
                    });
                } else {
                    this.importTransaction(parsedCsv);
                }
            }
        },
        async importTransaction(this: any, parsedCsv: ParseResult) {
            this.$wait.start(WaitType.IMPORT_FILE_CONVERT_CSV);
            try {
                await this.$store.dispatch(
                    'ImportFile/saveSelectedImportConfig',
                    this.selectedImportConfig,
                );
                await this.$store.dispatch('ImportFile/saveParsedCsv', parsedCsv);
                await this.$store.dispatch('ImportFile/saveSelectedAccount', this.selectedAccount);
                await this.$store.dispatch('ImportFile/convertCsvToTransaction');
                this.$router.push({ name: 'import-transaction-page' });
            } finally {
                this.$wait.end(WaitType.IMPORT_FILE_CONVERT_CSV);
            }
        },
        goto(this: any, path: string) {
            this.$router.push({ path });
        },
        async cancel(this: any) {
            this.$router.push({ name: 'transaction-page' });
        },
    },
    async created(this: any) {
        const importConfig = this.$route.params.importConfig;
        if (importConfig) {
            this.selectedImportConfig = importConfig;
        }
    },
    async beforeCreate(this: any) {
        await this.$store.dispatch('ImportFile/clear');
    },
});
</script>
