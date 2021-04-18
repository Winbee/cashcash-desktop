import { Service, Container } from 'typedi';
import { getManager, EntityManager } from 'typeorm';

import CashRule from '../database/entity/CashRule';
import CashRuleRepository from '../database/repository/CashRuleRepository';
import { RuleParameters } from './dto/Parameters';
import Page from './dto/Page';
import FlatCashTransaction from '../database/entity/proxy/FlatCashTransaction';
import {
    FieldNameDetectionType,
    StringTestMethodType,
    EnumOrObjectTestMethodType,
    NumberTestMethodType,
    FieldNameActionType,
} from '../database/entity/proxy/CashRuleV1';
import CashTransactionType from '../database/entity/enumeration/CashTransactionType';
import CashAccount from '../database/entity/CashAccount';
import CashAccountService from './CashAccountService';
import CashResource from '../database/entity/CashResource';
import { AccountTestMethodType } from '../database/entity/proxy/CashRuleV1';
import { OneJsonFilter } from '../database/entity/proxy/OneJsonFilter';
import CashTransactionTempIndexService from './CashTransactionTempIndexService';
import StringUtils from '../utils/StringUtils';
import CashError from './dto/CashError';
import CashActionService from './CashActionService';
import CashTag from '../database/entity/CashTag';

@Service()
export default class CashRuleService {
    async get(id: string): Promise<CashRule | undefined> {
        const repo = getManager().getCustomRepository(CashRuleRepository);
        return await repo.findOne(id, {
            relations: ['action', 'filter', 'action.cashAccountList'],
        });
    }

    async getPage(
        currentPage: number = 1,
        parameters: RuleParameters = {},
        itemPerPage: number = 15,
    ): Promise<Page<CashRule>> {
        const repo = getManager().getCustomRepository(CashRuleRepository);
        return await repo.findCustom(currentPage, itemPerPage, parameters);
    }

    async getList(): Promise<CashRule[]> {
        const repo = getManager().getCustomRepository(CashRuleRepository);
        return await repo.find({ relations: ['action', 'filter'] });
    }

    async getListByParam(parameters: RuleParameters = {}): Promise<CashRule[]> {
        const repo = getManager().getCustomRepository(CashRuleRepository);
        return await repo.findListCustom(parameters);
    }

    async countForThisAccountId(accountId: string): Promise<number> {
        const repo = getManager().getCustomRepository(CashRuleRepository);
        return await repo.countForThisAccountId(accountId);
    }

    async save(cashRule: CashRule) {
        this.sanitize(cashRule);
        const repo = getManager().getCustomRepository(CashRuleRepository);
        if (cashRule.action) {
            cashRule.action.attachAccount();
        }
        return await repo.save(cashRule);
    }

    async duplicate(id: string): Promise<CashRule | undefined> {
        const item = await this.get(id);
        if (item) {
            const cashActionService = Container.get(CashActionService);
            const duplicateAction = await cashActionService.duplicate('' + item.actionId);
            item.name = StringUtils.generateDuplicateName(item.name);
            return new CashRule({
                name: StringUtils.generateDuplicateName(item.name),
                priority: item.priority,
                action: duplicateAction,
                filter: item.filter,
            });
        }
        return;
    }

    async delete(id: string) {
        return await getManager().transaction(async (entityManager: EntityManager) => {
            const item: CashRule | undefined = await this.get(id)!;
            if (item) {
                await entityManager.remove(item);
                await entityManager.remove(item.action);
            }
        });
    }

    async deleteList(idList: string[]) {
        for (const id of idList) {
            await this.delete(id);
        }
    }

    async assignListWithRules(
        transactionList: FlatCashTransaction[],
        accountMap: Map<number, CashAccount>,
        tagMap: Map<number, CashTag>,
        ruleList: CashRule[],
        skipIfNoRuleApply: boolean,
        updateProgress: (number) => void = () => {},
    ): Promise<FlatCashTransaction[]> {
        updateProgress(0);
        if (!ruleList) {
            ruleList = await this.getList();
        }
        const cashAccountService = Container.get(CashAccountService);
        const accountList = await cashAccountService.getList();
        const resultList: FlatCashTransaction[] = [];
        let i = 0;
        for (const transaction of transactionList) {
            const currentTransaction = new FlatCashTransaction(transaction);
            const ruleApplied: boolean = await this.assignWithRules(
                currentTransaction,
                accountMap,
                tagMap,
                ruleList,
                accountList,
            );
            if (!skipIfNoRuleApply || ruleApplied) {
                resultList.push(currentTransaction);
            }
            i++;
            updateProgress(Math.floor((i * 100) / transactionList.length));
        }
        updateProgress(100);
        return resultList;
    }

