<template>
    <svg :class="svgClass" aria-hidden="true">
        <use :xlink:href="iconName"></use>
    </svg>
</template>

<script lang="ts">
export default {
    name: 'svg-icon',
    props: {
        iconClass: {
            type: String,
            required: true,
        },
        className: {
            type: String,
        },
    },
    computed: {
        iconName(this: any) {
            return `#icon-${this.iconClass}`;
        },
        svgClass(this: any) {
            if (this.className) {
                return 'svg-icon ' + this.className;
            } else {
                return 'svg-icon';
            }
        },
    },
};
</script>

<style lang="scss" scoped>
.svg-icon {
    width: 1.5em;
    height: 1.5em;
    fill: currentColor;
    overflow: hidden;
}

.big {
    width: 2.8em;
    height: 2.8em;
}
</style>
