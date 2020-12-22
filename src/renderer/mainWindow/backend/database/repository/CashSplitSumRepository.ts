import { Service } from 'typedi';
import { EntityRepository, Repository, DeleteResult } from 'typeorm';
import CashSplitSum from '../entity/CashSplitSum';
import { TransactionDatabaseParameters } from '../../service/dto/Parameters';
import QueryBuilderUtil from './QueryBuilderUtil';

@Service()
@EntityRepository(CashSplitSum)
export default class CashSplitSumRepository extends Repository<CashSplitSum> {
    async findCustom(parameters: TransactionDatabaseParameters): Promise<CashSplitSum[]> {
        let qb = this.createQueryBuilder('s');

        qb = QueryBuilderUtil.addDateFilter(
            qb,
            's',
            'createdDate',
            parameters.createdDateFrom,
            parameters.createdDateTo,
        );
        qb = QueryBuilderUtil.addDateFilter(
            qb,
            's',
            'updatedDate',
            parameters.updatedDateFrom,
            parameters.updatedDateTo,
        );

        if (parameters.accountIdList && parameters.accountIdList.length > 0) {
            qb = qb.andWhere(`s.accountId IN ( ${parameters.accountIdList.join(', ')} )`);
        }

        if (parameters.currencyIdList && parameters.currencyIdList.length > 0) {
            qb = qb.andWhere(`s.currencyId IN ( ${parameters.currencyIdList.join(', ')} )`);
        }

        return await qb.getMany();
    }

    async deleteAll(): Promise<DeleteResult> {
        return await this.createQueryBuilder().delete().execute();
    }
}
