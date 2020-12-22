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
                    :vuexDispatch="'Rule/updateParameters'"
                    :routeAfterUpdate="'rule-page'"
                    :placeholder="$t('Rules')"
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
            <el-form v-if="wipRule" ref="form" :model="wipRule" label-width="120px">
                <rule-edit-component :wipRule="wipRule" :oldFilter="oldFilter" />
            </el-form>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import _ from 'lodash';
import RuleEditComponent from './RuleEditComponent.vue';
import CashRule from '../../backend/database/entity/CashRule';
import Navbar from '../../components/Navbar.vue';
import GenericParameters from '../../components/genericparameters/GenericParameters.vue';
import GenButton from '../../components/GenButton.vue';
import VueScrollTo from 'vue-scrollto';

export default Vue.extend({
    name: 'rule-edit-page',
    components: {
        RuleEditComponent,
        Navbar,
        GenericParameters,
        GenButton,
    },
    data(this: any) {
        return {
            wipRule: null as CashRule | null,
            oldFilter: null,
        };
    },
    computed: {
        c_parameters(this: any) {
            return this.$store.state.Rule.parameters;
        },
    },
    methods: {
        async submitForm(this: any) {
            const isValid = await new Promise((resolve, reject) => {
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
            if (isValid) {
                this.save();
            }
        },
        async save(this: any) {
            await this.$store.dispatch('Rule/saveRule', this.wipRule);
            this.$router.push({ name: 'rule-page' });
        },
        async cancel(this: any) {
            this.$router.go(-1);
        },
    },
    async created(this: any) {
        const ruleId = this.$route.params.ruleId;
        const rule = this.$route.params.Rule;
        const duplicate = this.$route.params.duplicate;
        await this.$store.dispatch('Rule/initWipRule', { ruleId, rule, duplicate });
        this.wipRule = _.cloneDeep(this.$store.state.Rule.wipRule);
        this.oldFilter = _.cloneDeep(this.$store.state.Rule.wipRule.filter);
    },
});
</script>
