import { Service } from 'typedi';
import { EntityRepository, Repository, WhereExpression } from 'typeorm';
import CashRule from '../entity/CashRule';
import { RuleParameters } from '../../service/dto/Parameters';
import Page from '../../service/dto/Page';
import QueryBuilderUtil from './QueryBuilderUtil';

@Service()
@EntityRepository(CashRule)
export default class CashRuleRepository extends Repository<CashRule> {
    async countForThisAccountId(accountId: string): Promise<number> {
        return await this.createQueryBuilder('r')
            .leftJoin('r.action', 'a')
            .leftJoin('a.cashAccountList', 'aCashAccount')
            .leftJoin('r.filter', 'f')
            .leftJoin('f.cashAccountList', 'fCashAccount')
            .andWhere('aCashAccount.id = :accountId')
            .orWhere('fCashAccount.id = :accountId')
            .setParameter('accountId', accountId)
            .getCount();
    }

    async findCustom(
        currentPage: number,
        itemPerPage: number,
        parameters: RuleParameters = {},
    ): Promise<Page<CashRule>> {
        let qb = this.createQueryBuilder('r')
            .leftJoinAndSelect('r.filter', 'filter')
            .leftJoinAndSelect('filter.cashAccountList', 'filterCashAccount')
            .leftJoinAndSelect('r.action', 'action')
            .leftJoinAndSelect('action.cashAccountList', 'actionCashAccount')
            .skip((currentPage - 1) * itemPerPage)
            .take(itemPerPage)
            .orderBy('r.name', 'ASC');

        qb = this.createWhereClause(qb, parameters);

        const response = await qb.getManyAndCount();

        return {
            itemList: response[0],
            currentPage,
            itemPerPage,
            totalItem: response[1],
        };
    }

    async findListCustom(parameters: RuleParameters = {}): Promise<CashRule[]> {
        let qb = this.createQueryBuilder('r')
            .leftJoinAndSelect('r.filter', 'filter')
            .leftJoinAndSelect('filter.cashAccountList', 'filterCashAccount')
            .leftJoinAndSelect('r.action', 'action')
            .leftJoinAndSelect('action.cashAccountList', 'actionCashAccount')
            .orderBy('r.name', 'ASC');

        qb = this.createWhereClause(qb, parameters);

        return qb.getMany();
    }

    private createWhereClause<T extends WhereExpression>(
        qb: T,
        parameters: RuleParameters = {},
    ): T {
        qb = QueryBuilderUtil.addDateFilter(
            qb,
            'r',
            'createdDate',
            parameters.createdDateFrom,
            parameters.createdDateTo,
        );
        qb = QueryBuilderUtil.addDateFilter(
            qb,
            'r',
            'updatedDate',
            parameters.updatedDateFrom,
            parameters.updatedDateTo,
        );

        if (parameters.searchString && parameters.searchString.length > 1) {
            qb = qb.andWhere(`INSTR(LOWER(r.name), LOWER('${parameters.searchString}')) > 0`);
        }

        if (parameters.accountIdList && parameters.accountIdList.length > 0) {
            // tslint:disable-next-line:max-line-length
            qb = qb.andWhere(
                `(filterCashAccount.id IN ( ${parameters.accountIdList.join(
                    ', ',
                )} ) OR actionCashAccount.id IN ( ${parameters.accountIdList.join(', ')} ))`,
            );
        }

        return qb;
    }
}
