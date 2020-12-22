<template>
    <div class="import-config-autocomplete">
        <el-select
            v-model="d_model"
            :placeholder="$t('Select Import config')"
            filterable
            :value-key="'id'"
            @change="onInput"
            size="small"
            :disabled="disabled"
        >
            <el-option v-for="item in optionList" :key="item.id" :label="item.name" :value="item">
                <span style="float: left; padding-right: 5px">{{ item.name }}</span>
                <span style="float: right; color: #98a7bc">{{ item.type }}</span>
            </el-option>
        </el-select>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import CashImportConfig from '../../backend/database/entity/CashImportConfig';

export default Vue.extend({
    name: 'import-config-autocomplete',
    components: {},
    props: {
        model: Object,
        optionList: Array,
        disabled: Boolean,
    },
    data(this: any) {
        return {
            d_model: this.model,
        };
    },
    computed: {},
    methods: {
        onInput(this: any, option: CashImportConfig) {
            this.$emit('update:model', option);
        },
    },
});
</script>
