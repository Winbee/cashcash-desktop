import { Service } from 'typedi';
import { getManager } from 'typeorm';

import FlatCashTransaction from '../database/entity/proxy/FlatCashTransaction';
import CashTransactionUtils from '../utils/CashTransactionUtils';
import Page from './dto/Page';
import { TransactionParameters, simpleTransactionParameters } from './dto/Parameters';
import CashAccount from '../database/entity/CashAccount';
import CashAccountUtils from '../utils/CashAccountUtils';
import CashBudgetTransactionRepository from '../database/repository/CashBudgetTransactionRepository';
import CashBudgetTransaction from '../database/entity/CashBudgetTransaction';

@Service()
export default class CashBudgetTransactionService {
    async getFlat(id: string): Promise<FlatCashTransaction | undefined> {
        const repo: CashBudgetTransactionRepository = getManager().getCustomRepository(
            CashBudgetTransactionRepository,
        );
        const transaction = await repo.findOne(id, {
            relations: ['cashSplitList', 'cashSplitList.account', 'cashSplitList.currency'],
        });
        if (!transaction) {
            return undefined;
        }
        return CashTransactionUtils.convertToFlatTransaction(transaction);
    }

    async getFlatList(idList: string[]): Promise<FlatCashTransaction[]> {
        const repo = getManager().getCustomRepository(CashBudgetTransactionRepository);
        const transactionList = await repo.findList(idList);
        return CashTransactionUtils.convertToFlatTransactionList(transactionList);
    }

    async countForThisAccountId(accountId: string): Promise<number> {
        const repo = getManager().getCustomRepository(CashBudgetTransactionRepository);
        return await repo.countForThisAccountId(accountId);
    }

    async get(id: string): Promise<CashBudgetTransaction | undefined> {
        const repo = getManager().getCustomRepository(CashBudgetTransactionRepository);
        const transaction = await repo.findOne(id, {
            relations: ['cashSplitList', 'cashSplitList.account', 'cashSplitList.currency'],
        });
        return transaction;
    }

    async getList(idList: string[]): Promise<CashBudgetTransaction[]> {
        const repo = getManager().getCustomRepository(CashBudgetTransactionRepository);
        return await repo.findList(idList);
    }

    async getListByParam(
        parameters: TransactionParameters = simpleTransactionParameters,
        accountMap: Map<number, CashAccount>,
    ): Promise<CashBudgetTransaction[]> {
        parameters = CashAccountUtils.adaptAccountParamForLeafAccounts(parameters, accountMap);
        const repo = getManager().getCustomRepository(CashBudgetTransactionRepository);
        return await repo.findListCustom(parameters);
    }

    async getPageByParam(
        currentPage: number = 1,
        parameters: TransactionParameters = simpleTransactionParameters,
        accountMap: Map<number, CashAccount>,
        itemPerPage: number = 15,
    ): Promise<Page<CashBudgetTransaction>> {
        parameters = CashAccountUtils.adaptAccountParamForLeafAccounts(parameters, accountMap);
        const repo = getManager().getCustomRepository(CashBudgetTransactionRepository);
        return await repo.findCustom(currentPage, itemPerPage, parameters);
    }

    async save(wipCashTransaction: FlatCashTransaction) {
        const cashTransaction = CashTransactionUtils.convertToTransaction(wipCashTransaction);
        const repo = getManager().getCustomRepository(CashBudgetTransactionRepository);
        return repo.save(cashTransaction);
    }

    async saveList(flatCashTransactionList: FlatCashTransaction[]) {
        const flatCashTransactionListToImport = flatCashTransactionList.filter(
            (o) => !o.doNotImport,
        );
        const cashTransactionList = CashTransactionUtils.convertToTransactionList(
            flatCashTransactionListToImport,
        );

        const repo = getManager().getCustomRepository(CashBudgetTransactionRepository);
        return repo.save(cashTransactionList);
    }

    async delete(id: string) {
        const cashTransaction = await this.get(id);
        if (!cashTransaction) {
            // It doesn't exist
            return;
        }
        const repo = getManager().getCustomRepository(CashBudgetTransactionRepository);
        return await repo.remove(cashTransaction);
    }

    async deleteList(idList: string[]) {
        const cashTransactionList = await this.getList(idList);
        if (cashTransactionList.length === 0 || idList.length !== cashTransactionList.length) {
            // Not the same size or zero
            return;
        }
        const repo = getManager().getCustomRepository(CashBudgetTransactionRepository);
        return await repo.remove(cashTransactionList);
    }
}
