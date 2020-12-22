<template>
    <transition name="fade">
        <div class="overlay">
            <div class="logo">
                <svg-icon :icon-class="'cashcash-black'" class="icon blinking"></svg-icon>
            </div>
        </div>
    </transition>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
    name: 'loading-page',
    async created(this: any) {
        await this.$store.dispatch('App/init');
    },
    data(this: any) {
        return {
            previousRoutePath: this.$route.params.previousRoutePath,
            twoSecond: new Promise((resolve) => {
                setTimeout(resolve, 2000);
            }),
        };
    },
    computed: {
        c_appIsLoading(this: any) {
            return this.$store.state.App.appIsLoading;
        },
    },
    watch: {
        c_appIsLoading: 'goToHome',
    },
    methods: {
        async goToHome(this: any) {
            await this.twoSecond;
            this.$router.push({ path: this.previousRoutePath || '/' });
        },
    },
});
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.overlay {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background: #f5f7fa;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
}
.logo {
    background-color: #304156;
    color: rgb(191, 203, 217);
    border-radius: 50%;
    padding: 10px;
    box-shadow: 0 5px 5px -3px rgba(0, 0, 0, 0.2), 0 8px 10px 1px rgba(0, 0, 0, 0.14),
        0 3px 14px 2px rgba(0, 0, 0, 0.12);
}
.icon {
    width: 5em;
    height: 5em;
    position: relative;
    top: 2px;
}
.fade-enter-active,
.fade-leave-active {
    transition: opacity 1s;
}
.fade-enter,
.fade-leave-to {
    opacity: 0;
}

.blinking {
    animation: opacity 1.5s ease-in-out infinite;
    opacity: 1;
}

@keyframes opacity {
    0% {
        opacity: 0.2;
    }

    50% {
        opacity: 1;
    }

    100% {
        opacity: 0.2;
    }
}
</style>
