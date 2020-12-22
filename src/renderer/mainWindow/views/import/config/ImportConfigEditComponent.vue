<template>
    <div>
        <el-form-item :label="$t('Name')" prop="name" :rules="rules.name">
            <el-input
                v-model="d_wipImportConfig.name"
                v-autosize="d_wipImportConfig.name"
                size="small"
            ></el-input>
        </el-form-item>
        <h3>{{ $t('Parsing') }}</h3>
        <el-form-item :label="$t('Type')" prop="jsonConfig.parsing.type" :rules="rules.type">
            <enum-autocomplete
                :stringValue.sync="d_wipImportConfig.jsonConfig.parsing.type"
                :optionList="parsingTypeList"
            />
        </el-form-item>
        <el-form-item
            v-if="c_isCsv"
            :label="$t('Encoding')"
            prop="jsonConfig.parsing.encoding"
            :rules="rules.encoding"
        >
            <el-radio-group v-model="hasEncoding" size="small" @change="updateEncoding">
                <el-radio-button :label="false">{{ $t('Default') }}</el-radio-button>
                <el-radio-button :label="true">{{ $t('Custom') }}</el-radio-button>
            </el-radio-group>
            <enum-autocomplete
                v-if="hasEncoding"
                :stringValue.sync="d_wipImportConfig.jsonConfig.parsing.encoding"
                :optionList="encodingTypeList"
            />
        </el-form-item>
        <el-form-item
            v-if="c_isCsv"
            :label="$t('Delimiter')"
            prop="jsonConfig.parsing.delimiter"
            :rules="rules.delimiter"
        >
            <enum-autocomplete
                :stringValue.sync="d_wipImportConfig.jsonConfig.parsing.delimiter"
                :optionList="delimiterList"
            />
        </el-form-item>
        <el-form-item
            v-if="c_isCsv"
            :label="$t('New line')"
            prop="jsonConfig.parsing.newline"
            :rules="rules.newLine"
        >
            <enum-autocomplete
                :stringValue.sync="d_wipImportConfig.jsonConfig.parsing.newline"
                :optionList="newLineList"
            />
        </el-form-item>
        <el-form-item
            v-if="c_isCsv"
            :label="$t('Quote char')"
            prop="jsonConfig.parsing.quoteChar"
            :rules="rules.quoteChar"
        >
            <enum-autocomplete
                :stringValue.sync="d_wipImportConfig.jsonConfig.parsing.quoteChar"
                :optionList="quoteCharList"
            />
        </el-form-item>
        <el-form-item
            v-if="c_isCsv"
            :label="$t('Has comment')"
            prop="jsonConfig.parsing.comment"
            :rules="rules.comment"
        >
            <el-switch v-model="d_wipImportConfig.jsonConfig.parsing.comment" />
        </el-form-item>
        <el-form-item
            v-if="c_isCsv"
            :label="$t('Skip empty line')"
            prop="jsonConfig.parsing.skipEmptyLines"
            :rules="rules.skipEmptyLines"
        >
            <el-switch v-model="d_wipImportConfig.jsonConfig.parsing.skipEmptyLines" />
        </el-form-item>
        <el-form-item
            :label="$t('Has header')"
            prop="jsonConfig.parsing.header"
            :rules="rules.header"
        >
            <el-switch v-model="d_wipImportConfig.jsonConfig.parsing.header" />
        </el-form-item>

        <h3>{{ $t('Mapping') }}</h3>
        <complex-form-item :label="$t('Description')">
            <div class="inside-item">
                <transition-group name="flip-list" tag="div">
                    <import-config-extra-component
                        v-for="(item, index) in d_wipImportConfig.jsonConfig.converting.property
                            .description.extra"
                        :key="'description-' + item.randomId"
                        :itemObject="item"
                        :index="index"
                        :propertyName="'description'"
                        :removable="c_description.extra.length > 1"
                        :upable="index > 0"
                        :downable="index < c_description.extra.length - 1"
                        @remove="removeSubConfig('description', index)"
                        @moveUp="moveUpSubConfig('description', index)"
                        @moveDown="moveDownSubConfig('description', index)"
                    />
                </transition-group>
            </div>
            <div class="button-wrapper">
                <el-button @click="addSubConfig('description')" class="item" size="mini">
                    <fa icon="plus" fixed-width></fa>
                </el-button>
            </div>
        </complex-form-item>

        <complex-form-item :label="$t('Detail')">
            <div class="inside-item">
                <transition-group name="flip-list" tag="div">
                    <import-config-extra-component
                        v-for="(item, index) in d_wipImportConfig.jsonConfig.converting.property
                            .detail.extra"
                        :key="'detail-' + item.randomId"
                        :itemObject="item"
                        :index="index"
                        :propertyName="'detail'"
                        :removable="true"
                        :upable="index > 0"
                        :downable="index < c_detail.extra.length - 1"
                        @remove="removeSubConfig('detail', index)"
                        @moveUp="moveUpSubConfig('detail', index)"
                        @moveDown="moveDownSubConfig('detail', index)"
                    />
                </transition-group>
            </div>
            <div class="button-wrapper">
                <el-button @click="addSubConfig('detail')" class="item" size="mini">
                    <fa icon="plus" fixed-width></fa>
                </el-button>
            </div>
        </complex-form-item>

        <complex-form-item :label="$t('Transaction Date')" :withBackground="true">
            <el-form-item
                :label="$t('Column')"
                prop="jsonConfig.converting.property.transactionDate.index"
                :rules="rules.index"
            >
                <el-input-number
                    v-model="d_wipImportConfig.jsonConfig.converting.property.transactionDate.index"
                    controls-position="right"
                    :min="1"
                    size="small"
                />
            </el-form-item>
            <el-form-item
                :label="$t('Format')"
                prop="jsonConfig.converting.property.transactionDate.format"
                :rules="rules.dateFormat"
            >
                <el-input
                    v-model="
                        d_wipImportConfig.jsonConfig.converting.property.transactionDate.format
                    "
                    v-autosize="
                        d_wipImportConfig.jsonConfig.converting.property.transactionDate.format
                    "
                    size="small"
                ></el-input>
            </el-form-item>
            <div class="collapsable-help">
                <el-collapse>
                    <el-collapse-item :title="$t('Help on the format')" name="1">
                        <date-format-doc></date-format-doc>
                    </el-collapse-item>
                </el-collapse>
            </div>
        </complex-form-item>
        <complex-form-item :label="$t('Amount value')" :withBackground="true">
            <el-form-item
                :label="$t('Column')"
                prop="jsonConfig.converting.property.amount.index"
                :rules="rules.index"
            >
                <el-input-number
                    v-model="d_wipImportConfig.jsonConfig.converting.property.amount.index"
                    controls-position="right"
                    :min="1"
                    size="small"
                />
            </el-form-item>
            <el-form-item
                :label="$t('Decimal symbol')"
                prop="jsonConfig.converting.property.amount.decimalSeparator"
            >
                <enum-autocomplete
                    :stringValue.sync="
                        d_wipImportConfig.jsonConfig.converting.property.amount.decimalSeparator
                    "
                    :optionList="decimalSepartorList"
                />
            </el-form-item>
        </complex-form-item>
        <complex-form-item :label="$t('Currency')" :withBackground="true">
            <el-form-item
                :label="$t('Column')"
                prop="jsonConfig.converting.property.currency.index"
                :rules="rules.index"
            >
                <el-input-number
                    v-model="d_wipImportConfig.jsonConfig.converting.property.currency.index"
                    controls-position="right"
                    :min="1"
                    size="small"
                />
            </el-form-item>
            <el-form-item
                :label="$t('Format')"
                prop="jsonConfig.converting.property.currency.format"
                :rules="rules.currencyFormat"
            >
                <enum-autocomplete
                    :stringValue.sync="
                        d_wipImportConfig.jsonConfig.converting.property.currency.format
                    "
                    :optionList="currencyTypeList"
                />
            </el-form-item>
        </complex-form-item>
        <complex-form-item :label="$t('ImportId')">
            <el-switch
                class="inside-switch"
                v-model="toggle.importId"
                @change="(value) => toggleProp(value, 'importId')"
            />
            <div class="inside-item" v-if="toggle.importId">
                <el-form-item
                    :label="$t('Column')"
                    prop="jsonConfig.converting.property.importId.index"
                    :rules="rules.index"
                >
                    <el-input-number
                        v-model="d_wipImportConfig.jsonConfig.converting.property.importId.index"
                        controls-position="right"
                        :min="1"
                        size="small"
                    />
                </el-form-item>
            </div>
        </complex-form-item>
        <h3>{{ $t('Extra') }}</h3>
        <el-form-item :label="$t('Detect imported')" prop="jsonConfig.extra.detectAlreadyImported">
            <el-switch v-model="d_wipImportConfig.jsonConfig.extra.detectAlreadyImported" />
        </el-form-item>
        <el-form-item v-if="d_wipImportConfig.createdDate" :label="$t('Created at')">
            <div>{{ formatDate(d_wipImportConfig.createdDate) }}</div>
        </el-form-item>
        <el-form-item v-if="d_wipImportConfig.updatedDate" :label="$t('Updated at')">
            <div>{{ formatDate(d_wipImportConfig.updatedDate) }}</div>
        </el-form-item>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import CashImportConfig from '../../../backend/database/entity/CashImportConfig';
