import { Container, Service } from 'typedi';
import { getManager } from 'typeorm';

import CashSplit from '../database/entity/CashSplit';
import CashConverterService from './CashConverterService';
import { simpleTransactionParameters, SplitParameters } from './dto/Parameters';
import CashAccount from '../database/entity/CashAccount';
import CashAccountUtils from '../utils/CashAccountUtils';
import ConvertedSplitExtended from './dto/ConvertedSplitExtended';
import CashBudgetSplit from '../database/entity/CashBudgetSplit';
import CashBudgetSplitRepository from '../database/repository/CashBudgetSplitRepository';

@Service()
export default class CashBudgetSplitService {
    async get(id: string): Promise<CashBudgetSplit | undefined> {
        const repo = getManager().getCustomRepository(CashBudgetSplitRepository);
        return await repo.findOne(id);
    }

    async getList(): Promise<CashSplit[]> {
        const repo = getManager().getCustomRepository(CashBudgetSplitRepository);
        return await repo.find();
    }

    async getListByParam(
        parameters: SplitParameters = simpleTransactionParameters,
        accountMap: Map<number, CashAccount>,
    ): Promise<ConvertedSplitExtended[]> {
        parameters = CashAccountUtils.adaptAccountParamForLeafAccounts(parameters, accountMap);
        const repo = getManager().getCustomRepository(CashBudgetSplitRepository);
        const cashSplitList = await repo.findCustom(parameters);

        const converterService = Container.get(CashConverterService);
        return await converterService.convertCashSplitList(
            cashSplitList,
            parameters.outputCurrency,
        );
    }

    async hasSplits(accountId: string) {
        const repo = getManager().getCustomRepository(CashBudgetSplitRepository);
        return await repo.hasSplits(accountId);
    }
}
