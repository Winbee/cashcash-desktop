<template>
    <div class="generic-edit-tag">
        <div v-if="edit">
            <slot></slot>
        </div>
        <div v-else>
            <el-tag
                closable
                @click="$emit('edit')"
                @close="$emit('remove')"
                :disable-transitions="true"
                >{{ this.label }}: {{ this.value }}</el-tag
            >
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
    name: 'generic-edit-tag',
    components: {},
    props: {
        label: String,
        value: String,
        edit: Boolean,
    },
});
</script>

<style lang="scss" scoped>
.generic-edit-tag {
    display: flex;
    flex-flow: row;
}
</style>
