<template>
    <div class="account-autocomplete">
        <el-select
            v-model="d_object"
            :placeholder="$t('Select Account')"
            filterable
            :value-key="'id'"
            @change="onInput"
            :disabled="disabled"
            @visible-change="onVisibleChange"
            @blur="onBlur"
            size="small"
            ref="el"
        >
            <el-option-group
                v-for="(optionListByKey, key) in c_optionGroupList"
                :key="key"
                :label="$t(key).toString().toUpperCase()"
            >
                <el-option
                    v-for="item in optionListByKey"
                    :key="item.id"
                    :label="item.name"
                    :value="item"
                >
                    <span style="float: left; padding-right: 5px">{{ item.name }}</span>
                    <span v-if="isInternalLeaf(item)" style="float: right; color: #98a7bc">{{
                        item.currency.symbol
                    }}</span>
                </el-option>
            </el-option-group>
        </el-select>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import CashAccount from '../../backend/database/entity/CashAccount';
import _ from 'lodash';
import CashAccountUtils from '../../backend/utils/CashAccountUtils';

export default Vue.extend({
    name: 'account-autocomplete',
    components: {},
    props: {
        object: Object,
        optionList: Array,
        disabled: Boolean,
        autofocus: Boolean,
    },
    data(this: any) {
        return {
            d_object: this.object,
        };
    },
    computed: {
        c_optionGroupList(this: any) {
            return _.groupBy(this.optionList, (item) => item.type);
        },
    },
    methods: {
        onInput(this: any, option: CashAccount) {
            this.$emit('update:object', this.d_object);
        },
        onVisibleChange(this: any, isVisible: boolean) {
            if (!isVisible) {
                this.onBlur();
            }
        },
        onBlur(this: any) {
            setTimeout(() => this.$emit('blur'), 100);
        },
        isInternalLeaf(this: any, item: CashAccount) {
            return CashAccountUtils.isInternal(item) && CashAccountUtils.isLeaf(item);
        },
    },
    mounted(this: any) {
        if (this.autofocus) {
            this.$refs.el.focus();
        }
    },
});
</script>
