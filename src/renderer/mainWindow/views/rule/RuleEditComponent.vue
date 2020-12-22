<template>
    <div v-if="d_wipRule">
        <el-form-item :label="$t('Name')" prop="name" :rules="rules.name">
            <el-input v-model="d_wipRule.name" v-autosize="d_wipRule.name" size="small"></el-input>
        </el-form-item>
        <el-form-item :label="$t('Filter')" prop="filter" :rules="rules.filter">
            <div class="filter-group">
                <generic-autocomplete
                    :object.sync="d_wipRule.filter"
                    :optionList="c_filterList"
                ></generic-autocomplete>
                <div v-if="d_wipRule.filter" class="filter-button-wrapper">
                    <gen-button size="small" @click.prevent="editFilter()">{{
                        $t('edit.filter.in.rule')
                    }}</gen-button>
                </div>
            </div>
        </el-form-item>
        <action-edit-component :wipAction="d_wipRule.action" />
        <el-form-item v-if="d_wipRule.createdDate" :label="$t('Created at')">
            <div>{{ formatDate(d_wipRule.createdDate) }}</div>
        </el-form-item>
        <el-form-item v-if="d_wipRule.updatedDate" :label="$t('Updated at')">
            <div>{{ formatDate(d_wipRule.updatedDate) }}</div>
        </el-form-item>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import CashRule from '../../backend/database/entity/CashRule';
import GenericAutocomplete from '../../components/GenericAutocomplete.vue';
import ActionEditComponent from '../action/ActionEditComponent.vue';
import PrintUtils from '../../backend/utils/PrintUtils';
import DateUtils from '../../backend/utils/DateUtils';
import GenButton from '../../components/GenButton.vue';
import _ from 'lodash';

export default Vue.extend({
    name: 'rule-edit-component',
    components: {
        GenericAutocomplete,
        ActionEditComponent,
        GenButton,
    },
    props: {
        wipRule: {
            type: Object as () => CashRule,
            required: false,
        },
        oldFilter: Object,
    },
    data(this: any) {
        return {
            d_wipRule: this.wipRule,
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
                filter: [
                    {
                        type: 'object',
                        required: true,
                        message: this.$t('Please define a filter'),
                        trigger: 'blur',
                    },
                ],
            },
        };
    },
    computed: {
        c_filterList(this: any) {
            if (this.oldFilter) {
                return [this.oldFilter, ...this.$store.state.Filter.filterWithoutRuleList];
            } else {
                return this.$store.state.Filter.filterWithoutRuleList;
            }
        },
    },
    methods: {
        formatDate(this: any, dateObj: Date): string {
            return DateUtils.formatHumanDate(dateObj);
        },
        editFilter(this: any) {
            this.$router.push({
                name: 'filter-edit-page',
                params: { filterId: this.d_wipRule.filter.id },
            });
        },
    },
});
</script>

<style lang="scss" scoped>
h3 {
    border-bottom: 1px solid #97a8be;
}

.el-card {
    margin: 10px 0;
}

.filter-group {
    display: flex;
    flex-direction: row;

    .filter-button-wrapper {
        margin-left: 8px;
    }
}
</style>
