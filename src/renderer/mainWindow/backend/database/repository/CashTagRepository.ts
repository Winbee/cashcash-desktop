import { Service } from 'typedi';
import { EntityRepository, Repository, WhereExpression } from 'typeorm';
import { TagParameters } from '../../service/dto/Parameters';
import Page from '../../service/dto/Page';
import QueryBuilderUtil from './QueryBuilderUtil';
import CashTag from '../entity/CashTag';

@Service()
@EntityRepository(CashTag)
export default class CashFilterRepository extends Repository<CashTag> {
    async findCustom(
        currentPage: number,
        itemPerPage: number,
        parameters: TagParameters = {},
    ): Promise<Page<CashTag>> {
        let qb = this.createQueryBuilder('r')
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

    async findListCustom(parameters: TagParameters = {}): Promise<CashTag[]> {
        let qb = this.createQueryBuilder('r').orderBy('r.name', 'ASC');

        qb = this.createWhereClause(qb, parameters);

        return qb.getMany();
    }

    private createWhereClause<T extends WhereExpression>(qb: T, parameters: TagParameters = {}): T {
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

        return qb;
    }
}
