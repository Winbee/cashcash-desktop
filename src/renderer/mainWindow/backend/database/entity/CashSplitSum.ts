import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import CashAccount from './CashAccount';
import CashCurrency from './CashCurrency';
import CashResource from './CashResource';
import AmountTransformer from '../transformer/AmountTransformer';

@Entity()
export default class CashSplitSum extends CashResource {
    @Column({
        name: 'amountCent',
        type: 'integer',
        transformer: new AmountTransformer(),
    })
    amount: string;

    @ManyToOne((type) => CashAccount, (cashAccount) => cashAccount.cashSplitSumList)
    @JoinColumn({ name: 'accountId', referencedColumnName: 'id' })
    account: CashAccount;

    @Column({ name: 'accountId', nullable: true })
    accountId: number;

    @ManyToOne((type) => CashCurrency, (cashCurrency) => cashCurrency.cashSplitList)
    @JoinColumn({ name: 'currencyId', referencedColumnName: 'id' })
    currency: CashCurrency;

    @Column({ name: 'currencyId', nullable: true })
    currencyId: number;

    transactionDate: Date;

    constructor(jsonObj?: any) {
        super(jsonObj);
        if (jsonObj) {
            if (jsonObj.amount != null) {
                this.amount = jsonObj.amount;
            }
            if (jsonObj.account != null) {
                this.account = new CashAccount(jsonObj.account);
            } else if (jsonObj.accountId != null) {
                this.accountId = jsonObj.accountId;
            }
            if (jsonObj.currency != null) {
                this.currency = new CashCurrency(jsonObj.currency);
            } else if (jsonObj.currencyId != null) {
                this.currencyId = jsonObj.currencyId;
            }
            if (jsonObj.transactionDate != null) {
                this.transactionDate = jsonObj.transactionDate;
            }
        }
    }

    toString(): string {
        // tslint:disable-next-line:max-line-length
        return `CashSplitSum (accountId: ${this.accountId}, currencyId: ${
            this.currencyId
        }, amount: ${this.amount.toString()}, transactionDate: ${this.transactionDate})`;
    }
}

Object.defineProperty(CashSplitSum, 'name', { value: 'CashSplitSum' });
