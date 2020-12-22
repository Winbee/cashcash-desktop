<template>
    <div class="main-wrapper">
        <navbar>
            <template slot="first-line-left">
                <generic-parameters
                    :parameters="c_parameters"
                    :actionableParameters="[
                        'currency',
                        'createdDateFrom',
                        'createdDateTo',
                        'updatedDateFrom',
                        'updatedDateTo',
                    ]"
                    :vuexDispatch="'Rate/updateParameters'"
                    :routeAfterUpdate="'rate-page'"
                    :placeholder="$t('Rates')"
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
            <el-form v-if="wipRate" ref="form" :model="wipRate" :rules="rules" label-width="120px">
                <rate-edit-component :wipRate="wipRate" />
            </el-form>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import _ from 'lodash';
import RateEditComponent from './RateEditComponent.vue';
import CashRate from '../../backend/database/entity/CashRate';
import Navbar from '../../components/Navbar.vue';
import GenericParameters from '../../components/genericparameters/GenericParameters.vue';
import GenButton from '../../components/GenButton.vue';

export default Vue.extend({
    name: 'rate-edit-page',
    components: {
        RateEditComponent,
        Navbar,
        GenericParameters,
        GenButton,
    },
    data(this: any) {
        const checkCurrencies = (rule, value, callback, source) => {
            if (this.wipRate.fromCurrency === this.wipRate.toCurrency) {
                callback(new Error(this.$t('Currencies cannot be equal')));
            } else {
                callback();
            }
        };
        const checkRate = (rule, value, callback, source) => {
            if (value <= 0) {
                callback(new Error(this.$t('Please enter a strictly positive value')));
            } else {
                callback();
            }
        };
        return {
            wipRate: null as CashRate | null,
            rules: {
                fromCurrency: [
                    {
                        type: 'object',
                        required: true,
                        message: this.$t('Please define a currency'),
                        trigger: 'blur',
                    },
                    { validator: checkCurrencies, trigger: 'blur' },
                ],
                toCurrency: [
                    {
                        type: 'object',
                        required: true,
                        message: this.$t('Please define a currency'),
                        trigger: 'blur',
                    },
                    { validator: checkCurrencies, trigger: 'blur' },
                ],
                rate: [
                    {
                        type: 'number',
                        required: true,
                        message: this.$t('Please define a rate'),
                        trigger: 'blur',
                    },
                    { validator: checkRate, trigger: 'blur' },
                ],
            },
        };
    },
    computed: {
        c_parameters(this: any) {
            return this.$store.state.Rate.parameters;
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
            await this.$store.dispatch('Rate/saveRate', this.wipRate);
            this.$router.push({ name: 'rate-page' });
        },
        async cancel(this: any) {
            this.$router.go(-1);
        },
    },
    async created(this: any) {
        const rateId = this.$route.params.rateId;
        const fromCurrencyId = this.$route.params.fromCurrencyId;
        const toCurrencyId = this.$route.params.toCurrencyId;
        await this.$store.dispatch('Rate/initWipRate', { rateId, fromCurrencyId, toCurrencyId });
        this.wipRate = _.cloneDeep(this.$store.state.Rate.wipRate);
    },
});
</script>
