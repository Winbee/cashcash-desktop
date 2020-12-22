import { TransactionParameters } from '../service/dto/Parameters';
import CashAccountUtils from './CashAccountUtils';
import GraphSplit from '../service/dto/GraphSplit';
import _ from 'lodash';
import { AccountCurrencyKey } from '../database/entity/proxy/CashKey';
import CashAccount from '../database/entity/CashAccount';
import {
    isSameDay,
    isSameMonth,
    isEqual,
    startOfDay,
    startOfMonth,
    subMonths,
    format,
} from 'date-fns';
import GraphSplitExtended from '../service/dto/GraphSplitExtended';
import ActivitySplit from '../service/dto/ActivitySplit';
import DateUtils from './DateUtils';
import InOutType from '../database/entity/enumeration/InOutType';
import InOutSplitMap from '../service/dto/InOutSplitMap';

export default class GraphUtils {
    static filterData<T extends GraphSplit>(
        split: T[],
        parameters: TransactionParameters,
        accountMap: Map<number, CashAccount>,
        filterByDirection?: 'isToSplit' | 'isFromSplit',
    ): T[] {
        if (parameters.accountIdList && parameters.accountIdList.length > 0) {
            split = split.filter((s) => parameters.accountIdList.includes(+s.accountId));
        }
        if (parameters.accountTypeList && parameters.accountTypeList.length > 0) {
            split = split.filter((s) =>
                parameters.accountTypeList.includes(accountMap.get(s.accountId)!.type),
            );
        }
        if (filterByDirection) {
            if (filterByDirection === 'isToSplit') {
                split = split.filter((s) => s.amount >= 0);
            } else {
                split = split.filter((s) => s.amount < 0);
            }
        }
        return split;
    }

    static filterDataExtended<T extends GraphSplitExtended>(
        split: T[],
        parameters: TransactionParameters,
        accountMap: Map<number, CashAccount>,
    ): T[] {
        if (parameters.accountIdList && parameters.accountIdList.length > 0) {
            split = split.filter(
                (s) =>
                    parameters.accountIdList.includes(+s.accountId) &&
                    !parameters.accountIdList.includes(+s.otherSplitAccountId),
            );
        }
        if (parameters.accountTypeList && parameters.accountTypeList.length > 0) {
            split = split.filter((s) =>
                parameters.accountTypeList.includes(accountMap.get(s.accountId)!.type),
            );
        }
        return split;
    }

    static keepOneTransaction<T extends GraphSplitExtended>(splitList: T[]): T[] {
        const finalList: T[] = [];
        let previousTransactionId: number | null = null;
        for (const split of splitList) {
            if (split.transactionId !== previousTransactionId) {
                finalList.push(split);
            }
            previousTransactionId = split.transactionId;
        }
        return finalList;
    }

    static convertToActivitySplit<T extends GraphSplitExtended>(splitList: T[]): ActivitySplit[] {
        const finalList: ActivitySplit[] = [];
        for (const split of splitList) {
            finalList.push({
                stringTransactionDate: DateUtils.formatDate(split.transactionDate),
                amount: Math.abs(split.amount),
                currencyId: split.currencyId,
                nbOfTransactions: 1,
            });
        }
        return finalList;
    }

    static mapToAccountLevel<T extends GraphSplit>(
        splitList: T[],
        accountMap: Map<number, CashAccount>,
        level: number,
        useOtherSplitAccountId: boolean = false,
    ): T[] {
        const accountField = useOtherSplitAccountId ? 'otherSplitAccountId' : 'accountId';
        for (const split of splitList) {
            const account = CashAccountUtils.getAccountParent(
                split[accountField],
                accountMap,
                level,
            );
            if (account && CashAccountUtils.isExternal(account)) {
                split[accountField] = account.id;
            }
        }
        return splitList;
    }

    static inverseAmount<T extends GraphSplit>(splitList: T[]): T[] {
        return splitList.map((s) => {
            s.amount = -s.amount;
            s.originalAmount = -s.originalAmount;
            return s;
        });
    }

