import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

import CashResource from './CashResource';
import CashCurrency from './CashCurrency';
import DateUtils from '../../utils/DateUtils';

@Entity({ name: 'cash_rate' })
export default class CashRate extends CashResource {
    @ManyToOne((type) => CashCurrency, (cashCurrency) => cashCurrency.cashSplitList)
    @JoinColumn({ name: 'fromCurrencyId', referencedColumnName: 'id' })
    fromCurrency: CashCurrency;

    @Column({ name: 'fromCurrencyId', nullable: true })
    fromCurrencyId: number;

    @ManyToOne((type) => CashCurrency, (cashCurrency) => cashCurrency.cashSplitList)
    @JoinColumn({ name: 'toCurrencyId', referencedColumnName: 'id' })
    toCurrency: CashCurrency;

    @Column({ name: 'toCurrencyId', nullable: true })
    toCurrencyId: number;

    @Column({ name: 'rate', type: 'varchar', length: 10 })
    rate: string;

    @Column({ name: 'validityDate', type: 'datetime' })
    validityDate: Date;

    constructor(jsonObj: any = {}) {
        super(jsonObj);
        if (jsonObj.fromCurrency != null) {
            this.fromCurrency = jsonObj.fromCurrency;
            this.fromCurrencyId = jsonObj.fromCurrency.id;
        } else if (jsonObj.fromCurrencyId != null) {
            this.fromCurrencyId = jsonObj.fromCurrencyId;
        }

        if (jsonObj.toCurrency != null) {
            this.toCurrency = jsonObj.toCurrency;
            this.toCurrencyId = jsonObj.toCurrency.id;
        } else if (jsonObj.toCurrencyId != null) {
            this.toCurrencyId = jsonObj.toCurrencyId;
        }

        if (jsonObj.rate != null) {
            this.rate = jsonObj.rate;
        }
        this.validityDate = DateUtils.newDate();
    }
}

Object.defineProperty(CashRate, 'name', { value: 'CashRate' });
