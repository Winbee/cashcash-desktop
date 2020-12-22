import { Service } from 'typedi';
import { EntityRepository, Repository, WhereExpression } from 'typeorm';
import { RuleParameters } from '../../service/dto/Parameters';
import Page from '../../service/dto/Page';
import QueryBuilderUtil from './QueryBuilderUtil';
import CashFilter from '../entity/CashFilter';

@Service()
@EntityRepository(CashFilter)
export default class CashFilterRepository extends Repository<CashFilter> {
    async findCustom(
        currentPage: number,
        itemPerPage: number,
        parameters: RuleParameters = {},
    ): Promise<Page<CashFilter>> {
        let qb = this.createQueryBuilder('r')
            .leftJoinAndSelect('r.cashAccountList', 'cashAccount')
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

    async findListCustom(parameters: RuleParameters = {}): Promise<CashFilter[]> {
        let qb = this.createQueryBuilder('r')
            .leftJoinAndSelect('r.cashAccountList', 'cashAccount')
            .orderBy('r.name', 'ASC');

        qb = this.createWhereClause(qb, parameters);

        return qb.getMany();
    }

    async findListWithoutRule(): Promise<CashFilter[]> {
        const qb = this.createQueryBuilder('r')
            .leftJoin('r.cashRuleList', 'cashRule')
            .andWhere(`cashRule.id is null`)
            .orderBy('r.name', 'ASC');

        return qb.getMany();
    }

    async countForThisAccountId(accountId: string): Promise<number> {
        return await this.createQueryBuilder('r')
            .leftJoin('r.cashAccountList', 'cashAccount')
            .andWhere('cashAccount.id = :accountId')
            .setParameter('accountId', accountId)
            .getCount();
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
            qb = qb.andWhere(`cashAccount.id IN ( ${parameters.accountIdList.join(', ')} )`);
        }

        return qb;
    }
}
