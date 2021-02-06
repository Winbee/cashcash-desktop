import CashResource from '../CashResource';
import CashCurrency from '../CashCurrency';
import CashAccount from '../CashAccount';
import CashTransactionType from '../enumeration/CashTransactionType';
import { startOfDay } from 'date-fns';
import DateUtils from '../../../utils/DateUtils';

export default class FlatCashTransaction extends CashResource {
    description: string;

    detail: string;

    importId: string | null;

    transactionDate: Date;

    currency: CashCurrency;

    exchangeCurrency: CashCurrency | null = null;

    amount: number = 0;

    exchangeAmount: number = 0;

    inAccount: CashAccount;

    outAccount: CashAccount;

    inSplitId: number | null = null;

    outSplitId: number | null = null;

    isMultiCurrency: boolean = false;

    doNotImport: boolean = false;

    type: CashTransactionType;

    uniqTempId: number;

    constructor(jsonObj: any = {}) {
        super(jsonObj);
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
        } else {
            this.transactionDate = startOfDay(DateUtils.newDate());
        }
        if (jsonObj.currency != null) {
            this.currency = new CashCurrency(jsonObj.currency);
        }
        if (jsonObj.exchangeCurrency != null) {
            this.exchangeCurrency = new CashCurrency(jsonObj.exchangeCurrency);
        }
        if (jsonObj.amount != null) {
            this.amount = jsonObj.amount;
        }
        if (jsonObj.exchangeAmount != null) {
            this.exchangeAmount = jsonObj.exchangeAmount;
        }
        if (jsonObj.inAccount != null) {
            this.inAccount = new CashAccount(jsonObj.inAccount);
        }
        if (jsonObj.outAccount != null) {
            this.outAccount = new CashAccount(jsonObj.outAccount);
        }
        if (jsonObj.inSplitId != null) {
            this.inSplitId = jsonObj.inSplitId;
        }
        if (jsonObj.outSplitId != null) {
            this.outSplitId = jsonObj.outSplitId;
        }
        if (jsonObj.isMultiCurrency != null) {
            this.isMultiCurrency = jsonObj.isMultiCurrency;
        }
        if (jsonObj.doNotImport != null) {
            this.doNotImport = jsonObj.doNotImport;
        }
        if (jsonObj.type != null) {
            this.type = jsonObj.type;
        } else {
            this.type = CashTransactionType.INCOME;
        }
        if (jsonObj.uniqTempId != null) {
            this.uniqTempId = jsonObj.uniqTempId;
        } else if (jsonObj.id != null) {
            this.uniqTempId = jsonObj.id;
        } else {
            this.uniqTempId = Math.random();
        }
    }
}
