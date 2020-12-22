import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import CashAccount from './CashAccount';
import CashCurrency from './CashCurrency';
import CashResource from './CashResource';
import CashTransaction from './CashTransaction';
import AmountTransformer from '../transformer/AmountTransformer';
import CashTransactionType from './enumeration/CashTransactionType';

@Entity({ name: 'cash_split' })
export default class CashSplit extends CashResource {
    static convertArray(jsonList: any[]): CashSplit[] {
        const splitList: CashSplit[] = [];
        for (const jsonObj of jsonList) {
            const item = new CashSplit(jsonObj);
            splitList.push(item);
        }
        return splitList;
    }

    @Column({
        name: 'amountCent',
        type: 'integer',
        transformer: new AmountTransformer(),
    })
    amount: string;

    @ManyToOne((type) => CashAccount, (cashAccount) => cashAccount.cashSplitList)
    @JoinColumn({ name: 'accountId', referencedColumnName: 'id' })
    account: CashAccount;

    @Column({ name: 'accountId', nullable: true })
    accountId: number;

    @ManyToOne((type) => CashCurrency, (cashCurrency) => cashCurrency.cashSplitList)
    @JoinColumn({ name: 'currencyId', referencedColumnName: 'id' })
    currency: CashCurrency;

    @Column({ name: 'currencyId', nullable: true })
    currencyId: number;

    @ManyToOne((type) => CashTransaction, (cashTransaction) => cashTransaction.cashSplitList)
    @JoinColumn({ name: 'transactionId', referencedColumnName: 'id' })
    transaction: CashTransaction;

    @Column({ name: 'transactionId', nullable: true })
    transactionId: number;

    @Column({ name: 'transactionDescription', type: 'varchar', length: 100 })
    transactionDescription: string;

    @Column({ name: 'transactionType', type: 'varchar', length: 20 })
    transactionType: CashTransactionType;

    @Column({ name: 'transactionDate', type: 'datetime' })
    @Index()
    transactionDate: Date;

    @Column({
        name: 'otherSplitAmountCent',
        type: 'integer',
        transformer: new AmountTransformer(),
    })
    otherSplitAmount: string;

    @Column({ name: 'otherSplitAccountId', nullable: true })
    otherSplitAccountId: number;

    @Column({ name: 'otherSplitCurrencyId', nullable: true })
    otherCurrencyId: number;

    @Column({ name: 'isToSplit', type: 'boolean', nullable: false })
    isToSplit: boolean;

    constructor(jsonObj?: any) {
        super(jsonObj);
        if (jsonObj) {
            if (jsonObj.amount != null) {
                this.amount = jsonObj.amount;
            }
            if (jsonObj.account != null) {
                this.account = new CashAccount(jsonObj.account);
                this.accountId = jsonObj.account.id;
            } else if (jsonObj.accountId != null) {
                this.accountId = jsonObj.accountId;
            }
            if (jsonObj.currency != null) {
                this.currency = new CashCurrency(jsonObj.currency);
                this.currencyId = jsonObj.currency.id;
            } else if (jsonObj.currencyId != null) {
                this.currencyId = jsonObj.currencyId;
            }
            if (jsonObj.transaction != null) {
                this.transaction = jsonObj.transaction;
                this.transactionId = jsonObj.transaction.id;
            } else if (jsonObj.transactionId != null) {
                this.transactionId = jsonObj.transactionId;
            }
            if (jsonObj.transactionDescription != null) {
                this.transactionDescription = jsonObj.transactionDescription;
            }
            if (jsonObj.transactionType != null) {
                this.transactionType = jsonObj.transactionType;
            }
            if (jsonObj.transactionDate != null) {
                this.transactionDate = jsonObj.transactionDate;
            }
            if (jsonObj.otherSplitAmount != null) {
                this.otherSplitAmount = jsonObj.otherSplitAmount;
            }
            if (jsonObj.otherSplitAccountId != null) {
                this.otherSplitAccountId = jsonObj.otherSplitAccountId;
            }
            if (jsonObj.otherCurrencyId != null) {
                this.otherCurrencyId = jsonObj.otherCurrencyId;
            }
            this.isToSplit = !!jsonObj.isToSplit;
        }
    }

    toString(): string {
        // tslint:disable-next-line:max-line-length
        return `CashSplit (accountId: ${this.accountId}, currencyId: ${
            this.currencyId
        }, amount: ${this.amount.toString()},)`;
    }
}

Object.defineProperty(CashSplit, 'name', { value: 'CashSplit' });
