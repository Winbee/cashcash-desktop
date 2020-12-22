export enum NumberTestMethodType {
    EQUALS = 'EQUALS',
    LESS_THAN = 'LESS_THAN',
    GREATER_THAN = 'GREATER_THAN',
}

export enum StringTestMethodType {
    CONTAINS = 'CONTAINS',
}

export enum EnumOrObjectTestMethodType {
    EQUALS = 'EQUALS',
}

export enum AccountTestMethodType {
    ANY_EQUALS = 'ANY_EQUALS',
    FROM_EQUALS = 'FROM_EQUALS',
    TO_EQUALS = 'TO_EQUALS',
}

export enum FieldNameDetectionType {
    DESCRIPTION = 'DESCRIPTION',
    DETAILS = 'DETAILS',
    TRANSACTION_TYPE = 'TRANSACTION_TYPE',
    ACCOUNT = 'ACCOUNT',
    AMOUNT = 'AMOUNT',
    CURRENCY = 'CURRENCY',
}

export enum FieldNameActionType {
    TRANSACTION_TYPE = 'TRANSACTION_TYPE',
    ACCOUNT_FROM = 'ACCOUNT_FROM',
    ACCOUNT_TO = 'ACCOUNT_TO',
}

// detection
// description contains:
// details contains:
// transaction type is:
// amount equals
// amount is lower than
// amount is greater than
// currency is

// action
// transaction type assign
// account from assign
// account to assign