    static mapToAccount<T extends GraphSplit>(splitList: T[], map: Map<number, number>): T[] {
        for (const split of splitList) {
            const targetAccountId = map.get(split.accountId);
            if (targetAccountId) {
                split.accountId = targetAccountId;
            }
        }
        return splitList;
    }

    static reduceToMapOfList<T extends GraphSplit>(
        splitList: T[],
        useOriginalCurrency: boolean = false,
        merged: boolean = false,
    ): Map<AccountCurrencyKey, T[]> {
        const currencyField = useOriginalCurrency ? 'originalCurrencyId' : 'currencyId';
        return splitList.reduce((map: Map<AccountCurrencyKey, T[]>, s: T) => {
            const key = merged
                ? 'merged'
                : CashAccountUtils.generateKey(s.accountId, s[currencyField]);
            let list = map.get(key);
            if (!list) {
                list = [];
                map.set(key, list);
            }
            list.push(s);
            return map;
        }, new Map());
    }

    static reduceToMapOfInOutList<T extends GraphSplit>(splitList: T[]): Map<InOutType, T[]> {
        return splitList.reduce((map: Map<InOutType, T[]>, s: T) => {
            const key = s.amount > 0 ? InOutType.IN : InOutType.OUT;
            s.amount = Math.abs(s.amount);
            s.originalAmount = Math.abs(s.originalAmount);
            let list = map.get(key);
            if (!list) {
                list = [];
                map.set(key, list);
            }
            list.push(s);
            return map;
        }, new Map());
    }

    static reduceToMapOfOne<T extends GraphSplit>(
        splitList: T[],
        useOriginalCurrency: boolean = false,
        merged: boolean = false,
    ): Map<AccountCurrencyKey, T> {
        const amountField = useOriginalCurrency ? 'originalAmount' : 'amount';
        const currencyField = useOriginalCurrency ? 'originalCurrencyId' : 'currencyId';
        const map: Map<AccountCurrencyKey, T> = new Map();
        for (const split of splitList) {
            const key = merged
                ? 'merged'
                : CashAccountUtils.generateKey(split.accountId, split[currencyField]);
            const one = map.get(key);
            if (!one) {
                map.set(key, split);
            } else {
                one[amountField] += split[amountField];
            }
        }
        return map;
    }

    static reduceToMapOfOneExtended<T extends GraphSplitExtended>(
        splitList: T[],
        useOriginalCurrency: boolean = false,
        merged: boolean = false,
        useOtherSplitAccountId: boolean = false,
    ): Map<AccountCurrencyKey, T> {
        const amountField = useOriginalCurrency ? 'originalAmount' : 'amount';
        const currencyField = useOriginalCurrency ? 'originalCurrencyId' : 'currencyId';
        const accountField = useOtherSplitAccountId ? 'otherSplitAccountId' : 'accountId';
        const map: Map<AccountCurrencyKey, T> = new Map();
        for (const split of splitList) {
            const key = merged
                ? 'merged'
                : CashAccountUtils.generateKey(split[accountField], split[currencyField]);
            const one = map.get(key);
            if (!one) {
                map.set(key, split);
            } else {
                one[amountField] += split[amountField];
            }
        }
        return map;
    }

    static reduceToTop<T extends GraphSplit>(
        splitList: T[],
        topNumber: number,
        useOriginalCurrency: boolean = false,
    ): Map<AccountCurrencyKey, T> {
        const amountField = useOriginalCurrency ? 'originalAmount' : 'amount';
        const currencyField = useOriginalCurrency ? 'originalCurrencyId' : 'currencyId';
        // Order from top to bottom
        splitList.sort((a: T, b: T) => Math.abs(b[amountField]) - Math.abs(a[amountField]));

        const map: Map<AccountCurrencyKey, T> = new Map();
        let idx = 0;
        for (const split of splitList) {
            const key =
                idx < topNumber - 1
                    ? CashAccountUtils.generateKey(split.accountId, split[currencyField])
                    : CashAccountUtils.generateKey(-1, split[currencyField]);
            const one = map.get(key);
            if (!one) {
                map.set(key, split);
            } else {
                one[amountField] += split[amountField];
            }
            idx++;
        }
        return map;
    }

