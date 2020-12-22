<template>
    <div class="generic-multiple-autocomplete">
        <el-select
            v-model="d_objectList"
            filterable
            multiple
            :placeholder="placeholder ? placeholder : $t('Select')"
            :value-key="'id'"
            @change="(optionList) => $emit('update:objectList', optionList)"
            size="small"
            :disabled="disabled"
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

export default Vue.extend({
    name: 'generic-multiple-autocomplete',
    components: {},
    props: {
        objectList: Array,
        optionList: Array,
        placeholder: String,
        disabled: Boolean,
    },
    data(this: any) {
        return {
            d_objectList: this.objectList,
        };
    },
    computed: {},
    methods: {},
});
</script>
