<template>
    <div :class="{ 'import-config-extra-component': true, 'not-first': index !== 0 }">
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
            :label="$t('Column')"
            :prop="'jsonConfig.converting.property.' + propertyName + '.extra.' + index + '.index'"
            :rules="rules.index"
        >
            <el-input-number
                v-model="d_itemObject.index"
                controls-position="right"
                :min="1"
                size="small"
            />
        </el-form-item>
        <el-form-item
            :label="$t('Prefix')"
            :prop="'jsonConfig.converting.property.' + propertyName + '.extra.' + index + '.prefix'"
            :rules="rules.prefix"
        >
            <el-input
                v-model="d_itemObject.prefix"
                v-autosize="d_itemObject.prefix"
                size="small"
            ></el-input>
        </el-form-item>
        <el-form-item
            :label="$t('Remove spaces')"
            :prop="
                'jsonConfig.converting.property.' + propertyName + '.extra.' + index + '.cleanSpace'
            "
        >
            <el-switch v-model="d_itemObject.cleanSpace" />
        </el-form-item>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import ExtraDescription from '../../../backend/database/entity/proxy/ExtraDescription';
import GenButton from '../../../components/GenButton.vue';

export default Vue.extend({
    name: 'import-config-extra-component',
    components: {
        GenButton,
    },
    props: {
        itemObject: {
            type: Object as () => ExtraDescription,
            required: true,
        },
        index: Number,
        propertyName: String,
        removable: Boolean,
        upable: Boolean,
        downable: Boolean,
    },
    data(this: any) {
        return {
            d_itemObject: this.itemObject,
            rules: {
                index: [
                    {
                        type: 'number',
                        required: true,
                        message: this.$t('Please define an index'),
                        trigger: 'blur',
                    },
                ],
                prefix: [
                    { max: 30, message: this.$t('Length should be below 30'), trigger: 'blur' },
                ],
            },
        };
    },
    computed: {},
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
    },
});
</script>
<style lang="scss" scoped>
.import-config-extra-component {
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