    static reduceToTopExtended<T extends GraphSplitExtended>(
        splitList: T[],
        topNumber: number,
        useOriginalCurrency: boolean = false,
        useOtherSplitAccountId: boolean = false,
    ): Map<AccountCurrencyKey, T> {
        const amountField = useOriginalCurrency ? 'originalAmount' : 'amount';
        const currencyField = useOriginalCurrency ? 'originalCurrencyId' : 'currencyId';
        const accountField = useOtherSplitAccountId ? 'otherSplitAccountId' : 'accountId';
        // Order from top to bottom
        splitList.sort((a: T, b: T) => Math.abs(b[amountField]) - Math.abs(a[amountField]));

        const map: Map<AccountCurrencyKey, T> = new Map();
        let idx = 0;
        for (const split of splitList) {
            const key =
                idx < topNumber - 1
                    ? CashAccountUtils.generateKey(split[accountField], split[currencyField])
                    : CashAccountUtils.generateKey(-1, split[currencyField]);
            const one = map.get(key);
            if (!one) {
                map.set(key, split);
            } else {
                one[amountField] += split[amountField];
            }
            idx++;
        }
        return map;
    }

    static reduceToMapOfOneCurrency<T extends GraphSplit>(
        splitList: T[],
        useOriginalCurrency: boolean = false,
    ): Map<number, T> {
        const amountField = useOriginalCurrency ? 'originalAmount' : 'amount';
        return _.cloneDeep(splitList).reduce((map: Map<number, T>, s: T) => {
            const one = map.get(s.accountId);
            if (!one) {
                map.set(s.accountId, s);
            } else {
                one[amountField] += s[amountField];
            }
            return map;
        }, new Map());
    }

    static reduceToInOutMapOfOneCurrency(
        splitList: GraphSplit[],
        useOriginalCurrency: boolean = false,
    ): InOutSplitMap {
        const amountField = useOriginalCurrency ? 'originalAmount' : 'amount';
        return _.cloneDeep(splitList).reduce(
            (inOutMap: InOutSplitMap, s: GraphSplit) => {
                const map = s[amountField] > 0 ? inOutMap.inMap : inOutMap.outMap;
                const one = map.get(s.accountId);
                if (!one) {
                    map.set(s.accountId, s);
                } else {
                    one[amountField] += s[amountField];
                }
                return inOutMap;
            },
            { inMap: new Map(), outMap: new Map() },
        );
    }

    static reduceBySum(
        splitList: GraphSplit[],
        splitSum: GraphSplit,
        useOriginalCurrency: boolean = false,
    ): GraphSplit[] {
        const amountField = useOriginalCurrency ? 'originalAmount' : 'amount';
        const currentSum: GraphSplit = _.clone(splitSum);
        const reducedList = [splitSum];
        for (const split of splitList) {
            const nextSum = currentSum[amountField] - split[amountField];
            split[amountField] = currentSum[amountField];
            currentSum[amountField] = nextSum;
            if (
                !isSameDay(
                    split.transactionDate,
                    reducedList[reducedList.length - 1].transactionDate,
                )
            ) {
                reducedList.push(split);
            }
        }

        return reducedList;
    }

    static reduceByAddingBorderValue(
        splitList: GraphSplit[],
        fromDate: Date,
        toDate: Date,
    ): GraphSplit[] {
        if (toDate && !isEqual(splitList[0].transactionDate, toDate)) {
            const toSplit: GraphSplit = {
                ...splitList[0],
                transactionDate: toDate,
            };
            splitList = [toSplit, ...splitList];
        }
        if (fromDate && !isEqual(splitList[splitList.length - 1].transactionDate, fromDate)) {
            const fromSplit: GraphSplit = {
                ...splitList[splitList.length - 1],
                transactionDate: fromDate,
            };
            splitList = [...splitList, fromSplit];
        }

        return splitList;
    }

