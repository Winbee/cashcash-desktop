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
                    :vuexDispatch="'Tag/updateParameters'"
                    :routeAfterUpdate="'tag-page'"
                    :placeholder="$t('Tags')"
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
            <el-form v-if="wipTag" ref="form" :model="wipTag" label-width="120px">
                <tag-edit-component :wipTag="wipTag"></tag-edit-component>
            </el-form>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import _ from 'lodash';
import CashTag from '../../backend/database/entity/CashTag';
import Navbar from '../../components/Navbar.vue';
import GenericParameters from '../../components/genericparameters/GenericParameters.vue';
import GenButton from '../../components/GenButton.vue';
import TagEditComponent from './TagEditComponent.vue';

export default Vue.extend({
    name: 'tag-edit-page',
    components: {
        Navbar,
        GenericParameters,
        GenButton,
        TagEditComponent,
    },
    data(this: any) {
        return {
            wipTag: null as CashTag | null,
            wipParameter: null,
        };
    },
    computed: {
        c_parameters(this: any) {
            return this.$store.state.Tag.parameters;
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
            await this.$store.dispatch('Tag/saveTag', this.wipTag);
            this.$router.push({ name: 'tag-page' });
        },
        async cancel(this: any) {
            this.$router.go(-1);
        },
    },
    async created(this: any) {
        const tagId = this.$route.params.tagId;
        const tag = this.$route.params.newTag;
        const duplicate = this.$route.params.duplicate;
        await this.$store.dispatch('Tag/initWipTag', { tagId, tag, duplicate });
        this.wipTag = _.cloneDeep(this.$store.state.Tag.wipTag);
    },
});
</script>

<style lang="scss" scoped></style>
