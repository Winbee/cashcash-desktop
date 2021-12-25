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
                    :routeAfterUpdate="'import-config-page'"
                    :placeholder="$t('Import configs')"
                />
            </template>
            <template slot="second-line-left">
                <gen-tooltip :content="$t('Try config')">
                    <gen-button circle @click="uploadFile()" size="small">
                        <fa icon="flask" fixed-width></fa>
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
            <el-form v-if="wipImportConfig" ref="form" :model="wipImportConfig" label-width="120px">
                <import-config-edit-component :wipImportConfig="wipImportConfig" />
            </el-form>
        </div>
        <el-dialog
            :title="$t('Upload test file')"
            v-if="d_uploadDialogVisible"
            :visible.sync="d_uploadDialogVisible"
            width="400px"
        >
            <el-form ref="uploadForm">
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
            <span slot="footer" class="dialog-footer">
                <gen-button @click="d_uploadDialogVisible = false">{{ $t('Cancel') }}</gen-button>
                <el-button
                    type="primary"
                    :disabled="this.uploadedFileList.length === 0"
                    @click="test()"
                    >{{ $t('Test') }}</el-button
                >
            </span>
        </el-dialog>
        <el-dialog
            :title="$t('Test result')"
            v-if="d_testResultDialogVisible"
            :visible.sync="d_testResultDialogVisible"
            width="70%"
        >
            <h3>{{ $t('Parsed line') }}</h3>
            <el-table
                v-if="testParsedCsvData && testParsedCsvData.length > 0"
                :data="
                    testParsedCsvData[0].map((item, index) => {
                        return { columnNumber: index + 1, columnValue: item };
                    })
                "
                stripe
                border
                style="width: 100%"
            >
                <el-table-column
                    prop="columnNumber"
                    :label="$t('Column number')"
                    width="100"
                ></el-table-column>
                <el-table-column prop="columnValue" :label="$t('Column value')"></el-table-column>
            </el-table>
            <div v-else>
                {{ $t('Error.dot.dot.dot') }}
            </div>
            <h3>{{ $t('Mapped transaction') }}</h3>
            <el-card v-if="testTransactionList.length > 0" class="box-card">
                <el-form ref="transactionForm" label-width="120px">
                    <transaction-edit-component :wipTransaction="testTransactionList[0]" />
                </el-form>
            </el-card>
            <div v-else>
                {{ $t('Error.dot.dot.dot') }}
            </div>
            <h3 v-if="testErrorList.length > 0">{{ $t('Error details') }}</h3>
            <error-page v-if="testErrorList.length > 0" :errorList="testErrorList" />

            <span slot="footer" class="dialog-footer">
                <el-button type="primary" @click="d_testResultDialogVisible = false">{{
                    $t('Close')
                }}</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import _ from 'lodash';
import ImportConfigEditComponent from './ImportConfigEditComponent.vue';
import CashImportConfig from '../../../backend/database/entity/CashImportConfig';
import Navbar from '../../../components/Navbar.vue';
import GenericParameters from '../../../components/genericparameters/GenericParameters.vue';
import GenButton from '../../../components/GenButton.vue';
import GenTooltip from '../../../components/GenTooltip.vue';
import Container from 'typedi';
import CashImportService from '../../../backend/service/CashImportService';
import CashAccount from '../../../backend/database/entity/CashAccount';
import Papa from 'papaparse';
import TransactionEditComponent from '../../transaction/TransactionEditComponent.vue';
import ErrorPage from '../../ErrorPage.vue';
import VueScrollTo from 'vue-scrollto';
import CashError from '../../../backend/service/dto/CashError';
import ParseResult from '../../../backend/service/dto/ParseResult';
import CashImportType from '../../../backend/database/entity/enumeration/CashImportType';

