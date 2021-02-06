import { Inject, Service } from 'typedi';
import { EntityManager, getManager } from 'typeorm';

import CashTransactionRepository from '../database/repository/CashTransactionRepository';
import CashTransaction from '../database/entity/CashTransaction';
import FlatCashTransaction from '../database/entity/proxy/FlatCashTransaction';
import CashTransactionUtils from '../utils/CashTransactionUtils';
import Page from './dto/Page';
import CashSplitSum from '../database/entity/CashSplitSum';
import CashSplitSumService from './CashSplitSumService';
import { TransactionParameters, simpleTransactionParameters } from './dto/Parameters';
import StringUtils from '../utils/StringUtils';
import CashAccount from '../database/entity/CashAccount';
import CashAccountUtils from '../utils/CashAccountUtils';
import DateUtils from '../utils/DateUtils';

@Service()
export default class CashTransactionService {
    @Inject((type) => CashSplitSumService)
    private cashSplitSumService: CashSplitSumService;

    async getFlat(id: string): Promise<FlatCashTransaction | undefined> {
        const cashTransactionRepository: CashTransactionRepository = getManager().getCustomRepository(
            CashTransactionRepository,
        );
        const transaction = await cashTransactionRepository.findOne(id, {
            relations: ['cashSplitList', 'cashSplitList.account', 'cashSplitList.currency'],
        });
        if (!transaction) {
            return undefined;
        }
        return CashTransactionUtils.convertToFlatTransaction(transaction);
    }

    async getFlatList(idList: string[]): Promise<FlatCashTransaction[]> {
        const repo = getManager().getCustomRepository(CashTransactionRepository);
        const transactionList = await repo.findList(idList);
        return CashTransactionUtils.convertToFlatTransactionList(transactionList);
    }

    async duplicate(id: string): Promise<FlatCashTransaction | undefined> {
        const item = await this.get(id);
        if (item) {
            const convertedItem = CashTransactionUtils.convertToFlatTransaction(item);
            return new FlatCashTransaction({
                detail: convertedItem.detail,
                description: StringUtils.generateDuplicateName(convertedItem.description),
                importId: convertedItem.importId,
                transactionDate: convertedItem.transactionDate,
                currency: convertedItem.currency,
                exchangeCurrency: convertedItem.exchangeCurrency,
                amount: convertedItem.amount,
                exchangeAmount: convertedItem.exchangeAmount,
                inAccount: convertedItem.inAccount,
                outAccount: convertedItem.outAccount,
                isMultiCurrency: convertedItem.isMultiCurrency,
                type: convertedItem.type,
            });
        }
        return;
    }

    async hasTransactionWithImportId(importId: string): Promise<boolean> {
        const cashTransactionRepository: CashTransactionRepository = getManager().getCustomRepository(
            CashTransactionRepository,
        );
        const count = await cashTransactionRepository.count({
            where: {
                importId,
            },
            take: 1,
        });
        return count > 0;
    }

    async countForThisAccountId(accountId: string): Promise<number> {
        const cashTransactionRepository: CashTransactionRepository = getManager().getCustomRepository(
            CashTransactionRepository,
        );
        return await cashTransactionRepository.countForThisAccountId(accountId);
    }

    async hasSimilarTransaction(flatTransaction: FlatCashTransaction): Promise<boolean> {
        const transaction = CashTransactionUtils.convertToTransaction(flatTransaction);
        const cashTransactionRepository: CashTransactionRepository = getManager().getCustomRepository(
            CashTransactionRepository,
        );
        let count;
        if (flatTransaction.description) {
            count = await cashTransactionRepository.count({
                where: {
                    transactionDate: DateUtils.formatDateTime(transaction.transactionDate),
                    fromSplitAmount: transaction.fromSplitAmount,
                    fromSplitCurrencyId: transaction.fromSplitCurrencyId,
                    toSplitAmount: transaction.toSplitAmount,
                    toSplitCurrencyId: transaction.toSplitCurrencyId,
                    description: transaction.description,
                },
                take: 1,
            });
        } else {
            count = await cashTransactionRepository.count({
                where: {
                    transactionDate: DateUtils.formatDateTime(transaction.transactionDate),
                    fromSplitAmount: transaction.fromSplitAmount,
                    fromSplitCurrencyId: transaction.fromSplitCurrencyId,
                    toSplitAmount: transaction.toSplitAmount,
                    toSplitCurrencyId: transaction.toSplitCurrencyId,
                    detail: transaction.detail,
                },
                take: 1,
            });
        }

        return count > 0;
    }

    async findFlatByBestMatch(description: string): Promise<FlatCashTransaction | undefined> {
        const cashTransactionRepository: CashTransactionRepository = getManager().getCustomRepository(
            CashTransactionRepository,
        );
        const transaction = await cashTransactionRepository.findBestMatch(description);
        if (!transaction) {
            return undefined;
        }
        return CashTransactionUtils.convertToFlatTransaction(transaction);
    }

