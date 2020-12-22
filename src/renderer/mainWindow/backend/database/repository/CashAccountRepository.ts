import { Service } from 'typedi';
import CashAccount from '../entity/CashAccount';
import { EntityRepository, Repository, WhereExpression } from 'typeorm';
import { AccountParameters, simpleAccountParameters } from '../../service/dto/Parameters';
import QueryBuilderUtil from './QueryBuilderUtil';

@Service()
@EntityRepository(CashAccount)
export default class CashAccountRepository extends Repository<CashAccount> {
    async findCustom(parameters: AccountParameters): Promise<CashAccount[]> {
        let qb = this.createQueryBuilder('a');

        qb = this.createWhereClause(qb, parameters);

        return await qb.getMany();
    }

    private createWhereClause<T extends WhereExpression>(
        qb: T,
        parameters: AccountParameters = simpleAccountParameters,
    ): T {
        qb = QueryBuilderUtil.addDateFilter(
            qb,
            'a',
            'createdDate',
            parameters.createdDateFrom,
            parameters.createdDateTo,
        );
        qb = QueryBuilderUtil.addDateFilter(
            qb,
            'a',
            'updatedDate',
            parameters.updatedDateFrom,
            parameters.updatedDateTo,
        );

        if (parameters.accountIdList && parameters.accountIdList.length > 0) {
            qb = qb.andWhere(`a.id IN ( ${parameters.accountIdList.join(', ')} )`);
        }

        if (parameters.currencyIdList && parameters.currencyIdList.length > 0) {
            qb = qb.andWhere(`a.currencyId IN ( ${parameters.currencyIdList.join(', ')} )`);
        }

        if (parameters.accountTypeList && parameters.accountTypeList.length > 0) {
            qb = qb.andWhere(
                `a.type IN ( ${parameters.accountTypeList.map((item) => `'${item}'`).join(', ')} )`,
            );
        }

        if (parameters.isLeaf) {
            qb = qb.andWhere(`a.isDirectory = 0`);
        }

        if (parameters.searchString) {
            qb = qb.andWhere(`a.name LIKE %${parameters.searchString}%`);
        }

        return qb;
    }
}
