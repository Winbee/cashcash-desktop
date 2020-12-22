import VueI18n from 'vue-i18n';
import fr from '../../../locales/fr.json';
import en from '../../../locales/en.json';
import Vue from 'vue';
import enLocale from 'element-ui/lib/locale/lang/en';
import frLocale from 'element-ui/lib/locale/lang/fr';

Vue.use(VueI18n);

const messages = {
    en: {
        ...en,
        ...enLocale,
    },
    fr: {
        ...fr,
        ...frLocale,
    },
};

export default new VueI18n({
    locale: 'fr', // set locale
    messages, // set locale messages
    fallbackLocale: 'en',
    formatFallbackMessages: true,
    silentTranslationWarn: true,
});
