import { Container, Service } from 'typedi';
import { EntityManager, getManager } from 'typeorm';

import CashSplitSumRepository from '../database/repository/CashSplitSumRepository';
import CashSplitSum from '../database/entity/CashSplitSum';
import CashSplitRepository from '../database/repository/CashSplitRepository';
import CashSplit from '../database/entity/CashSplit';
import CashTransaction from '../database/entity/CashTransaction';
import Big from 'big.js';
import _ from 'lodash';
import CashSplitService from './CashSplitService';
import { TransactionParameters, SplitParameters } from './dto/Parameters';
import CashAccountUtils from '../utils/CashAccountUtils';
import { AccountCurrencyKey } from '../database/entity/proxy/CashKey';
import CashAccountService from './CashAccountService';
import CashConverterService from './CashConverterService';
import ConvertedSplit from './dto/ConvertedSplit';
import CashAccount from '../database/entity/CashAccount';
import DateUtils from '../utils/DateUtils';

@Service()
export default class CashSplitSumService {
    async get(id: string): Promise<CashSplitSum | undefined> {
        const cashSplitSumRepository = getManager().getCustomRepository(CashSplitSumRepository);
        const result = await cashSplitSumRepository.findOne(id);
        if (result) {
            result.transactionDate = DateUtils.newDate();
        }
        return result;
    }

    async getList(transactionalEntityManager?: EntityManager): Promise<CashSplitSum[]> {
        let result: CashSplitSum[];
        if (transactionalEntityManager) {
            result = await transactionalEntityManager.find(CashSplitSum);
        } else {
            const cashSplitSumRepository = getManager().getCustomRepository(CashSplitSumRepository);
            result = await cashSplitSumRepository.find();
        }
        const now = DateUtils.newDate();
        for (const item of result) {
            item.transactionDate = now;
        }
        return result;
    }

    async getListByParam(
        parameters: SplitParameters,
        accountMap: Map<number, CashAccount>,
    ): Promise<ConvertedSplit[]> {
        parameters = CashAccountUtils.adaptAccountParamForLeafAccounts(parameters, accountMap);
        parameters = {
            ...parameters,
            transactionDateFrom: undefined,
        };
        const cashAccountService = Container.get(CashAccountService);
        const cashSplitSumRepository = getManager().getCustomRepository(CashSplitSumRepository);
        const splitService = Container.get(CashSplitService);
        const splitSumByCurrencyCode = new Map<AccountCurrencyKey, CashSplitSum>();

        const accountList = await cashAccountService.getInternalLeafList();

        // if TransactionParameters is complex
        if (this.isComplexQuery(parameters)) {
            // FullScan sum
            for (const account of accountList) {
                const key = CashAccountUtils.generateKey(account.id, account.currencyId);
                let sum;
                if (
                    parameters.splitAccountIdList &&
                    parameters.splitAccountIdList.length > 0 &&
                    !parameters.splitAccountIdList.includes(account.id)
                ) {
                    sum = 0;
                } else {
                    const parameterForOneAccount = {
                        ...parameters,
                        outputCurrency: undefined,
                        splitAccountIdList: [account.id],
                    };
                    sum = await splitService.computeSum(parameterForOneAccount, accountMap);
                }
                const newSplitSum = new CashSplitSum({
                    accountId: account.id,
                    currencyId: account.currencyId,
                    amount: '' + sum,
                    transactionDate: parameters.transactionDateTo,
                });
                splitSumByCurrencyCode.set(key, newSplitSum);
            }
        } else {
            // Clever calculation
            for (const account of accountList) {
                const key = CashAccountUtils.generateKey(account.id, account.currencyId);
                const newSplitSum = new CashSplitSum({
                    accountId: account.id,
                    currencyId: account.currencyId,
                    amount: '0',
                    transactionDate: parameters.transactionDateTo,
                });
                splitSumByCurrencyCode.set(key, newSplitSum);
            }

            const splitSumList = await cashSplitSumRepository.findCustom(parameters);
            for (const splitSum of splitSumList) {
                const key = CashAccountUtils.generateKey(splitSum.accountId, splitSum.currencyId);
                const cashSplitSum = splitSumByCurrencyCode.get(key) as CashSplitSum;
                cashSplitSum.amount = new Big(cashSplitSum.amount).add(splitSum.amount).valueOf();
            }

            if (parameters.transactionDateFrom) {
                const newParam = {
                    ...parameters,
                    outputCurrency: undefined,
                    transactionDateFrom: parameters.transactionDateTo,
                    transactionDateTo: DateUtils.newDate(),
                };
                const splitList = await splitService.getListByParam(newParam, accountMap);

                for (const split of splitList) {
                    const key = CashAccountUtils.generateKey(split.accountId, split.currencyId);
                    const cashSplitSum = splitSumByCurrencyCode.get(key) as CashSplitSum;
                    if (cashSplitSum) {
                        cashSplitSum.amount = new Big(cashSplitSum.amount)
                            .minus(split.amount)
                            .valueOf();
                    }
                }
            }
        }

        const convertService = Container.get(CashConverterService);
        return await convertService.convertGenericSplitList(
            Array.from(splitSumByCurrencyCode.values()),
            parameters.outputCurrency,
        );
    }

