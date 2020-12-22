<template>
    <div class="main-wrapper">
        <navbar>
            <template slot="first-line-left">
                <generic-parameters
                    :parameters="c_parameters"
                    :actionableParameters="[
                        'searchString',
                        'account',
                        'createdDateFrom',
                        'createdDateTo',
                        'updatedDateFrom',
                        'updatedDateTo',
                    ]"
                    :vuexDispatch="'Filter/updateParameters'"
                    :routeAfterUpdate="'filter-page'"
                    :placeholder="$t('Filters')"
                />
            </template>
            <template slot="second-line-left">
                <gen-button @click.prevent="cancel()" size="small">{{ $t('Cancel') }}</gen-button>
                <el-button type="primary" @click.prevent="submitForm()" size="small">{{
                    $t('Save')
                }}</el-button>
            </template>
        </navbar>
        <div class="main-content">
            <el-form
                v-if="wipFilter && wipParameter"
                ref="form"
                :model="wipFilter"
                label-width="120px"
            >
                <filter-edit-component
                    :wipFilter="wipFilter"
                    :wipParameter.sync="wipParameter"
                ></filter-edit-component>
            </el-form>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import _ from 'lodash';
import CashFilter from '../../backend/database/entity/CashFilter';
import Navbar from '../../components/Navbar.vue';
import GenericParameters from '../../components/genericparameters/GenericParameters.vue';
import CashFilterUtils from '../../backend/utils/CashFilterUtils';
import GenButton from '../../components/GenButton.vue';
import PrintUtils from '../../backend/utils/PrintUtils';
import DateUtils from '../../backend/utils/DateUtils';
import FilterEditComponent from './FilterEditComponent.vue';

export default Vue.extend({
    name: 'filter-edit-page',
    components: {
        Navbar,
        GenericParameters,
        GenButton,
        FilterEditComponent,
    },
    data(this: any) {
        return {
            wipFilter: null as CashFilter | null,
            wipParameter: null,
        };
    },
    computed: {
        c_parameters(this: any) {
            return this.$store.state.Filter.parameters;
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
            this.wipFilter.jsonFilter = CashFilterUtils.convertToJsonFilter(this.wipParameter);
            await this.$store.dispatch('Filter/saveFilter', this.wipFilter);
            this.$router.push({ name: 'filter-page' });
        },
        async cancel(this: any) {
            this.$router.go(-1);
        },
    },
    async created(this: any) {
        const filterId = this.$route.params.filterId;
        const filter = this.$route.params.newFilter;
        const duplicate = this.$route.params.duplicate;
        await this.$store.dispatch('Filter/initWipFilter', { filterId, filter, duplicate });
        this.wipFilter = _.cloneDeep(this.$store.state.Filter.wipFilter);
        this.wipParameter = CashFilterUtils.convertToParameters(this.wipFilter.jsonFilter);
    },
});
</script>

<style lang="scss" scoped></style>
