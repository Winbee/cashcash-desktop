<template>
    <div>
        <svg
            t="1492500959545"
            @click="toggleClick"
            class="hamburger"
            :class="{ 'is-active': isActive }"
            style=""
            viewBox="0 0 1024 1024"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            p-id="1691"
            xmlns:xlink="http://www.w3.org/1999/xlink"
            width="64"
            height="64"
        >
            <path
                d="M700.29141 790.509155c31.136138 18.067494 56.673767 3.396353 56.750515-32.601512l1.100054-518.214539c0.077771-35.994796-25.39846-50.776454-56.610322-32.843012L252.232698 464.987267c-31.208792 17.930371-31.271214 47.379077-0.140193 65.445548l448.199928 260.07634L700.29141 790.509155 700.29141 790.509155z"
                p-id="21558"
            ></path>
        </svg>
    </div>
</template>

<script lang="ts">
export default {
    name: 'hamburger',
    props: {
        isActive: {
            type: Boolean,
            default: false,
        },
        toggleClick: {
            type: Function,
            default: null,
        },
    },
};
</script>

<style scoped>
.hamburger {
    display: inline-block;
    cursor: pointer;
    width: 15px;
    height: 20px;
    transform: rotate(180deg);
    transition: 0.38s;
    transform-origin: 50% 50%;
    fill: #304156;
}

.hamburger.is-active {
    transform: rotate(0deg);
}
</style>
