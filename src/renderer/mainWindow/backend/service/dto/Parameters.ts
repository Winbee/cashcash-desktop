import CashCurrency from '../../database/entity/CashCurrency';
import CashTransactionType from '../../database/entity/enumeration/CashTransactionType';
import CashAccountType from '../../database/entity/enumeration/CashAccountType';

interface ResourceParameters {
    createdDateFrom?: Date;
    createdDateTo?: Date;
    updatedDateFrom?: Date;
    updatedDateTo?: Date;
}

export interface AccountParameters extends ResourceParameters {
    currencyIdList: number[];
    accountIdList: number[];
    accountTypeList: CashAccountType[];
    searchString?: string;
    isLeaf?: boolean;
}

export interface TransactionParameters extends ResourceParameters {
    accountIdList: number[];
    fromAccountIdList: number[];
    toAccountIdList: number[];
    currencyIdList: number[];
    transactionTypeList: CashTransactionType[];
    accountTypeList: CashAccountType[];
    transactionDateFrom?: Date;
    transactionDateTo?: Date;
    searchString?: string;
    detailSearchString?: string;
    amountEquals?: number;
    amountLessThan?: number;
    amountGreaterThan?: number;
    outputCurrency?: CashCurrency;
    tagIdList: number[];
}

export interface SplitParameters extends TransactionParameters {
    splitAccountIdList?: number[];
}

export interface TransactionDatabaseParameters extends ResourceParameters {
    accountIdList: number[];
    currencyIdList: number[];
    transactionTypeList: CashTransactionType[];
    transactionDateFrom?: Date;
    transactionDateTo?: Date;
    searchString?: string;
    amountLessThan?: number;
    amountGreaterThan?: number;
}

export interface RateParameters extends ResourceParameters {
    currencyIdList?: number[];
}

export interface RuleParameters extends ResourceParameters {
    searchString?: string;
    accountIdList?: number[];
}

export interface TagParameters extends ResourceParameters {
    searchString?: string;
}

export interface BudgetSheetParameters extends ResourceParameters {
    searchString?: string;
    accountIdList?: number[];
}

export interface ImportConfigParameters extends ResourceParameters {
    searchString?: string;
}

export const simpleTransactionParameters: TransactionParameters = {
    accountIdList: [],
    fromAccountIdList: [],
    toAccountIdList: [],
    currencyIdList: [],
    transactionTypeList: [],
    accountTypeList: [],
    tagIdList: [],
};

export const simpleAccountParameters: AccountParameters = {
    accountIdList: [],
    currencyIdList: [],
    accountTypeList: [],
};