    static reduceByMonth(
        splitList: GraphSplit[],
        useOriginalCurrency: boolean = false,
    ): GraphSplit[] {
        const amountField = useOriginalCurrency ? 'originalAmount' : 'amount';
        return splitList.reduce((list: GraphSplit[], s: GraphSplit) => {
            s.transactionDate = startOfMonth(s.transactionDate);
            if (
                list.length === 0 ||
                !isSameMonth(list[list.length - 1].transactionDate, s.transactionDate)
            ) {
                list.push(s);
            } else {
                list[list.length - 1][amountField] += s[amountField];
            }
            return list;
        }, []);
    }

    static reduceByDay(splitList: ActivitySplit[]): ActivitySplit[] {
        return splitList.reduce((list: ActivitySplit[], s: ActivitySplit) => {
            const previousActivitySplit = list.length === 0 ? null : list[list.length - 1];
            if (
                !previousActivitySplit ||
                previousActivitySplit.stringTransactionDate !== s.stringTransactionDate
            ) {
                list.push(s);
            } else {
                previousActivitySplit.amount += Math.abs(s.amount);
                previousActivitySplit.nbOfTransactions += 1;
            }
            return list;
        }, []);
    }

    static reduceByAddingEmptyMonth(
        splitList: GraphSplit[],
        fromDate: Date,
        toDate: Date,
        key: string,
    ): GraphSplit[] {
        const result: GraphSplit[] = [];
        const startOfMonthFromDate = startOfMonth(fromDate);
        const toDateStartOfMonth = startOfMonth(toDate);
        let currentDate = toDateStartOfMonth;
        let index = 0;
        const ids = CashAccountUtils.extractKey(key);
        while (currentDate >= startOfMonthFromDate) {
            const currentSplit = splitList[index];
            if (currentSplit && isSameMonth(currentSplit.transactionDate, currentDate)) {
                result.push(currentSplit);
                index++;
            } else {
                result.push({
                    accountId: ids.accountId,
                    currencyId: ids.currencyId,
                    amount: 0,
                    transactionDate: currentDate,
                    originalCurrencyId: ids.currencyId,
                    originalAmount: 0,
                });
            }
            currentDate = subMonths(currentDate, 1);
        }
        return result;
    }

    static getDarkColorPalette(): string[] {
        return [
            '#cca300',
            '#ef833c',
            '#0b427c',
            '#e24c42',
            '#1f78c1',
            '#447ebc',
            '#705da0',
            '#ba43a8',
            '#508642',
            '#890e02',
            '#6dd0e1',
            '#7eb26d',
            '#eab839',
            '#c15c16',
            '#6d1f62',
            '#584477',
        ];
    }

    static getLightColorPalette(): string[] {
        return [
            '#7087d8',
            '#57c17b',
            '#006e8a',
            '#663db8',
            '#bc51bc',
            '#9e3533',
            '#da9f5e',
            '#bfaf40',
            '#4050bf',
            '#bf4f40',
            '#40afbf',
            '#70bf3f',
            '#8f40bf',
            '#bf40a7',
            '#41bf58',
            '#bf9640',
            '#3f68bf',
            '#bf4048',
            '#40bfb7',
            '#87bf40',
            '#7840bf',
            '#bf4078',
        ];
    }

    static getDefaultColorPalette(): string[] {
        return [
            '#c23531',
            '#2f4554',
            '#61a0a8',
            '#d48265',
            '#91c7ae',
            '#749f83',
            '#ca8622',
            '#bda29a',
            '#6e7074',
            '#546570',
            '#c4ccd3',
        ];
    }
}