import EnumAutocomplete from '../../../components/EnumAutocomplete.vue';
import CashImportCurrencyType from '../../../backend/database/entity/enumeration/CashImportCurrencyType';
import CashImportAccountType from '../../../backend/database/entity/enumeration/CashImportAccountType';
import ImportConfigExtraComponent from './ImportConfigExtraComponent.vue';
import EncodingUtils from '../../../backend/utils/EncodingUtils';
import ExtraDescription from '../../../backend/database/entity/proxy/ExtraDescription';
import GenButton from '../../../components/GenButton.vue';
import ComplexFormItem from '../../../components/ComplexFormItem.vue';
import DateFormatDoc from './DateFormatDoc.vue';
import PrintUtils from '../../../backend/utils/PrintUtils';
import DateUtils from '../../../backend/utils/DateUtils';
import CashImportType from '../../../backend/database/entity/enumeration/CashImportType';

export default Vue.extend({
    name: 'import-config-edit-component',
    components: {
        EnumAutocomplete,
        ImportConfigExtraComponent,
        GenButton,
        ComplexFormItem,
        DateFormatDoc,
    },
    props: {
        wipImportConfig: {
            type: Object as () => CashImportConfig,
            required: true,
        },
    },
    data(this: any) {
        const checkEncoding = (rule, value, callback, source) => {
            value = this.d_wipImportConfig.jsonConfig.parsing.encoding;
            if (!this.hasEncoding) {
                callback();
            } else if (!value) {
                callback(new Error(this.$t('Please define an encoding')));
            } else {
                callback();
            }
        };
        return {
            d_wipImportConfig: this.wipImportConfig,
            encodingTypeList: EncodingUtils.getEncodingLabelList(),
            quoteCharList: ["'", '"', '`'].map((item) => {
                return { value: item, label: item };
            }),
            delimiterList: [',', ';', ':', 'auto-detect'].map((item) => {
                return { value: item, label: item };
            }),
            parsingTypeList: Object.keys(CashImportType).map((item) => {
                return { value: item, label: this.$t(item) };
            }),
            newLineList: ['\\n', '\\r', '\\r\\n', 'auto-detect'].map((item) => {
                return { value: item, label: item };
            }),
            decimalSepartorList: ['.', ',', 'auto-detect'].map((item) => {
                return { value: item, label: item };
            }),
            currencyTypeList: Object.keys(CashImportCurrencyType).map((item) => {
                return { value: item, label: this.$t(item) };
            }),
            hasEncoding: !!this.wipImportConfig.jsonConfig.parsing.encoding,
            toggle: {
                importId: !!this.wipImportConfig.jsonConfig.converting.property.importId,
                description: true,
                detail: true,
                account: !!this.wipImportConfig.jsonConfig.converting.property.account,
                transactionDate: true,
                amount: true,
                currency: true,
            },
            rules: {
                name: [
                    {
                        type: 'string',
                        whitespace: true,
                        message: this.$t('Whitespace only is not possible'),
                        trigger: 'blur',
                    },
                    {
                        min: 3,
                        max: 20,
                        message: this.$t('Length should be between 3 and 20'),
                        trigger: 'blur',
                    },
                    {
                        type: 'string',
                        required: true,
                        message: this.$t('Please define a name'),
                        trigger: 'blur',
                    },
                ],
                type: [
                    {
                        type: 'string',
                        required: true,
                        message: this.$t('Please select a type'),
                        trigger: 'blur',
                    },
                ],
                encoding: [{ validator: checkEncoding, trigger: 'blur' }],
                delimiter: [
                    {
                        type: 'string',
                        required: true,
                        message: this.$t('Please define a delimiter'),
                        trigger: 'blur',
                    },
                ],
                newLine: [
                    {
                        type: 'string',
                        required: true,
                        message: this.$t('Please define a new line'),
                        trigger: 'blur',
                    },
                ],
                quoteChar: [
                    {
                        type: 'string',
                        required: true,
                        message: this.$t('Please define a quote char'),
                        trigger: 'blur',
                    },
                ],
                comment: [{ type: 'boolean', required: true, trigger: 'blur' }],
                skipEmptyLines: [{ type: 'boolean', required: true, trigger: 'blur' }],
                header: [{ type: 'boolean', required: true, trigger: 'blur' }],
                index: [
                    {
                        type: 'number',
                        required: true,
                        message: this.$t('Please define an index'),
                        trigger: 'blur',
                    },
                ],
                dateFormat: [
                    {
                        type: 'string',
                        required: true,
                        message: this.$t('Please define a format'),
                        trigger: 'blur',
                    },
                ],
                currencyFormat: [
                    {
                        type: 'string',
                        required: true,
                        message: this.$t('Please define a currency format'),
                        trigger: 'blur',
                    },
                ],
            },
        };
    },
    computed: {
        c_description(): { extra: ExtraDescription[] } {
            return this.d_wipImportConfig.jsonConfig.converting.property.description;
        },
        c_detail(): { extra: ExtraDescription[] } {
            return this.d_wipImportConfig.jsonConfig.converting.property.detail;
        },
        c_isCsv(): boolean {
            return this.d_wipImportConfig.jsonConfig.parsing.type === CashImportType.CSV;
        },
    },
    methods: {
        updateEncoding(hasEncoding) {
            if (!hasEncoding) {
                this.d_wipImportConfig.jsonConfig.parsing.encoding = '';
            }
        },
        addSubConfig(propertyName: 'detail' | 'description') {
            const list = this.d_wipImportConfig.jsonConfig.converting.property[propertyName].extra;
            const randomId = Math.random();
            list.push({ randomId });
        },
        removeSubConfig(propertyName: 'detail' | 'description', index: number) {
            this.d_wipImportConfig.jsonConfig.converting.property[propertyName].extra.splice(
                index,
                1,
            );
        },
        moveUpSubConfig(propertyName: 'detail' | 'description', index: number) {
            const list = this.d_wipImportConfig.jsonConfig.converting.property[propertyName].extra;
            list.splice(index - 1, 0, list.splice(index, 1)[0]);
        },
        moveDownSubConfig(propertyName: 'detail' | 'description', index: number) {
            const list = this.d_wipImportConfig.jsonConfig.converting.property[propertyName].extra;
            list.splice(index + 1, 0, list.splice(index, 1)[0]);
        },
        toggleProp(this: any, activate: boolean, propertyName: string) {
            const property = this.d_wipImportConfig.jsonConfig.converting.property;
            if (activate) {
                if (propertyName === 'description' || propertyName === 'detail') {
                    this.$set(property, propertyName, { extra: [] });
                } else {
                    this.$set(property, propertyName, {});
                }
            } else {
                property[propertyName] = undefined;
            }
        },
        formatDate(this: any, dateObj: Date): string {
            return DateUtils.formatHumanDate(dateObj);
        },
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
.flip-list-move {
    transition: transform 1s;
}
.flip-list-enter-active,
.flip-list-leave-active {
    transition: opacity 0.5s;
}
.flip-list-enter,
.flip-list-leave-to {
    opacity: 0;
}
.inside-item {
    background-color: #f0f3f7;
    border-radius: 3px;
}

.button-wrapper {
    padding-top: 6px;
}

.complex-form-item {
    margin-bottom: 24px;
}

.inside-switch {
    margin-top: 11px;
    margin-bottom: 4px;
}

.collapsable-help {
    margin: 9px;
    padding: 0px 10px;
    background-color: #ffffff;
}
</style>
