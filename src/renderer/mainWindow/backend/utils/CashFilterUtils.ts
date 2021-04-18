import { JsonFilter } from '../database/entity/proxy/JsonFilter';
import { TransactionParameters } from '../service/dto/Parameters';
import {
    FieldNameDetectionType,
    NumberTestMethodType,
    AccountTestMethodType,
    EnumOrObjectTestMethodType,
    StringTestMethodType,
} from '../database/entity/proxy/CashRuleV1';
import { OneJsonFilter } from '../database/entity/proxy/OneJsonFilter';
import FlatCashTransaction from '../database/entity/proxy/FlatCashTransaction';
import CashFilter from '../database/entity/CashFilter';
import StringUtils from './StringUtils';
import CashTag from '../database/entity/CashTag';

export default class CashFilterUtils {
    static convertToParameters(jsonFilter: JsonFilter): TransactionParameters {
        const transactionParameters: TransactionParameters = {
            accountIdList: [],
            fromAccountIdList: [],
            toAccountIdList: [],
            currencyIdList: [],
            transactionTypeList: [],
            accountTypeList: [],
            tagIdList: [],
        };

        if (jsonFilter.list && jsonFilter.list.length > 0) {
            for (const oneJsonFilter of jsonFilter.list) {
                const { fieldName, testMethod, parameter } = oneJsonFilter;

                switch (fieldName) {
                    case FieldNameDetectionType.DESCRIPTION: {
                        transactionParameters.searchString = parameter;
                        break;
                    }
                    case FieldNameDetectionType.DETAILS: {
                        transactionParameters.detailSearchString = parameter;
                        break;
                    }
                    case FieldNameDetectionType.TRANSACTION_TYPE: {
                        transactionParameters.transactionTypeList.push(parameter as any);
                        break;
                    }
                    case FieldNameDetectionType.ACCOUNT: {
                        switch (testMethod) {
                            case AccountTestMethodType.ANY_EQUALS: {
                                transactionParameters.accountIdList.push(+parameter);
                                break;
                            }
                            case AccountTestMethodType.FROM_EQUALS: {
                                transactionParameters.fromAccountIdList.push(+parameter);
                                break;
                            }
                            case AccountTestMethodType.TO_EQUALS: {
                                transactionParameters.toAccountIdList.push(+parameter);
                                break;
                            }
                        }
                        break;
                    }
                    case FieldNameDetectionType.AMOUNT: {
                        switch (testMethod) {
                            case NumberTestMethodType.EQUALS: {
                                transactionParameters.amountEquals = +parameter;
                                break;
                            }
                            case NumberTestMethodType.LESS_THAN: {
                                transactionParameters.amountLessThan = +parameter;
                                break;
                            }
                            case NumberTestMethodType.GREATER_THAN: {
                                transactionParameters.amountGreaterThan = +parameter;
                                break;
                            }
                        }
                        break;
                    }
                    case FieldNameDetectionType.CURRENCY: {
                        transactionParameters.currencyIdList.push(+parameter as any);
                        break;
                    }
                    case FieldNameDetectionType.TAG: {
                        transactionParameters.tagIdList.push(+parameter as any);
                        break;
                    }
                }
            }
        }

        return transactionParameters;
    }

    static convertToCashFilter(parameters: TransactionParameters): CashFilter {
        const filter = new CashFilter();
        filter.jsonFilter = CashFilterUtils.convertToJsonFilter(parameters);
        return filter;
    }

