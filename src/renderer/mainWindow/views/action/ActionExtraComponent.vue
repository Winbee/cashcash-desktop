<template>
    <div :class="{ 'action-extra-component': true, 'not-first': index !== 0 }">
        <div>
            <span class="index-info">{{ index + 1 }}</span>
            <gen-button circle @click="remove()" class="item" :disabled="!removable" size="small">
                <fa icon="trash" fixed-width></fa>
            </gen-button>
            <gen-button circle @click="moveUp()" class="item" :disabled="!upable" size="small">
                <fa icon="chevron-up" fixed-width></fa>
            </gen-button>
            <gen-button circle @click="moveDown()" class="item" :disabled="!downable" size="small">
                <fa icon="chevron-down" fixed-width></fa>
            </gen-button>
        </div>
        <el-form-item
            :label="$t('Field name')"
            :prop="'action.jsonActionList.' + index + '.fieldName'"
            :rules="rules.fieldName"
        >
            <enum-autocomplete
                :stringValue.sync="d_itemObject.fieldName"
                :optionList="c_fieldNameList"
                @update:stringValue="updateParameter()"
            />
        </el-form-item>
        <el-form-item v-if="d_itemObject.fieldName" :label="$t('Action')">{{
            $t('is assigned to')
        }}</el-form-item>
        <el-form-item
            v-if="d_itemObject.fieldName"
            :label="$t('Parameter')"
            :prop="'action.jsonActionList.' + index + '.parameter'"
            :rules="rules.parameter"
        >
            <generic-tag-enum-autocomplete
                v-if="c_isTransactionType"
                :selectedString.sync="d_selectedTransactionType"
                :optionObjectList="c_typeList"
                @update:selectedString="updateParameter()"
            />
            <account-autocomplete
                v-else
                :object.sync="d_selectedAccount"
                :optionList="c_accountList"
                @update:object="updateParameter()"
            />
        </el-form-item>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import GenButton from '../../components/GenButton.vue';
import { JsonAction } from '../../backend/database/entity/proxy/JsonAction';
import { FieldNameActionType } from '../../backend/database/entity/proxy/CashRuleV1';
import CashTransactionType from '../../backend/database/entity/enumeration/CashTransactionType';
import EnumAutocomplete from '../../components/EnumAutocomplete.vue';
import GenericTagEnumAutocomplete from '../../components/GenericTagEnumAutocomplete.vue';
import AccountAutocomplete from '../account/AccountAutocomplete.vue';

export default Vue.extend({
    name: 'action-extra-component',
    components: {
        GenButton,
        EnumAutocomplete,
        GenericTagEnumAutocomplete,
        AccountAutocomplete,
    },
    props: {
        itemObject: {
            type: Object as () => JsonAction,
            required: true,
        },
        index: Number,
        removable: Boolean,
        upable: Boolean,
        downable: Boolean,
    },
    data(this: any) {
        let d_selectedAccount = null;
        let d_selectedTransactionType = null;
        if (this.itemObject.fieldName === FieldNameActionType.TRANSACTION_TYPE) {
            d_selectedTransactionType = this.itemObject.parameter;
        } else if (
            this.itemObject.fieldName === FieldNameActionType.ACCOUNT_FROM ||
            this.itemObject.fieldName === FieldNameActionType.ACCOUNT_TO
        ) {
            d_selectedAccount = this.$store.state.PermanentData.accountMap.get(
                +this.itemObject.parameter,
            );
        }
        const checkParameter = (rule, value, callback, source) => {
            if (!this.d_itemObject.parameter || this.d_itemObject.parameter.length === 0) {
                callback(new Error(this.$t('Please define a value')));
            } else {
                callback();
            }
        };
        return {
            d_itemObject: this.itemObject,
            d_selectedTransactionType,
            d_selectedAccount,
            rules: {
                fieldName: [
                    {
                        type: 'string',
                        required: true,
                        message: this.$t('Please give a field name'),
                        trigger: 'blur',
                    },
                ],
                parameter: [{ validator: checkParameter, trigger: 'blur' }],
            },
        };
    },
    computed: {
        c_isTransactionType(this: any) {
            return this.d_itemObject.fieldName === FieldNameActionType.TRANSACTION_TYPE;
        },
        c_fieldNameList(this: any) {
            return Object.keys(FieldNameActionType).map((item) => {
                return { value: item, label: this.$t(item) };
            });
        },
        c_typeList(this: any) {
            return Object.keys(CashTransactionType).map((item) => {
                return { value: item, label: this.$t(item) };
            });
        },
        c_accountList(this: any) {
            return this.$store.getters['PermanentData/leafAccountList'];
        },
    },
    methods: {
        remove() {
            this.$emit('remove');
        },
        moveUp() {
            this.$emit('moveUp');
        },
        moveDown() {
            this.$emit('moveDown');
        },
        updateParameter(this: any) {
            if (this.d_itemObject.fieldName === FieldNameActionType.TRANSACTION_TYPE) {
                this.d_itemObject.parameter = this.d_selectedTransactionType;
            } else if (
                this.d_itemObject.fieldName === FieldNameActionType.ACCOUNT_FROM ||
                this.d_itemObject.fieldName === FieldNameActionType.ACCOUNT_TO
            ) {
                this.d_itemObject.parameter = this.d_selectedAccount
                    ? this.d_selectedAccount.id
                    : null;
            } else {
                this.d_itemObject.parameter = null;
            }
        },
    },
});
</script>
<style lang="scss" scoped>
.action-extra-component {
    background-color: #f0f3f7;
    border-radius: 3px;
    padding-top: 6px;
}
.not-first {
    border-top: 1px solid #dcdfe6;
}
.index-info {
    color: #ffffff;
    background-color: #6685b2;
    padding-right: 7px;
    padding-left: 7px;
    margin-right: 10px;
    border-radius: 0 10px 10px 0px;
    font-size: 14px;
}
</style>
