<template>
    <div class="pagination-status">
        <div class="label small-font">{{ label }}</div>
        <gen-button
            size="small"
            @click="addPage(-1)"
            circle
            :disabled="currentPage === 1"
            v-if="!hideButtons"
        >
            <fa :icon="'angle-left'" fixed-width></fa>
        </gen-button>
        <gen-button
            size="small"
            @click="addPage(1)"
            circle
            :disabled="currentPage * pageSize >= this.total"
            v-if="!hideButtons"
        >
            <fa :icon="'angle-right'" fixed-width></fa>
        </gen-button>
    </div>
</template>

<script lang="ts">
import GenButton from './GenButton.vue';

export default {
    name: 'pagination-status',
    components: {
        GenButton,
    },
    props: {
        total: Number,
        currentPage: Number,
        pageSize: Number,
        hideButtons: Boolean,
    },
    computed: {
        first(this: any) {
            if (this.total === 0) {
                return 0;
            }
            return this.pageSize * (this.currentPage - 1) + 1;
        },
        last(this: any) {
            return this.total < this.pageSize * this.currentPage
                ? this.total
                : this.pageSize * this.currentPage;
        },
        label(this: any) {
            if (this.total === 0) {
                return '';
            }
            return this.$t('{first}-{last} of {total}', {
                first: this.first,
                last: this.last,
                total: this.total,
            });
        },
    },
    methods: {
        addPage(this: any, pageDelta: number) {
            const newPage = this.currentPage + pageDelta;
            if (newPage > 0) {
                this.$emit('current-change', newPage);
            }
        },
    },
};
</script>

<style scoped>
.pagination-status {
    display: flex;
    flex-flow: row;
    align-items: center;
}
.label {
    white-space: nowrap;
    margin-right: 10px;
}
</style>