    static convertToJsonFilter(parameters: TransactionParameters): JsonFilter {
        const jsonFilter: JsonFilter = {
            list: [],
        };
        if (parameters.accountIdList && parameters.accountIdList.length > 0) {
            jsonFilter.list.push(
                new OneJsonFilter({
                    fieldName: FieldNameDetectionType.ACCOUNT,
                    testMethod: AccountTestMethodType.ANY_EQUALS,
                    parameter: '' + parameters.accountIdList[0],
                }),
            );
        }
        if (parameters.fromAccountIdList && parameters.fromAccountIdList.length > 0) {
            jsonFilter.list.push(
                new OneJsonFilter({
                    fieldName: FieldNameDetectionType.ACCOUNT,
                    testMethod: AccountTestMethodType.FROM_EQUALS,
                    parameter: '' + parameters.fromAccountIdList[0],
                }),
            );
        }
        if (parameters.toAccountIdList && parameters.toAccountIdList.length > 0) {
            jsonFilter.list.push(
                new OneJsonFilter({
                    fieldName: FieldNameDetectionType.ACCOUNT,
                    testMethod: AccountTestMethodType.TO_EQUALS,
                    parameter: '' + parameters.toAccountIdList[0],
                }),
            );
        }
        if (parameters.amountEquals) {
            jsonFilter.list.push(
                new OneJsonFilter({
                    fieldName: FieldNameDetectionType.AMOUNT,
                    testMethod: NumberTestMethodType.EQUALS,
                    parameter: '' + parameters.amountEquals,
                }),
            );
        }
        if (parameters.amountGreaterThan) {
            jsonFilter.list.push(
                new OneJsonFilter({
                    fieldName: FieldNameDetectionType.AMOUNT,
                    testMethod: NumberTestMethodType.GREATER_THAN,
                    parameter: '' + parameters.amountGreaterThan,
                }),
            );
        }
        if (parameters.amountLessThan) {
            jsonFilter.list.push(
                new OneJsonFilter({
                    fieldName: FieldNameDetectionType.AMOUNT,
                    testMethod: NumberTestMethodType.LESS_THAN,
                    parameter: '' + parameters.amountLessThan,
                }),
            );
        }
        if (parameters.currencyIdList && parameters.currencyIdList.length > 0) {
            jsonFilter.list.push(
                new OneJsonFilter({
                    fieldName: FieldNameDetectionType.CURRENCY,
                    testMethod: EnumOrObjectTestMethodType.EQUALS,
                    parameter: '' + parameters.currencyIdList[0],
                }),
            );
        }
        if (parameters.detailSearchString) {
            jsonFilter.list.push(
                new OneJsonFilter({
                    fieldName: FieldNameDetectionType.DETAILS,
                    testMethod: StringTestMethodType.CONTAINS,
                    parameter: '' + parameters.detailSearchString,
                }),
            );
        }
        if (parameters.searchString) {
            jsonFilter.list.push(
                new OneJsonFilter({
                    fieldName: FieldNameDetectionType.DESCRIPTION,
                    testMethod: StringTestMethodType.CONTAINS,
                    parameter: '' + parameters.searchString,
                }),
            );
        }
        if (parameters.transactionTypeList && parameters.transactionTypeList.length > 0) {
            jsonFilter.list.push(
                new OneJsonFilter({
                    fieldName: FieldNameDetectionType.TRANSACTION_TYPE,
                    testMethod: EnumOrObjectTestMethodType.EQUALS,
                    parameter: '' + parameters.transactionTypeList[0],
                }),
            );
        }
        if (parameters.tagIdList && parameters.tagIdList.length > 0) {
            jsonFilter.list.push(
                new OneJsonFilter({
                    fieldName: FieldNameDetectionType.TAG,
                    testMethod: EnumOrObjectTestMethodType.EQUALS,
                    parameter: '' + parameters.tagIdList[0],
                }),
            );
        }
        return jsonFilter;
    }

    static initFromTransaction(transaction: FlatCashTransaction): CashFilter {
        const filter = new CashFilter();
        filter.jsonFilter = {
            list: [],
        };
        const filterList = filter.jsonFilter.list;
        if (transaction.type) {
            const jsonFilter = new OneJsonFilter();
            jsonFilter.fieldName = FieldNameDetectionType.TRANSACTION_TYPE;
            jsonFilter.testMethod = EnumOrObjectTestMethodType.EQUALS;
            jsonFilter.parameter = transaction.type;
            filterList.push(jsonFilter);
        }
        if (transaction.outAccount) {
            const jsonFilter = new OneJsonFilter();
            jsonFilter.fieldName = FieldNameDetectionType.ACCOUNT;
            jsonFilter.testMethod = AccountTestMethodType.FROM_EQUALS;
            jsonFilter.parameter = transaction.outAccount.id.toString();
            filterList.push(jsonFilter);
        }
        if (transaction.inAccount) {
            const jsonFilter = new OneJsonFilter();
            jsonFilter.fieldName = FieldNameDetectionType.ACCOUNT;
            jsonFilter.testMethod = AccountTestMethodType.TO_EQUALS;
            jsonFilter.parameter = transaction.inAccount.id.toString();
            filterList.push(jsonFilter);
        }
        if (transaction.amount) {
            const jsonFilter = new OneJsonFilter();
            jsonFilter.fieldName = FieldNameDetectionType.AMOUNT;
            jsonFilter.testMethod = NumberTestMethodType.EQUALS;
            jsonFilter.parameter = transaction.amount.toString();
            filterList.push(jsonFilter);
        }
        if (transaction.currency) {
            const jsonFilter = new OneJsonFilter();
            jsonFilter.fieldName = FieldNameDetectionType.CURRENCY;
            jsonFilter.testMethod = EnumOrObjectTestMethodType.EQUALS;
            jsonFilter.parameter = transaction.currency.id.toString();
            filterList.push(jsonFilter);
        }
        if (transaction.description && transaction.description.length > 0) {
            const jsonFilter = new OneJsonFilter();
            jsonFilter.fieldName = FieldNameDetectionType.DESCRIPTION;
            jsonFilter.testMethod = StringTestMethodType.CONTAINS;
            jsonFilter.parameter = StringUtils.tokenize(transaction.description);
            filterList.push(jsonFilter);
        }
        if (transaction.tagIdList && transaction.tagIdList.length > 0) {
            const jsonFilter = new OneJsonFilter();
            jsonFilter.fieldName = FieldNameDetectionType.TAG;
            jsonFilter.testMethod = EnumOrObjectTestMethodType.EQUALS;
            jsonFilter.parameter = '' + transaction.tagIdList[0];
            filterList.push(jsonFilter);
        }

        return filter;
    }

    static cleanUpDeletedTag(item: TransactionParameters, existingTags: CashTag[]) {
        if (item.tagIdList && item.tagIdList.length > 0) {
            const existingTagIdList = existingTags.map((item) => item.id);
            const cleanedUpList = item.tagIdList.filter((item) =>
                existingTagIdList.includes(+item),
            );
            item.tagIdList = cleanedUpList;
        }
    }
}
