import { Service } from 'typedi';
import { EntityRepository, Repository, WhereExpression } from 'typeorm';
import CashImportConfig from '../entity/CashImportConfig';
import { ImportConfigParameters } from '../../service/dto/Parameters';
import Page from '../../service/dto/Page';
import QueryBuilderUtil from './QueryBuilderUtil';

@Service()
@EntityRepository(CashImportConfig)
export default class CashImportConfigRepository extends Repository<CashImportConfig> {
    async findCustom(
        currentPage: number,
        itemPerPage: number,
        parameters: ImportConfigParameters = {},
    ): Promise<Page<CashImportConfig>> {
        let qb = this.createQueryBuilder('c')
            .skip((currentPage - 1) * itemPerPage)
            .take(itemPerPage)
            .orderBy('c.name', 'DESC');

        qb = this.createWhereClause(qb, parameters);

        const response = await qb.getManyAndCount();

        return {
            itemList: response[0],
            currentPage,
            itemPerPage,
            totalItem: response[1],
        };
    }

    async findListCustom(parameters: ImportConfigParameters = {}): Promise<CashImportConfig[]> {
        let qb = this.createQueryBuilder('c').orderBy('c.name', 'DESC');

        qb = this.createWhereClause(qb, parameters);

        return qb.getMany();
    }

    private createWhereClause<T extends WhereExpression>(
        qb: T,
        parameters: ImportConfigParameters = {},
    ): T {
        qb = QueryBuilderUtil.addDateFilter(
            qb,
            'c',
            'createdDate',
            parameters.createdDateFrom,
            parameters.createdDateTo,
        );
        qb = QueryBuilderUtil.addDateFilter(
            qb,
            'c',
            'updatedDate',
            parameters.updatedDateFrom,
            parameters.updatedDateTo,
        );

        if (parameters.searchString && parameters.searchString.length > 1) {
            qb = qb.andWhere(`INSTR(LOWER(c.name), LOWER('${parameters.searchString}')) > 0`);
        }

        return qb;
    }
}
