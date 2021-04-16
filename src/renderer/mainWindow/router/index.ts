import Vue from 'vue';
import VueRouter, { Route } from 'vue-router';
import Layout from '@/renderer/mainWindow/views/layout/Layout.vue';
import store from '../store';
import i18n from '../../common/i18n/i18n';

Vue.use(VueRouter);

const routeList: any = [
    {
        path: '/',
        redirect: '/home',
    },
    {
        path: '/loading',
        component: () => import('@/renderer/mainWindow/views/LoadingPage.vue'),
        hidden: true,
        children: [
            {
                path: '',
                name: 'loading-page',
                meta: { title: 'Loading', icon: 'example' },
            },
        ],
    },
    {
        path: '/404',
        component: Layout,
        hidden: true,
        children: [
            {
                path: '',
                name: '404-page',
                component: () => import('@/renderer/mainWindow/views/404Page.vue'),
                meta: { title: 'Not found', icon: 'example' },
            },
        ],
    },
    {
        path: '/home',
        component: Layout,
        children: [
            {
                path: '',
                name: 'home-page',
                component: () => import('@/renderer/mainWindow/views/HomePage.vue'),
                meta: {
                    title: 'Cashcash',
                    icon: 'cashcash-black',
                    isHeader: true,
                    activeMenuPath: '/home/',
                },
            },
        ],
    },
    {
        path: '/account/internal',
        component: Layout,
        children: [
            {
                path: '',
                name: 'account-internal-page',
                component: () =>
                    import('@/renderer/mainWindow/views/account/AccountInternalPage.vue'),
                meta: {
                    title: 'Internal accounts',
                    icon: 'bank-int',
                    activeMenuPath: '/account/internal/',
                },
            },
        ],
    },
    {
        path: '/account/external',
        component: Layout,
        children: [
            {
                path: '',
                name: 'account-external-page',
                component: () =>
                    import('@/renderer/mainWindow/views/account/AccountExternalPage.vue'),
                meta: {
                    title: 'External accounts',
                    icon: 'bank-ext',
                    activeMenuPath: '/account/external/',
                },
            },
        ],
    },
    {
        path: '/account/external/edit/:accountId',
        component: Layout,
        hidden: true,
        children: [
            {
                path: '',
                name: 'account-external-edit-page',
                component: () => import('@/renderer/mainWindow/views/account/AccountEditPage.vue'),
                meta: {
                    title: 'Edit',
                    icon: 'example',
                    activeMenuPath: '/account/external/',
                },
            },
        ],
    },
    {
        path: '/account/internal/edit/:accountId',
        component: Layout,
        hidden: true,
        children: [
            {
                path: '',
                name: 'account-internal-edit-page',
                component: () => import('@/renderer/mainWindow/views/account/AccountEditPage.vue'),
                meta: {
                    title: 'Edit',
                    icon: 'example',
                    activeMenuPath: '/account/internal/',
                },
            },
        ],
    },
    {
        path: '/transaction',
        component: Layout,
        children: [
            {
                path: '',
                name: 'transaction-page',
                component: () =>
                    import('@/renderer/mainWindow/views/transaction/TransactionPage.vue'),
                meta: {
                    title: 'Transactions',
                    icon: 'icon-swap',
                    activeMenuPath: '/transaction/',
                },
            },
        ],
    },
    {
        path: '/transaction/import-file',
        component: Layout,
        hidden: true,
        children: [
            {
                path: '',
                name: 'import-file-page',
                component: () => import('@/renderer/mainWindow/views/import/ImportFilePage.vue'),
                meta: {
                    title: 'Import File',
                    icon: 'example',
                    activeMenuPath: '/transaction/',
                },
            },
        ],
    },
    {
        path: '/transaction/import-transaction',
        component: Layout,
        hidden: true,
        children: [
            {
                path: '',
                name: 'import-transaction-page',
                component: () =>
                    import('@/renderer/mainWindow/views/import/ImportTransactionPage.vue'),
                meta: {
                    title: 'Import transaction',
                    icon: 'example',
                    activeMenuPath: '/transaction/',
                },
            },
        ],
    },
    {
        path: '/transaction/multi-edit-rule',
        component: Layout,
        hidden: true,
        children: [
            {
                path: '',
                name: 'multi-edit-rule-page',
                component: () =>
                    import(
                        '@/renderer/mainWindow/views/transaction/multiedit/MultiEditRulePage.vue'
                    ),
                meta: {
                    title: 'Multi edit rule selection',
                    icon: 'example',
                    activeMenuPath: '/transaction/',
                },
            },
        ],
    },
    {
        path: '/transaction/multi-edit-transaction',
        component: Layout,
        hidden: true,
        children: [
            {
                path: '',
                name: 'multi-edit-transaction-page',
                component: () =>
                    import(
                        '@/renderer/mainWindow/views/transaction/multiedit/MultiEditTransactionPage.vue'
                    ),
                meta: {
                    title: 'Multi edit transaction',
                    icon: 'example',
                    activeMenuPath: '/transaction/',
                },
            },
        ],
    },
    {
        path: '/transaction/:transactionId',
        component: Layout,
        hidden: true,
        children: [
            {
                path: '',
                name: 'transaction-edit-page',
                component: () =>
                    import('@/renderer/mainWindow/views/transaction/TransactionEditPage.vue'),
                meta: { title: 'Edit', icon: 'example', activeMenuPath: '/transaction/' },
            },
        ],
    },
    {
        path: '/rate',
        component: Layout,
        children: [
            {
                path: '',
                name: 'rate-page',
                component: () => import('@/renderer/mainWindow/views/rate/RatePage.vue'),
                meta: { title: 'Rates', icon: 'percent', activeMenuPath: '/rate/' },
            },
        ],
    },
    {
        path: '/rate/:rateId',
        component: Layout,
        hidden: true,
        children: [
            {
                path: '',
                name: 'rate-edit-page',
                component: () => import('@/renderer/mainWindow/views/rate/RateEditPage.vue'),
                meta: { title: 'Edit', icon: 'example', activeMenuPath: '/rate/' },
            },
        ],
    },
    {
        path: '/budget-transaction',
        component: Layout,
        children: [
            {
                path: '',
                name: 'budget-transaction-page',
                component: () =>
                    import(
                        '@/renderer/mainWindow/views/budgettransaction/BudgetTransactionPage.vue'
                    ),
                meta: {
                    title: 'Budget',
                    icon: 'balance-scale',
                    activeMenuPath: '/budget-transaction/',
                },
            },
        ],
    },
    {
        path: '/budget-transaction/:transactionId',
        component: Layout,
        hidden: true,
        children: [
            {
                path: '',
                name: 'budget-transaction-edit-page',
                component: () =>
                    import(
                        '@/renderer/mainWindow/views/budgettransaction/BudgetTransactionEditPage.vue'
                    ),
                meta: {
                    title: 'Edit',
                    icon: 'example',
                    activeMenuPath: '/budget-transaction/',
                },
            },
        ],
    },
    {
        path: '/filter',
        component: Layout,
        children: [
            {
                path: '',
                name: 'filter-page',
                component: () => import('@/renderer/mainWindow/views/filter/FilterPage.vue'),
                meta: { title: 'Filters', icon: 'filter', activeMenuPath: '/filter/' },
            },
        ],
    },
    {
        path: '/filter/:filterId',
        component: Layout,
        hidden: true,
        children: [
            {
                path: '',
                name: 'filter-edit-page',
                component: () => import('@/renderer/mainWindow/views/filter/FilterEditPage.vue'),
                meta: { title: 'Edit', icon: 'example', activeMenuPath: '/filter/' },
            },
        ],
    },
    {
        path: '/rule',
        component: Layout,
        children: [
            {
                path: '',
                name: 'rule-page',
                component: () => import('@/renderer/mainWindow/views/rule/RulePage.vue'),
                meta: { title: 'Rules', icon: 'assignment', activeMenuPath: '/rule/' },
            },
        ],
    },
    {
        path: '/rule/:ruleId',
        component: Layout,
        hidden: true,
        children: [
            {
                path: '',
                name: 'rule-edit-page',
                component: () => import('@/renderer/mainWindow/views/rule/RuleEditPage.vue'),
                meta: { title: 'Edit', icon: 'example', activeMenuPath: '/rule/' },
            },
        ],
    },
    {
        path: '/tag',
        component: Layout,
        children: [
            {
                path: '',
                name: 'tag-page',
                component: () => import('@/renderer/mainWindow/views/tag/TagPage.vue'),
                meta: { title: 'Tags', icon: 'tags', activeMenuPath: '/tag/' },
            },
        ],
    },
    {
        path: '/tag/:tagId',
        component: Layout,
        hidden: true,
        children: [
            {
                path: '',
                name: 'tag-edit-page',
                component: () => import('@/renderer/mainWindow/views/tag/TagEditPage.vue'),
                meta: { title: 'Edit', icon: 'example', activeMenuPath: '/tag/' },
            },
        ],
    },
    {
        path: '/import-config',
        component: Layout,
        children: [
            {
                path: '',
                name: 'import-config-page',
                component: () =>
                    import('@/renderer/mainWindow/views/import/config/ImportConfigPage.vue'),
                meta: {
                    title: 'Import',
                    icon: 'file-upload',
                    activeMenuPath: '/import-config/',
                },
            },
        ],
    },
    {
        path: '/import-config/:importConfigId',
        component: Layout,
        hidden: true,
        children: [
            {
                path: '',
                name: 'import-config-edit-page',
                component: () =>
                    import('@/renderer/mainWindow/views/import/config/ImportConfigEditPage.vue'),
                meta: {
                    title: 'Edit',
                    icon: 'example',
                    activeMenuPath: '/import-config/',
                },
            },
        ],
    },
];

const utilRoutes = [
    {
        path: '/preferences',
        component: Layout,
        children: [
            {
                path: '',
                name: 'preferences-page',
                component: () =>
                    import('@/renderer/mainWindow/views/preferences/PreferencesPage.vue'),
                meta: {
                    title: 'Preferences',
                    icon: 'setting',
                    activeMenuPath: '/preferences/',
                },
            },
        ],
    },
    {
        path: '*',
        redirect: '/404',
    },
];
routeList.push(...utilRoutes);

const router = new VueRouter({
    scrollBehavior: () => ({ selector: '#app' }),
    routes: routeList,
});

router.beforeEach((to: Route, from: Route, next) => {
    if (to.name !== 'loading-page' && (store as any).state.App.appIsLoading) {
        next({ name: 'loading-page', params: { previousRoutePath: to.path } });
    } else {
        next();
    }
});

export default router;
