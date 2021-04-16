import { Column, Entity, Index, OneToMany } from 'typeorm';

import CashResource from './CashResource';
import CashSplit from './CashSplit';
import CashTransactionType from './enumeration/CashTransactionType';
import AmountTransformer from '../transformer/AmountTransformer';
import TagTransformer from '../transformer/TagTransformer';

@Entity({ name: 'cash_transaction' })
export default class CashTransaction extends CashResource {
    @OneToMany((type) => CashSplit, (cashSplit) => cashSplit.transaction, {
        cascade: ['insert', 'update', 'remove'],
    })
    cashSplitList: CashSplit[];

    @Column({ name: 'description', type: 'varchar', length: 100 })
    description: string;

    @Column({ name: 'detail', type: 'text', length: 1000 })
    detail: string;

    @Column({ name: 'importId', type: 'varchar', length: 50, nullable: true })
    importId: string;

    @Column({ name: 'transactionDate', type: 'datetime' })
    @Index()
    transactionDate: Date;

    @Column({ name: 'type', type: 'varchar', length: 20 })
    type: CashTransactionType;

    @Column({ name: 'isMultiCurrency', type: 'boolean', nullable: false })
    isMultiCurrency: boolean;

    @Column({
        name: 'fromSplitAmountCent',
        type: 'integer',
        transformer: new AmountTransformer(),
    })
    fromSplitAmount: string;

    @Column({ name: 'fromSplitAccountId', nullable: true })
    fromSplitAccountId: number;

    @Column({ name: 'fromSplitCurrencyId', nullable: true })
    fromSplitCurrencyId: number;

    @Column({
        name: 'toSplitAmountCent',
        type: 'integer',
        transformer: new AmountTransformer(),
    })
    toSplitAmount: string;

    @Column({ name: 'toSplitAccountId', nullable: true })
    toSplitAccountId: number;

    @Column({ name: 'toSplitCurrencyId', nullable: true })
    toSplitCurrencyId: number;

    @Column({
        name: 'tagIds',
        type: 'varchar',
        transformer: new TagTransformer(),
    })
    tagIds: number[];

    constructor(jsonObj: any = {}) {
        super(jsonObj);
        this.isMultiCurrency = jsonObj.isMultiCurrency ? jsonObj.isMultiCurrency : false;
        if (jsonObj.cashSplitList != null) {
            for (const jsonObjCashSplit of jsonObj.cashSplitList) {
                jsonObjCashSplit.transaction = this;
            }
            this.cashSplitList = CashSplit.convertArray(jsonObj.cashSplitList);
        }
        if (jsonObj.description != null) {
            this.description = jsonObj.description;
        }
        if (jsonObj.detail != null) {
            this.detail = jsonObj.detail;
        }
        if (jsonObj.importId != null) {
            this.importId = jsonObj.importId;
        }
        if (jsonObj.transactionDate != null) {
            this.transactionDate = jsonObj.transactionDate;
        }
        if (jsonObj.type != null) {
            this.type = jsonObj.type;
        }
        if (jsonObj.fromSplitAmount != null) {
            this.fromSplitAmount = jsonObj.fromSplitAmount;
        }
        if (jsonObj.fromSplitAccountId != null) {
            this.fromSplitAccountId = jsonObj.fromSplitAccountId;
        }
        if (jsonObj.fromSplitCurrencyId != null) {
            this.fromSplitCurrencyId = jsonObj.fromSplitCurrencyId;
        }
        if (jsonObj.toSplitAmount != null) {
            this.toSplitAmount = jsonObj.toSplitAmount;
        }
        if (jsonObj.toSplitAccountId != null) {
            this.toSplitAccountId = jsonObj.toSplitAccountId;
        }
        if (jsonObj.toSplitCurrencyId != null) {
            this.toSplitCurrencyId = jsonObj.toSplitCurrencyId;
        }
        if (jsonObj.tagIds != null) {
            this.tagIds = jsonObj.tagIds;
        } else {
            this.tagIds = [];
        }
    }
}

Object.defineProperty(CashTransaction, 'name', { value: 'CashTransaction' });
