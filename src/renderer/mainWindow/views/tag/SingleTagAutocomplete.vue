<template>
    <div class="single-tag-autocomplete">
        <el-select
            v-model="d_object"
            :placeholder="$t('Add a tag')"
            filterable
            :value-key="'id'"
            @change="onInput"
            :disabled="disabled"
            @visible-change="onVisibleChange"
            @blur="onBlur"
            size="small"
            ref="el"
        >
            <el-option
                v-for="item in optionList"
                :key="item.id"
                :label="item.name"
                :value="item"
            ></el-option>
        </el-select>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import CashTag from '../../backend/database/entity/CashTag';

export default Vue.extend({
    name: 'single-tag-autocomplete',
    components: {},
    props: {
        object: Object,
        optionList: Array,
        disabled: Boolean,
        fixedWidth: Boolean,
        autofocus: Boolean,
    },
    data(this: any) {
        return {
            d_object: this.object,
        };
    },
    computed: {},
    methods: {
        onInput(this: any, option: CashTag) {
            this.$emit('update:object', option);
        },
        onVisibleChange(this: any, isVisible: boolean) {
            if (!isVisible) {
                this.onBlur();
            }
        },
        onBlur(this: any) {
            setTimeout(() => this.$emit('blur'), 100);
        },
    },
    mounted(this: any) {
        if (this.autofocus) {
            this.$refs.el.focus();
        }
    },
});
</script>
