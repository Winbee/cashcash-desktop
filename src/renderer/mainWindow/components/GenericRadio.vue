<template>
    <div class="generic-radio">
        <el-radio-group
            v-model="d_stringValue"
            @change="(selected) => $emit('update:stringValue', selected)"
            :disabled="disabled"
            size="small"
        >
            <el-radio-button
                v-for="option in optionList"
                :key="option"
                :label="option"
            ></el-radio-button>
        </el-radio-group>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
    name: 'generic-radio',
    components: {},
    props: {
        stringValue: String,
        optionList: Array,
        disabled: Boolean,
    },
    data(this: any) {
        return {
            d_stringValue: this.stringValue,
        };
    },
    methods: {},
});
</script>
