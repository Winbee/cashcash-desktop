import { Container, Service } from 'typedi';
import CashRateService from './CashRateService';
import Big from 'big.js';
import CashRate from '../database/entity/CashRate';
import CashCurrency from '../database/entity/CashCurrency';
import GenericSplit from './dto/GenericSplit';
import GraphSplit from './dto/GraphSplit';
import ConvertedSplit from './dto/ConvertedSplit';
import RateNotFoundError from '../database/entity/error/RateNotFoundError';
import GraphSplitExtended from './dto/GraphSplitExtended';
import CashSplit from '../database/entity/CashSplit';
import ConvertedSplitExtended from './dto/ConvertedSplitExtended';

@Service()
export default class CashConverterService {
    convertToGraphSplitListAndGetActiveAccounts(
        cashSplitList: ConvertedSplitExtended[],
    ): {
        splitList: GraphSplitExtended[];
        activeAccountIdSet: Set<number>;
    } {
        const splitList: GraphSplitExtended[] = [];
        const activeAccountIdSet: Set<number> = new Set();
        for (const cashSplit of cashSplitList) {
            const result = this.convertToGraphSplitExtended(cashSplit);
            splitList.push(result);
            activeAccountIdSet.add(cashSplit.accountId);
        }
        return {
            splitList,
            activeAccountIdSet,
        };
    }

    convertToGraphSplitList(cashSplitList: ConvertedSplit[]): GraphSplit[] {
        const resultList: GraphSplit[] = [];
        for (const cashSplit of cashSplitList) {
            const result = this.convertToGraphSplit(cashSplit);
            resultList.push(result);
        }
        return resultList;
    }

    convertToGraphSplit(cashSplit: ConvertedSplit): GraphSplit {
        return {
            amount: +cashSplit.amount,
            accountId: cashSplit.accountId,
            currencyId: cashSplit.currencyId,
            transactionDate: cashSplit.transactionDate,
            originalAmount: +cashSplit.originalAmount,
            originalCurrencyId: cashSplit.originalCurrencyId,
        };
    }

    convertToGraphSplitExtended(cashSplit: ConvertedSplitExtended): GraphSplitExtended {
        return {
            amount: +cashSplit.amount,
            accountId: cashSplit.accountId,
            currencyId: cashSplit.currencyId,
            transactionDate: cashSplit.transactionDate,
            originalAmount: +cashSplit.originalAmount,
            originalCurrencyId: cashSplit.originalCurrencyId,
            transactionId: cashSplit.transactionId,
            otherSplitAccountId: cashSplit.otherSplitAccountId,
            isToSplit: cashSplit.isToSplit,
        };
    }

    async convertGenericSplitListWithAccountCurrency(
        cashSplitList: GenericSplit[],
        currency: CashCurrency,
    ): Promise<ConvertedSplit[]> {
        const resultList: ConvertedSplit[] = [];

        for (const cashSplit of cashSplitList) {
            const result = await this.convertGenericSplit(cashSplit, currency.id);
            resultList.push(result);
        }
        return resultList;
    }

    async convertGenericSplitList(
        cashSplitList: GenericSplit[],
        expectedCurrency?: CashCurrency,
    ): Promise<ConvertedSplit[]> {
        const resultList: ConvertedSplit[] = [];

        for (const cashSplit of cashSplitList) {
            const convertedCurrencyId = expectedCurrency
                ? expectedCurrency.id
                : cashSplit.currencyId;
            const result = await this.convertGenericSplit(cashSplit, convertedCurrencyId);
            resultList.push(result);
        }
        return resultList;
    }

    async convertCashSplitList(
        cashSplitList: CashSplit[],
        expectedCurrency?: CashCurrency,
    ): Promise<ConvertedSplitExtended[]> {
        const resultList: ConvertedSplitExtended[] = [];

        for (const cashSplit of cashSplitList) {
            const convertedCurrencyId = expectedCurrency
                ? expectedCurrency.id
                : cashSplit.currencyId;
            const result = await this.convertCashSplit(cashSplit, convertedCurrencyId);
            resultList.push(result);
        }
        return resultList;
    }

    private async convertGenericSplit(
        cashSplit: GenericSplit,
        convertedCurrencyId: number | undefined,
    ): Promise<ConvertedSplit> {
        let convertedAmount;
        convertedCurrencyId = convertedCurrencyId ? convertedCurrencyId : cashSplit.currencyId;
        if (cashSplit.currencyId === convertedCurrencyId) {
            convertedAmount = cashSplit.amount;
        } else {
            convertedAmount = await this.convertAmount(
                cashSplit.amount,
                cashSplit.currencyId,
                convertedCurrencyId,
            );
        }
        return {
            amount: convertedAmount,
            accountId: cashSplit.accountId,
            currencyId: convertedCurrencyId,
            transactionDate: cashSplit.transactionDate,
            originalAmount: cashSplit.amount,
            originalCurrencyId: cashSplit.currencyId,
        };
    }

    private async convertCashSplit(
        cashSplit: CashSplit,
        convertedCurrencyId: number | undefined,
    ): Promise<ConvertedSplitExtended> {
        let convertedAmount;
        convertedCurrencyId = convertedCurrencyId ? convertedCurrencyId : cashSplit.currencyId;
        if (cashSplit.currencyId === convertedCurrencyId) {
            convertedAmount = cashSplit.amount;
        } else {
            convertedAmount = await this.convertAmount(
                cashSplit.amount,
                cashSplit.currencyId,
                convertedCurrencyId,
            );
        }
        return {
            amount: convertedAmount,
            accountId: cashSplit.accountId,
            currencyId: convertedCurrencyId,
            transactionDate: cashSplit.transactionDate,
            originalAmount: cashSplit.amount,
            originalCurrencyId: cashSplit.currencyId,
            transactionId: cashSplit.transactionId,
            otherSplitAccountId: cashSplit.otherSplitAccountId,
            isToSplit: cashSplit.isToSplit,
        };
    }

    private async convertAmount(
        amount: string,
        currentCurrencyId: number,
        expectedCurrencyId: number,
    ): Promise<string> {
        if (currentCurrencyId === expectedCurrencyId) {
            return amount;
        } else {
            const convertionRate = await this.getConvertionRate(
                expectedCurrencyId,
                currentCurrencyId,
            );
            return new Big(amount).mul(new Big(convertionRate.rate)).valueOf();
        }
    }

    private async getConvertionRate(
        expectedCurrencyId: number,
        actualCurrencyId: number,
    ): Promise<CashRate> {
        const cashRateService = Container.get(CashRateService);
        const result = await cashRateService.getByCurrency(actualCurrencyId, expectedCurrencyId);
        if (!result) {
            throw new RateNotFoundError(actualCurrencyId, expectedCurrencyId);
        }
        return result;
    }
}
