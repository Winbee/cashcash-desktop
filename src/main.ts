import Vue from 'vue';
import ElementUI from 'element-ui';
import ECharts from 'vue-echarts';

import i18n from './renderer/common/i18n/i18n';
import App from './renderer/mainWindow/App.vue';
import router from './renderer/mainWindow/router';
import store from './renderer/mainWindow/store';
import DocumentationApp from './renderer/helpWindow/App.vue';
import documentationRouter from './renderer/helpWindow/router';
import documentationStore from './renderer/helpWindow/store';
// We have to import reflect-metadata for typeFi to work
import 'reflect-metadata';
import { library } from '@fortawesome/fontawesome-svg-core';
// Font font-awesome
import fontawesome from '@fortawesome/fontawesome';
import fontawesomeFreeSolid from '@fortawesome/fontawesome-free-solid';
// SVG font-awesome
import { fas } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import 'echarts';
import 'normalize.css/normalize.css'; // A modern alternative to CSS resets
import VueWait from 'vue-wait';
import './renderer/mainWindow/directive/Autosize';
import './renderer/mainWindow/directive/Focus';
import VueScrollTo from 'vue-scrollto';
import { MessageBox } from 'element-ui';
import { remote } from 'electron';
import * as Sentry from '@sentry/browser';
import * as Integrations from '@sentry/integrations';
import VueAnalytics from 'vue-analytics';
import './renderer/common/icons';

Vue.use(VueWait);
Vue.use(VueScrollTo);
Vue.use(ElementUI, {
    i18n: (key, value) => i18n.t(key, value),
});

fontawesome.library.add(fontawesomeFreeSolid);
library.add(fas);
Vue.component('fa', FontAwesomeIcon);
Vue.component('chart', ECharts);

const urlParams = new URLSearchParams(window.location.search);
if (urlParams.has('documentation')) {
    new Vue({
        components: { DocumentationApp },
        router: documentationRouter,
        store: documentationStore,
        render: (h) => h(DocumentationApp),
        wait: new VueWait({
            useVuex: true,
        }),
        mounted() {
            // Prevent blank screen in Electron builds
            this.$router.push({ name: 'home-page' });
        },
        i18n,
    } as any).$mount('#app');
} else {
    const sentryConfig = {
        dsn: 'SENTRY_DSN_CHANGE_ME',
        release: `${remote.app
            .getName()
            .toLocaleLowerCase()
            .replace(/ /g, '-')}@${remote.app.getVersion()}`,
        integrations: [new Integrations.Vue({ Vue, attachProps: true })],
        beforeSend(event: Sentry.Event) {
            const message = getMessage(event);
            if (message && message === 'ResizeObserver loop limit exceeded') {
                return null;
            }
            if (process.env.NODE_ENV === 'development') {
                // tslint:disable-next-line:no-console
                console.log(event);
            }
            if (shouldShowError(message)) {
                showError(message);
            }
            if (process.env.NODE_ENV === 'development') {
                return null;
            } else {
                return event;
            }
        },
    };
    if (process.env.NODE_ENV !== 'development' && !sentryConfig.dsn.includes('CHANGE_ME')) {
        Sentry.init(sentryConfig);
    }

    function getMessage(event: Sentry.Event): string {
        if (event.message) {
            return event.message;
        }
        if (
            event.exception &&
            event.exception.values &&
            event.exception.values[0] &&
            event.exception.values[0].value
        ) {
            return event.exception.values[0].value;
        }

        return '';
    }

    function shouldShowError(message: string): boolean {
        // Ignore NavigationDuplicated exception from vue-router
        return (
            !!message &&
            !message.includes('Navigating to current location') &&
            !message.includes("Cannot read property 'readyState' of null")
        );
    }

    async function showError(errorMessage) {
        try {
            await MessageBox.confirm(errorMessage, 'Error', {
                confirmButtonText: i18n.t('Reload app').toString(),
                cancelButtonText: 'Ok',
            });
            remote.getCurrentWindow().reload();
        } catch (e) {
            // User clicked Ok or Closed the dialog
        }
    }

    const googleAnalyticsConfig = {
        id: 'GA_CHANGE_ME',
        router,
        debug: {
            sendHitTask: process.env.NODE_ENV !== 'development',
        },
        set: [
            { field: 'checkProtocolTask', value: null },
            { field: 'checkStorageTask', value: null },
            { field: 'anonymizeIp', value: true },
        ],
    };
    if (process.env.NODE_ENV !== 'development' && !googleAnalyticsConfig.id.includes('CHANGE_ME')) {
        Vue.use(VueAnalytics, googleAnalyticsConfig);
    }

    new Vue({
        components: { App },
        router,
        store,
        render: (h) => h(App),
        wait: new VueWait({
            useVuex: true,
        }),
        mounted() {
            // Prevent blank screen in Electron builds
            this.$router.push({ name: 'loading-page', params: { previousRoutePath: '/' } });
        },
        i18n,
    } as any).$mount('#app');
}
