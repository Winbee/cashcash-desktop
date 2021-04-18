import { Container, Service } from 'typedi';
import { getManager } from 'typeorm';

import CashSplitRepository from '../database/repository/CashSplitRepository';
import CashSplit from '../database/entity/CashSplit';
import CashConverterService from './CashConverterService';
import { simpleTransactionParameters, SplitParameters } from './dto/Parameters';
import CashAccount from '../database/entity/CashAccount';
import GraphUtils from '../utils/GraphUtils';
import GraphSplit from './dto/GraphSplit';
import CashCurrency from '../database/entity/CashCurrency';
import CashAccountUtils from '../utils/CashAccountUtils';
import { startOfMonth, endOfMonth } from 'date-fns';
import DateUtils from '../utils/DateUtils';
import ConvertedSplitExtended from './dto/ConvertedSplitExtended';
import InOutSplitMap from './dto/InOutSplitMap';
import GraphSplitExtended from './dto/GraphSplitExtended';

@Service()
export default class CashSplitService {
    async get(id: string): Promise<CashSplit | undefined> {
        const repo = getManager().getCustomRepository(CashSplitRepository);
        return await repo.findOne(id);
    }

    async getList(): Promise<CashSplit[]> {
        const repo = getManager().getCustomRepository(CashSplitRepository);
        return await repo.find();
    }

    async getListByParam(
        parameters: SplitParameters = simpleTransactionParameters,
        accountMap: Map<number, CashAccount>,
    ): Promise<ConvertedSplitExtended[]> {
        parameters = CashAccountUtils.adaptAccountParamForLeafAccounts(parameters, accountMap);
        const repo = getManager().getCustomRepository(CashSplitRepository);
        const cashSplitList = await repo.findCustom(parameters);

        const converterService = Container.get(CashConverterService);
        return await converterService.convertCashSplitList(
            cashSplitList,
            parameters.outputCurrency,
        );
    }

    async hasSplits(accountId: string) {
        const repo = getManager().getCustomRepository(CashSplitRepository);
        return await repo.hasSplits(accountId);
    }

    async computeSum(
        parameters: SplitParameters,
        accountMap: Map<number, CashAccount>,
    ): Promise<number> {
        parameters = CashAccountUtils.adaptAccountParamForLeafAccounts(parameters, accountMap);
        parameters = {
            ...parameters,
            transactionDateFrom: undefined,
        };
        const repo = getManager().getCustomRepository(CashSplitRepository);
        return await repo.computeSum(parameters);
    }

    async computeSplitSumOfTheMonth(
        graphSplitList: GraphSplit[],
        transactionDate: Date,
        cashCurrency: CashCurrency,
        cashAccountTree: CashAccount[],
    ): Promise<Map<number, GraphSplit>> {
        const transactionDateFrom: Date = startOfMonth(transactionDate);
        const transactionDateTo: Date = endOfMonth(transactionDate);
        // Filter
        const grahSplitListFiltered = graphSplitList.filter(
            (item) =>
                item.transactionDate >= transactionDateFrom &&
                item.transactionDate <= transactionDateTo,
        );

        // Calculate leaf sum
        const graphSplitMap = GraphUtils.reduceToMapOfOneCurrency(grahSplitListFiltered);

        // Calculate branch sum
        this.sumTree(cashAccountTree, cashCurrency, graphSplitMap);

        return graphSplitMap;
    }

    async computeSplitSumOfTheMonthNew(
        graphSplitList: GraphSplit[],
        transactionDate: Date,
        wipBudgetSheet: GraphSplitExtended | null,
    ): Promise<InOutSplitMap> {
        const transactionDateFrom: Date = startOfMonth(transactionDate);
        const transactionDateTo: Date = endOfMonth(transactionDate);
        if (!wipBudgetSheet) {
            return { inMap: new Map(), outMap: new Map() };
        }
        // Filter
        const grahSplitListFiltered = graphSplitList.filter(
            (item) =>
                item.transactionDate >= transactionDateFrom &&
                item.transactionDate <= transactionDateTo &&
                item.accountId === wipBudgetSheet.accountId,
        );

        // Calculate leaf sum
        const graphSplitMap = GraphUtils.reduceToInOutMapOfOneCurrency(grahSplitListFiltered);
        return graphSplitMap;
    }

    private sumTree(
        cashAccountTree: CashAccount[],
        cashCurrency: CashCurrency,
        graphSplitMap: Map<number, GraphSplit>,
    ): number {
        let sum = 0;
        for (const cashAccount of cashAccountTree) {
            const key = cashAccount.id;
            if (cashAccount.children && cashAccount.children.length > 0) {
                // Directory
                const oneSum = this.sumTree(cashAccount.children, cashCurrency, graphSplitMap);
                const oneGraphSplit: GraphSplit = {
                    amount: oneSum,
                    accountId: cashAccount.id,
                    currencyId: cashCurrency.id,
                    transactionDate: DateUtils.newDate(),
                    originalAmount: oneSum,
                    originalCurrencyId: cashCurrency.id,
                };
                graphSplitMap.set(key, oneGraphSplit);
                sum += oneSum;
            } else {
                // Leaf
                let oneGraphSplit = graphSplitMap.get(key);
                if (!oneGraphSplit) {
                    oneGraphSplit = {
                        amount: 0,
                        accountId: cashAccount.id,
                        currencyId: cashCurrency.id,
                        transactionDate: DateUtils.newDate(),
                        originalAmount: 0,
                        originalCurrencyId: cashCurrency.id,
                    };
                    graphSplitMap.set(key, oneGraphSplit);
                }
                sum += oneGraphSplit.amount;
            }
        }
        return sum;
    }
}