    async assignWithRules(
        transaction: FlatCashTransaction,
        accountMap: Map<number, CashAccount>,
        tagMap: Map<number, CashTag>,
        ruleList?: CashRule[],
        accountList?: CashAccount[],
    ): Promise<boolean> {
        try {
            if (!ruleList) {
                ruleList = await this.getList();
            }
            if (!accountList) {
                const cashAccountService = Container.get(CashAccountService);
                accountList = await cashAccountService.getList();
            }
            const optionalRule = await this.findRule(transaction, ruleList);
            if (optionalRule) {
                this.applyRule(transaction, optionalRule, accountMap, tagMap);
                return true;
            }
            return false;
        } catch (e) {
            throw new CashError("Can't assign rule: " + e.message);
        }
    }

    private async findRule(
        transaction: FlatCashTransaction,
        ruleList: CashRule[],
    ): Promise<CashRule | void> {
        for (const rule of ruleList) {
            const filter = rule.filter;
            if (await this.isValidForAll(transaction, filter.jsonFilter.list)) {
                return rule;
            }
        }
    }

    private async isValidForAll(
        transaction: FlatCashTransaction,
        jsonFilter: OneJsonFilter[],
    ): Promise<boolean> {
        let transactionIndexUpdated = false;
        for (const filter of jsonFilter.sort(this.sortDetailAndDescriptionLast)) {
            if (
                (!transactionIndexUpdated &&
                    filter.fieldName === FieldNameDetectionType.DESCRIPTION) ||
                filter.fieldName === FieldNameDetectionType.DETAILS
            ) {
                const indexService = Container.get(CashTransactionTempIndexService);
                await indexService.putTransaction(transaction);
                transactionIndexUpdated = true;
            }
            if (!(await this.isValid(transaction, filter))) {
                return false;
            }
        }
        return true;
    }

    private sortDetailAndDescriptionLast(a: OneJsonFilter, b: OneJsonFilter): number {
        const aIsDescOrDet =
            a.fieldName === FieldNameDetectionType.DESCRIPTION ||
            a.fieldName === FieldNameDetectionType.DETAILS;
        const bIsDescOrDet =
            b.fieldName === FieldNameDetectionType.DESCRIPTION ||
            b.fieldName === FieldNameDetectionType.DETAILS;
        if (aIsDescOrDet && !bIsDescOrDet) {
            return 1; // a comes last
        } else if (!aIsDescOrDet && bIsDescOrDet) {
            return -1; // b comes last
        } else {
            return 0;
        }
    }

    private async isValid(
        transaction: FlatCashTransaction,
        jsonFilter: OneJsonFilter,
    ): Promise<boolean> {
        const { fieldName, testMethod, parameter } = jsonFilter;

        switch (fieldName) {
            case FieldNameDetectionType.DESCRIPTION: {
                return this.isValidDescriptionParam(testMethod as StringTestMethodType, parameter);
                break;
            }
            case FieldNameDetectionType.DETAILS: {
                return await this.isValidDetailParam(testMethod as StringTestMethodType, parameter);
                break;
            }
            case FieldNameDetectionType.TRANSACTION_TYPE: {
                return await this.isValidEnumParam(
                    transaction.type,
                    testMethod as EnumOrObjectTestMethodType,
                    parameter,
                );
                break;
            }
            case FieldNameDetectionType.ACCOUNT: {
                return this.isValidAccountParam(
                    transaction,
                    testMethod as AccountTestMethodType,
                    parameter,
                );
                break;
            }
            case FieldNameDetectionType.AMOUNT: {
                return this.isValidNumberParam(
                    transaction,
                    testMethod as NumberTestMethodType,
                    parameter,
                );
                break;
            }
            case FieldNameDetectionType.CURRENCY: {
                return this.isValidObjParam(
                    transaction.currency,
                    testMethod as EnumOrObjectTestMethodType,
                    parameter,
                );
                break;
            }
        }
        return false;
    }

    private async isValidDescriptionParam(
        testMethod: StringTestMethodType,
        param: string,
    ): Promise<boolean> {
        switch (testMethod) {
            case StringTestMethodType.CONTAINS: {
                const indexService = Container.get(CashTransactionTempIndexService);
                return await indexService.descriptionMatch(param);
            }
        }
        return false;
    }

