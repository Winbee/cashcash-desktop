import { Service } from 'typedi';
import { EntityRepository, Repository, WhereExpression } from 'typeorm';
import CashRate from '../entity/CashRate';
import { RateParameters } from '../../service/dto/Parameters';
import Page from '../../service/dto/Page';
import QueryBuilderUtil from './QueryBuilderUtil';

@Service()
@EntityRepository(CashRate)
export default class CashRateRepository extends Repository<CashRate> {
    async findCustom(
        currentPage: number,
        itemPerPage: number,
        parameters: RateParameters = {},
    ): Promise<Page<CashRate>> {
        let qb = this.createQueryBuilder('r')
            .skip((currentPage - 1) * itemPerPage)
            .take(itemPerPage)
            .orderBy('r.updatedDate', 'DESC');

        qb = this.createWhereClause(qb, parameters);

        const response = await qb.getManyAndCount();

        return {
            itemList: response[0],
            currentPage,
            itemPerPage,
            totalItem: response[1],
        };
    }

    async findListCustom(parameters: RateParameters = {}): Promise<CashRate[]> {
        let qb = this.createQueryBuilder('r');

        qb = this.createWhereClause(qb, parameters);

        return qb.getMany();
    }

    private createWhereClause<T extends WhereExpression>(
        qb: T,
        parameters: RateParameters = {},
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

        if (parameters.currencyIdList && parameters.currencyIdList.length > 0) {
            // tslint:disable-next-line:max-line-length
            qb = qb.andWhere(
                `(r.fromCurrencyId IN ( ${parameters.currencyIdList.join(
                    ', ',
                )} ) OR r.toCurrencyId IN ( ${parameters.currencyIdList.join(', ')} ))`,
            );
        }

        return qb;
    }
}