    async resetSplitSumList() {
        const cashSplitSumRepository = getManager().getCustomRepository(CashSplitSumRepository);
        const splitService = Container.get(CashSplitService);
        const accountService = Container.get(CashAccountService);

        // Remove all split sum
        cashSplitSumRepository.deleteAll();

        // Get all internal leaf
        const accountList = await accountService.getList();

        // Sum and save
        const leafInternalAccountList = accountList
            .filter((item) => !item.isDirectory)
            .filter((item) => CashAccountUtils.isInternal(item));

        const uselessMap = new Map();
        for (const account of leafInternalAccountList) {
            const param: SplitParameters = {
                splitAccountIdList: [account.id],
                accountIdList: [],
                fromAccountIdList: [],
                toAccountIdList: [],
                currencyIdList: [],
                transactionTypeList: [],
                accountTypeList: [],
            };
            const sum = await splitService.computeSum(param, uselessMap);
            const newSplitSum = new CashSplitSum({
                accountId: account.id,
                currencyId: account.currencyId,
                amount: '' + sum,
            });
            await cashSplitSumRepository.save(newSplitSum);
        }
    }

    async computeSplitSumList(
        toAddCashTransactionList: CashTransaction[],
        toRemoveCashTransactionList: CashTransaction[],
        transactionalEntityManager: EntityManager,
    ): Promise<CashSplitSum[]> {
        const cashAccountService = Container.get(CashAccountService);
        const internalLeafAccountIdList = (await cashAccountService.getInternalLeafList()).map(
            (item) => item.id,
        );

        // Get existing cashSplitSum
        const splitSumList = await this.getList(transactionalEntityManager);
        const sumByAccountIdCurrencyId: Map<string, CashSplitSum> = this.createMap(splitSumList);

        // Compute the substracted part
        const transactionIdList: number[] = toRemoveCashTransactionList
            .filter((transaction) => transaction.id != null)
            .map((transaction) => transaction.id);

        const cashSplitRepository: CashSplitRepository = transactionalEntityManager.getCustomRepository(
            CashSplitRepository,
        );
        const oldCashSplitList: CashSplit[] = (
            await cashSplitRepository.findByTransactionId(transactionIdList)
        ).filter((item) => internalLeafAccountIdList.includes(item.accountId));
        this.minus(sumByAccountIdCurrencyId, oldCashSplitList);

        // Compute the added part
        const newCashSplitList: CashSplit[] = _.flatMap(
            toAddCashTransactionList,
            (item: CashTransaction) => item.cashSplitList,
        ).filter((item) => internalLeafAccountIdList.includes(item.accountId));
        this.add(sumByAccountIdCurrencyId, newCashSplitList);

        return Array.from(sumByAccountIdCurrencyId.values());
    }

    private createMap(splitSumList: CashSplitSum[]): Map<string, CashSplitSum> {
        const sumByAccountIdCurrencyId: Map<AccountCurrencyKey, CashSplitSum> = new Map();
        for (const splitSum of splitSumList) {
            const key: AccountCurrencyKey = CashAccountUtils.generateKey(
                splitSum.accountId,
                splitSum.currencyId,
            );
            sumByAccountIdCurrencyId.set(key, splitSum);
        }
        return sumByAccountIdCurrencyId;
    }

    private add(
        sumByAccountIdCurrencyId: Map<AccountCurrencyKey, CashSplitSum>,
        cashSplitList: CashSplit[],
    ) {
        for (const cashSplit of cashSplitList) {
            const key: AccountCurrencyKey = CashAccountUtils.generateKey(
                cashSplit.accountId,
                cashSplit.currencyId,
            );
            const splitSum = sumByAccountIdCurrencyId.get(key);
            if (splitSum) {
                splitSum.amount = new Big(splitSum.amount).add(cashSplit.amount).valueOf();
            } else {
                const newSplitSum = new CashSplitSum({
                    accountId: cashSplit.accountId,
                    currencyId: cashSplit.currencyId,
                    amount: cashSplit.amount,
                });
                sumByAccountIdCurrencyId.set(key, newSplitSum);
            }
        }
    }

    private minus(
        sumByAccountIdCurrencyId: Map<AccountCurrencyKey, CashSplitSum>,
        cashSplitList: CashSplit[],
    ) {
        for (const cashSplit of cashSplitList) {
            const key: AccountCurrencyKey = CashAccountUtils.generateKey(
                cashSplit.accountId,
                cashSplit.currencyId,
            );
            const splitSum = sumByAccountIdCurrencyId.get(key);
            if (splitSum) {
                splitSum.amount = new Big(splitSum.amount).minus(cashSplit.amount).valueOf();
            } else {
                const newSplitSum = new CashSplitSum({
                    accountId: cashSplit.accountId,
                    currencyId: cashSplit.currencyId,
                    amount: new Big(cashSplit.amount).mul(new Big(-1)).valueOf(),
                });
                sumByAccountIdCurrencyId.set(key, newSplitSum);
            }
        }
    }

    private isComplexQuery(parameters: TransactionParameters) {
        return (
            parameters.createdDateFrom ||
            parameters.createdDateTo ||
            parameters.updatedDateFrom ||
            parameters.updatedDateTo ||
            parameters.searchString ||
            parameters.amountLessThan ||
            parameters.amountGreaterThan ||
            parameters.accountIdList.length > 0 ||
            parameters.currencyIdList.length > 0 ||
            parameters.transactionTypeList.length > 0 ||
            parameters.accountTypeList.length > 0
        );
    }
}
