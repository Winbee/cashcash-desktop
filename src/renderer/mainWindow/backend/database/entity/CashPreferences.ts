import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm';
import CashResource from './CashResource';
import JsonTransformer from '../transformer/JsonTransformer';
import CashPreferencesJson from './proxy/CashPreferencesJson';
import CashCurrency from './CashCurrency';

@Entity({ name: 'cash_preferences' })
export default class CashPreferences extends CashResource {
    @Column({
        name: 'jsonPreferences',
        type: 'clob',
        transformer: new JsonTransformer<CashPreferencesJson>(),
    })
    jsonPreferences: CashPreferencesJson;

    @ManyToOne((type) => CashCurrency, (cashCurrency) => cashCurrency.cashPreferencesList)
    @JoinColumn({ name: 'preferedCurrencyId', referencedColumnName: 'id' })
    preferedCurrency: CashCurrency;

    @Column({ name: 'preferedCurrencyId', nullable: true })
    preferedCurrencyId: number;

    @Column({ name: 'uuid', type: 'varchar', length: 40 })
    uuid: string;

    constructor(jsonObj: any = {}) {
        super(jsonObj);
        if (jsonObj.jsonPreferences != null) {
            this.jsonPreferences = {
                ...DEFAULT_PREFERENCES,
                ...jsonObj.jsonPreferences,
            };
        } else {
            this.jsonPreferences = DEFAULT_PREFERENCES;
        }
    }
}

Object.defineProperty(CashPreferences, 'name', { value: 'CashPreferences' });

export const DEFAULT_PREFERENCES: CashPreferencesJson = {
    sidebarIsOpen: true,
    showActiveAccountOnly: false,
    groupByParentAccounts: true,
    showTopTen: true,
    showTooltip: true,
    lang: 'en',
    invertIncAndExp: true,
};
