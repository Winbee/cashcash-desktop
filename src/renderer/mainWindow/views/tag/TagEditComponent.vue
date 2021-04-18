<template>
    <div>
        <el-form-item :label="$t('Name')" prop="name" :rules="rules.name">
            <el-input v-model="d_wipTag.name" v-autosize="d_wipTag.name" size="small"></el-input>
        </el-form-item>
        <el-form-item v-if="d_wipTag.createdDate" :label="$t('Created at')">
            <div>{{ formatDate(wipTag.createdDate) }}</div>
        </el-form-item>
        <el-form-item v-if="d_wipTag.updatedDate" :label="$t('Updated at')">
            <div>{{ formatDate(wipTag.updatedDate) }}</div>
        </el-form-item>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import _ from 'lodash';
import CashTag from '../../backend/database/entity/CashTag';
import Navbar from '../../components/Navbar.vue';
import GenericParameters from '../../components/genericparameters/GenericParameters.vue';
import GenButton from '../../components/GenButton.vue';
import DateUtils from '../../backend/utils/DateUtils';
import StringUtils from '../../backend/utils/StringUtils';

export default Vue.extend({
    name: 'tag-edit-component',
    components: {
        Navbar,
        GenericParameters,
        GenButton,
    },
    props: {
        wipTag: {
            type: Object as () => CashTag,
            required: false,
        },
    },
    data(this: any) {
        const checkName = (rule, value, callback, source) => {
            if (
                StringUtils.keepLetterNumberDashOnly(this.wipTag.name).length !==
                this.wipTag.name.length
            ) {
                callback(new Error(this.$t('Only letters, numbers and dashes are allowed')));
            } else {
                callback();
            }
        };
        return {
            d_wipTag: this.wipTag,
            rules: {
                name: [
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
                    { validator: checkName, trigger: 'blur' },
                ],
            },
        };
    },
    methods: {
        formatDate(this: any, dateObj: Date): string {
            return DateUtils.formatHumanDate(dateObj);
        },
    },
    async created(this: any) {},
});
</script>

<style lang="scss" scoped>
.edited-generic-parameters {
    padding-left: 76px;
    padding-bottom: 22px;
}
</style>
