import { Column, Entity, OneToMany } from 'typeorm';
import CashAccount from './CashAccount';
import CashResource from './CashResource';
import CashSplit from './CashSplit';
import CashSplitSum from './CashSplitSum';
import CashPreferences from './CashPreferences';

@Entity({ name: 'cash_currency' })
export default class CashCurrency extends CashResource {
    static convertArray(jsonList: any[]): CashCurrency[] {
        const currencyList: CashCurrency[] = [];
        for (const jsonObj of jsonList) {
            const item = new CashCurrency(jsonObj);
            currencyList.push(item);
        }
        return currencyList;
    }

    @OneToMany((type) => CashAccount, (cashAccount) => cashAccount.currency)
    cashAccountList: Promise<CashAccount[]>;

    @Column({ name: 'name', type: 'varchar', length: 20 })
    name: string;

    @Column({ name: 'isoCode', type: 'varchar', length: 3, unique: true })
    isoCode: string;

    @Column({ name: 'symbol', type: 'varchar', length: 5 })
    symbol: string;

    @OneToMany((type) => CashSplit, (cashSplit) => cashSplit.currency)
    cashSplitList: Promise<CashSplit[]>;

    @OneToMany((type) => CashSplitSum, (cashSplitSum) => cashSplitSum.currency)
    cashSplitSumList: Promise<CashSplitSum[]>;

    @OneToMany((type) => CashPreferences, (cashPreferences) => cashPreferences.preferedCurrency)
    cashPreferencesList: Promise<CashPreferences[]>;

    constructor(jsonObj?: any) {
        super(jsonObj);
        if (jsonObj) {
            if (jsonObj.name != null) {
                this.name = jsonObj.name;
            }
            if (jsonObj.isoCode != null) {
                this.isoCode = jsonObj.isoCode;
            }
            if (jsonObj.symbol != null) {
                this.symbol = jsonObj.symbol;
            }
        }
    }
}

Object.defineProperty(CashCurrency, 'name', { value: 'CashCurrency' });