    private async isValidDetailParam(
        testMethod: StringTestMethodType,
        param: string,
    ): Promise<boolean> {
        switch (testMethod) {
            case StringTestMethodType.CONTAINS: {
                const indexService = Container.get(CashTransactionTempIndexService);
                return await indexService.detailMatch(param);
            }
        }
        return false;
    }

    private isValidEnumParam(
        value: string,
        testMethod: EnumOrObjectTestMethodType,
        param: string,
    ): boolean {
        if (value == null || value === undefined) {
            return false;
        }
        switch (testMethod) {
            case EnumOrObjectTestMethodType.EQUALS: {
                return value === param;
            }
        }
        return false;
    }

    private isValidObjParam(
        value: CashResource,
        testMethod: EnumOrObjectTestMethodType,
        param: string,
    ): boolean {
        if (value == null || value === undefined) {
            return false;
        }
        switch (testMethod) {
            case EnumOrObjectTestMethodType.EQUALS: {
                return value.id === +param;
            }
        }
        return false;
    }

    private isValidAccountParam(
        flatTransaction: FlatCashTransaction,
        testMethod: AccountTestMethodType,
        param: string,
    ): boolean {
        switch (testMethod) {
            case AccountTestMethodType.ANY_EQUALS: {
                if (
                    flatTransaction.inAccount == null ||
                    flatTransaction.inAccount === undefined ||
                    flatTransaction.outAccount == null ||
                    flatTransaction.outAccount === undefined
                ) {
                    return false;
                }
                return (
                    flatTransaction.inAccount.id === +param ||
                    flatTransaction.outAccount.id === +param
                );
            }
            case AccountTestMethodType.FROM_EQUALS: {
                if (
                    flatTransaction.outAccount == null ||
                    flatTransaction.outAccount === undefined
                ) {
                    return false;
                }
                return flatTransaction.outAccount.id === +param;
            }
            case AccountTestMethodType.TO_EQUALS: {
                if (flatTransaction.inAccount == null || flatTransaction.inAccount === undefined) {
                    return false;
                }
                return flatTransaction.inAccount.id === +param;
            }
        }
        return false;
    }

    private isValidNumberParam(
        value: FlatCashTransaction,
        testMethod: NumberTestMethodType,
        param: string,
    ): boolean {
        if (value == null || value === undefined) {
            return false;
        }
        const absAmount = Math.abs(+value.amount);
        const absExchangeAmount = value.exchangeAmount
            ? Math.abs(+value.exchangeAmount)
            : undefined;
        const numberParam = +param;
        switch (testMethod) {
            case NumberTestMethodType.EQUALS: {
                return absAmount === numberParam || absExchangeAmount === numberParam;
            }
            case NumberTestMethodType.LESS_THAN: {
                return (
                    absAmount < numberParam ||
                    (!!absExchangeAmount && absExchangeAmount < numberParam)
                );
            }
            case NumberTestMethodType.GREATER_THAN: {
                return (
                    absAmount > numberParam ||
                    (!!absExchangeAmount && absExchangeAmount > numberParam)
                );
            }
        }
        return false;
    }

    private applyRule(
        transaction: FlatCashTransaction,
        rule: CashRule,
        accountListById: Map<number, CashAccount>,
        tagMap: Map<number, CashTag>,
    ) {
        const action = rule.action;
        for (const jsonAction of action.jsonActionList) {
            const { fieldName, parameter } = jsonAction;
            switch (fieldName) {
                case FieldNameActionType.TRANSACTION_TYPE: {
                    transaction.type = parameter as CashTransactionType;
                    break;
                }
                case FieldNameActionType.ACCOUNT_FROM: {
                    const account = accountListById.get(+parameter);
                    if (account) {
                        transaction.outAccount = account;
                    }
                    break;
                }
                case FieldNameActionType.ACCOUNT_TO: {
                    const account = accountListById.get(+parameter);
                    if (account) {
                        transaction.inAccount = account;
                    }
                    break;
                }
                case FieldNameActionType.TAGS: {
                    if (Array.isArray(parameter)) {
                        transaction.tagIdList = parameter
                            .map((item) => +item)
                            .filter((item) => tagMap.has(item));
                    }
                    break;
                }
            }
        }
    }

    private sanitize(item: CashRule) {
        if (item.name) {
            item.name = item.name.trim();
        }
    }
}
