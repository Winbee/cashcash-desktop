import { utcToZonedTime } from 'date-fns-tz';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import i18n from '@/renderer/common/i18n/i18n';

export default class DateUtils {
    static OLD_TZ = (window as any).OLD_TZ || 'UTC';

    static newDate() {
        const newDate = utcToZonedTime(new Date(), DateUtils.OLD_TZ);
        return newDate;
    }

    static formatHumanDate(date: Date): string {
        if (date) {
            const options = i18n.locale === 'fr' ? { locale: fr } : {};
            return format(date, 'MMM dd, yyyy', options);
        } else {
            return '';
        }
    }

    static formatHumanMonth(date: Date): string {
        if (date) {
            const options = i18n.locale === 'fr' ? { locale: fr } : {};
            return format(date, 'MMMM yyyy', options);
        } else {
            return '';
        }
    }

    static formatDate(date: Date): string {
        const options = i18n.locale === 'fr' ? { locale: fr } : {};
        return format(date, 'yyyy-MM-dd', options);
    }

    static formatDateTime(date: Date): string {
        const options = i18n.locale === 'fr' ? { locale: fr } : {};
        return format(date, 'yyyy-MM-dd HH:mm:ss.SSS', options);
    }

    static formatTime(date: Date): string {
        const options = i18n.locale === 'fr' ? { locale: fr } : {};
        return format(date, 'HH:mm:ss', options);
    }
}
