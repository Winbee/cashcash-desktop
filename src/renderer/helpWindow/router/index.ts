import Vue from 'vue';
import Router from 'vue-router';

Vue.use(Router);

const routeList: any = [
    {
        path: '/',
        redirect: '/home',
    },
    {
        path: '/404',
        name: '404-page',
        component: () => import('@/renderer/helpWindow/views/404Page.vue'),
    },
    {
        path: '/home',
        name: 'home-page',
        component: () => import('@/renderer/helpWindow/views/HomePage.vue'),
    },
    {
        path: '/concept',
        name: 'concept-page',
        component: () => import('@/renderer/helpWindow/views/ConceptPage.vue'),
    },
    {
        path: '/walkthrough',
        name: 'walkthrough-page',
        component: () => import('@/renderer/helpWindow/views/WalkthroughPage.vue'),
    },
    {
        path: '*',
        redirect: '/home',
    },
];

const router = new Router({
    scrollBehavior: () => ({ selector: '#app' }),
    routes: routeList,
});

export default router;
