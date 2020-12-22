<template>
    <div class="generic-autocomplete">
        <el-select
            v-model="d_object"
            filterable
            :placeholder="placeholder ? placeholder : $t('Select')"
            :value-key="'id'"
            @change="(option) => $emit('update:object', option)"
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
    name: 'generic-autocomplete',
    components: {},
    props: {
        object: Object,
        optionList: Array,
        placeholder: String,
        disabled: Boolean,
    },
    data(this: any) {
        return {
            d_object: this.object,
        };
    },
    computed: {},
    methods: {},
});
</script>
