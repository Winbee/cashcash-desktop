<template>
    <div class="budget-pagination-status">
        <div class="label small-font">{{ label }}</div>
        <gen-button
            size="small"
            @click="addMonth(-1)"
            circle
            v-if="!hideButtons"
            :disabled="minReached"
        >
            <fa :icon="'angle-left'" fixed-width></fa>
        </gen-button>
        <gen-button
            size="small"
            @click="addMonth(1)"
            circle
            v-if="!hideButtons"
            :disabled="maxReached"
        >
            <fa :icon="'angle-right'" fixed-width></fa>
        </gen-button>
    </div>
</template>

<script lang="ts">
import GenButton from './GenButton.vue';
import PrintUtils from '../backend/utils/PrintUtils';
import { addMonths, isSameMonth } from 'date-fns';
import DateUtils from '../backend/utils/DateUtils';
import StringUtils from '../backend/utils/StringUtils';

export default {
    name: 'budget-pagination-status',
    components: {
        GenButton,
    },
    props: {
        currentDate: Date,
        maxDate: Date,
        minDate: Date,
        hideButtons: Boolean,
    },
    computed: {
        label(this: any) {
            const dateString = DateUtils.formatHumanMonth(this.currentDate);
            return StringUtils.toUpperCaseFirstLetter(dateString);
        },
        minReached(this: any) {
            return isSameMonth(this.currentDate, this.minDate);
        },
        maxReached(this: any) {
            return isSameMonth(this.currentDate, this.maxDate);
        },
    },
    methods: {
        addMonth(this: any, nbOfMonth: number) {
            const newDate = addMonths(this.currentDate, nbOfMonth);
            this.$emit('current-change', newDate);
        },
    },
};
</script>

<style scoped>
.budget-pagination-status {
    display: flex;
    flex-flow: row;
    align-items: center;
}
.label {
    white-space: nowrap;
    margin-right: 10px;
}
</style>
