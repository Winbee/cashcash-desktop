import { Service } from 'typedi';
import { EntityRepository, Repository, WhereExpression } from 'typeorm';
import { RuleParameters } from '../../service/dto/Parameters';
import Page from '../../service/dto/Page';
import QueryBuilderUtil from './QueryBuilderUtil';
import CashAction from '../entity/CashAction';

@Service()
@EntityRepository(CashAction)
export default class CashActionRepository extends Repository<CashAction> {
    async findCustom(
        currentPage: number,
        itemPerPage: number,
        parameters: RuleParameters = {},
    ): Promise<Page<CashAction>> {
        let qb = this.createQueryBuilder('r')
            .leftJoinAndSelect('r.cashAccountList', 'cashAccount')
            .skip((currentPage - 1) * itemPerPage)
            .take(itemPerPage)
            .orderBy('r.name', 'DESC');

        qb = this.createWhereClause(qb, parameters);

        const response = await qb.getManyAndCount();

        return {
            itemList: response[0],
            currentPage,
            itemPerPage,
            totalItem: response[1],
        };
    }

    async findListCustom(parameters: RuleParameters = {}): Promise<CashAction[]> {
        let qb = this.createQueryBuilder('r')
            .leftJoinAndSelect('r.cashAccountList', 'cashAccount')
            .orderBy('r.name', 'DESC');

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
            qb = qb.andWhere(`cashAccount.id IN ( ${parameters.accountIdList.join(', ')} )`);
        }

        return qb;
    }
}