export default Vue.extend({
    name: 'import-config-edit-page',
    components: {
        ImportConfigEditComponent,
        Navbar,
        GenericParameters,
        GenButton,
        GenTooltip,
        TransactionEditComponent,
        ErrorPage,
    },
    data() {
        const fakeAccount = new CashAccount({
            name: 'fakeAccount',
        });
        return {
            wipImportConfig: null as CashImportConfig | null,
            d_uploadDialogVisible: false,
            d_testResultDialogVisible: false,
            fakeAccount,
            uploadedFileList: [],
            testTransactionList: [],
            testParsedCsvData: null,
            testErrorList: [],
        };
    },
    computed: {
        c_parameters(this: any) {
            return this.$store.state.ImportConfig.parameters;
        },
        c_accountMap(this: any) {
            return this.$store.state.PermanentData.accountMap;
        },
        c_tagMap(this: any) {
            return this.$store.getters['PermanentData/tagMap'];
        },
        c_uploadLabel(this: any) {
            if (
                this.wipImportConfig &&
                this.wipImportConfig.jsonConfig.parsing.type === CashImportType.SPREADSHEET
            ) {
                return '"xls", "xlsx", "ods"' + this.$t('files');
            } else {
                return '"csv"' + this.$t('files');
            }
        },
        c_acceptedFormat() {
            if (
                this.wipImportConfig &&
                this.wipImportConfig.jsonConfig.parsing.type === CashImportType.SPREADSHEET
            ) {
                return '.xls,.xlsx,.ods,application/vnd.oasis.opendocument.spreadsheet,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel';
            } else {
                return '.csv,text/csv';
            }
        },
    },
    methods: {
        async uploadFile(this: any) {
            const isValid = await this.validateForm();
            if (isValid) {
                this.d_testResultDialogVisible = false;
                this.d_uploadDialogVisible = true;
            }
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
        async test(this: any, file: File) {
            const isValid = await this.validateForm();
            if (isValid) {
                this.d_uploadDialogVisible = false;
                this.d_testResultDialogVisible = true;
                this.testTransactionList = [];
                this.testErrorList = [];
                this.testParsedCsvData = null;
                this.createParsedCsv();
            }
        },
        async createParsedCsv(this: any) {
            if (this.uploadedFileList.length > 0) {
                const cashImportService = Container.get(CashImportService);
                const parsingConfig = this.wipImportConfig.jsonConfig.parsing;
                const parsedCsv: ParseResult = await cashImportService.parseFileToArray(
                    this.uploadedFileList[0] as any,
                    parsingConfig,
                );
                if (parsedCsv.errors.length > 0) {
                    const convertedError = parsedCsv.errors.map((error) => {
                        const message =
                            this.$t('Error during parsing on row ') +
                            error.row +
                            ': ' +
                            error.message;
                        return new CashError(`${error.code}: ${message}`);
                    });
                    this.testErrorList.push(...convertedError);
                } else {
                    if (parsingConfig.header) {
                        this.testParsedCsvData = parsedCsv.data.slice(1);
                    } else {
                        this.testParsedCsvData = parsedCsv.data;
                    }
                    this.importTransaction(parsedCsv);
                }
            }
        },
        async importTransaction(this: any, parsedCsv: Papa.ParseResult) {
            const cashImportService = Container.get(CashImportService);
            try {
                const transactionList = await cashImportService.convertCsvToTransaction(
                    parsedCsv,
                    this.wipImportConfig,
                    this.fakeAccount,
                    this.c_accountMap,
                    this.c_tagMap,
                    true,
                );
                this.testTransactionList = transactionList;
            } catch (e) {
                this.testErrorList.push(
                    new CashError(this.$t('Error during mapping') + ': ' + e.message),
                );
            }
        },
        async validateForm(this: any): Promise<boolean> {
            return await new Promise((resolve, reject) => {
                this.$refs['form'].validate((valid, errorObject) => {
                    if (valid) {
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
        async submitForm(this: any) {
            const isValid = await this.validateForm();
            if (isValid) {
                this.save();
            }
        },
        async save(this: any) {
            const property = this.wipImportConfig.jsonConfig.converting.property;
            if (property.description && property.description.extra.length === 0) {
                property.description = {
                    extra: [],
                };
            }
            if (property.detail && property.detail.extra.length === 0) {
                property.detail = {
                    extra: [],
                };
            }
            if (property.importId && !property.importId.index) {
                property.importId = undefined;
            }
            if (property.account && !property.account.index) {
                property.account = undefined;
            }
            if (property.transactionDate && !property.transactionDate.index) {
                property.transactionDate = undefined;
            }
            if (property.amount && !property.amount.index) {
                property.amount = undefined;
            }
            if (property.currency && !property.currency.mode) {
                property.currency = undefined;
            }
            await this.$store.dispatch('ImportConfig/saveImportConfig', this.wipImportConfig);
            this.$router.push({ name: 'import-config-page' });
        },
        async cancel(this: any) {
            this.$router.go(-1);
        },
    },
    async created(this: any) {
        const importConfigId = this.$route.params.importConfigId;
        const duplicate = this.$route.params.duplicate;
        await this.$store.dispatch('ImportConfig/initWipImportConfig', {
            importConfigId,
            duplicate,
        });
        this.wipImportConfig = _.cloneDeep(this.$store.state.ImportConfig.wipImportConfig);
        if (!this.wipImportConfig.jsonConfig.parsing.encoding) {
            this.wipImportConfig.jsonConfig.parsing.encoding = '';
        }
    },
});
</script>
<style lang="scss" scoped>
h3 {
    color: #606266;
    border-bottom: 1px solid rgb(189, 192, 199);
    padding-bottom: 6px;
    padding-left: 5px;
}
</style>