    async get(id: string): Promise<CashTransaction | undefined> {
        const repo: CashTransactionRepository = getManager().getCustomRepository(
            CashTransactionRepository,
        );
        const transaction = await repo.findOne(id, {
            relations: ['cashSplitList', 'cashSplitList.account', 'cashSplitList.currency'],
        });
        return transaction;
    }

    async getList(idList: string[]): Promise<CashTransaction[]> {
        const repo = getManager().getCustomRepository(CashTransactionRepository);
        return await repo.findList(idList);
    }

    async getListByParam(
        parameters: TransactionParameters = simpleTransactionParameters,
        accountMap: Map<number, CashAccount>,
    ): Promise<CashTransaction[]> {
        parameters = CashAccountUtils.adaptAccountParamForLeafAccounts(parameters, accountMap);
        const repo = getManager().getCustomRepository(CashTransactionRepository);
        return await repo.findListCustom(parameters);
    }

    async getPageByParam(
        currentPage: number = 1,
        parameters: TransactionParameters = simpleTransactionParameters,
        accountMap: Map<number, CashAccount>,
        itemPerPage: number = 15,
    ): Promise<Page<CashTransaction>> {
        parameters = CashAccountUtils.adaptAccountParamForLeafAccounts(parameters, accountMap);
        const repo = getManager().getCustomRepository(CashTransactionRepository);
        return await repo.findCustom(currentPage, itemPerPage, parameters);
    }

    async save(wipCashTransaction: FlatCashTransaction) {
        const cashTransaction = CashTransactionUtils.convertToTransaction(wipCashTransaction);
        return await getManager().transaction(async (transactionalEntityManager: EntityManager) => {
            const splitSumList: CashSplitSum[] = await this.cashSplitSumService.computeSplitSumList(
                [cashTransaction],
                [cashTransaction],
                transactionalEntityManager,
            );
            await transactionalEntityManager.save(splitSumList);
            await transactionalEntityManager.save(cashTransaction);
        });
    }

    async saveList(flatCashTransactionList: FlatCashTransaction[]) {
        const flatCashTransactionListToImport = flatCashTransactionList.filter(
            (o) => !o.doNotImport,
        );
        const cashTransactionList = CashTransactionUtils.convertToTransactionList(
            flatCashTransactionListToImport,
        );

        return await getManager().transaction(async (transactionalEntityManager: EntityManager) => {
            const splitSumList: CashSplitSum[] = await this.cashSplitSumService.computeSplitSumList(
                cashTransactionList,
                cashTransactionList,
                transactionalEntityManager,
            );
            await transactionalEntityManager.save(splitSumList);
            await transactionalEntityManager.save(cashTransactionList);
        });
    }

    async delete(id: string) {
        const cashTransaction = await this.get(id);
        if (!cashTransaction) {
            // It doesn't exist
            return;
        }
        return await getManager().transaction(async (transactionalEntityManager: EntityManager) => {
            const splitSumList: CashSplitSum[] = await this.cashSplitSumService.computeSplitSumList(
                [],
                [cashTransaction],
                transactionalEntityManager,
            );
            await transactionalEntityManager.save(splitSumList);
            await transactionalEntityManager.remove(cashTransaction);
        });
    }

    async deleteList(idList: string[]) {
        const cashTransactionList = await this.getList(idList);
        if (cashTransactionList.length === 0 || idList.length !== cashTransactionList.length) {
            // Not the same size or zero
            return;
        }
        return await getManager().transaction(async (transactionalEntityManager: EntityManager) => {
            const splitSumList: CashSplitSum[] = await this.cashSplitSumService.computeSplitSumList(
                [],
                cashTransactionList,
                transactionalEntityManager,
            );
            await transactionalEntityManager.save(splitSumList);
            await transactionalEntityManager.remove(cashTransactionList);
        });
    }

    async deleteByQuery(
        parameters: TransactionParameters = simpleTransactionParameters,
        accountMap: Map<number, CashAccount>,
    ): Promise<number> {
        parameters = CashAccountUtils.adaptAccountParamForLeafAccounts(parameters, accountMap);
        const cashTransactionList = await this.getListByParam(parameters, accountMap);
        return await getManager().transaction(async (transactionalEntityManager: EntityManager) => {
            const splitSumList: CashSplitSum[] = await this.cashSplitSumService.computeSplitSumList(
                [],
                [],
                transactionalEntityManager,
                parameters,
            );
            await transactionalEntityManager.save(splitSumList);
            const cashTransactionRepository: CashTransactionRepository = transactionalEntityManager.getCustomRepository(
                CashTransactionRepository,
            );
            await cashTransactionRepository.deleteCustom(parameters);
            return cashTransactionList.length;
        });
    }
}
