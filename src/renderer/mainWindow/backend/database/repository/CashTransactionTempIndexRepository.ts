import { Service } from 'typedi';
import { EntityRepository, Repository } from 'typeorm';
import CashTransactionTempIndex from '../entity/CashTransactionTempIndex';
import CashTransactionIndexUtils from '../../utils/CashTransactionIndexUtils';

@Service()
@EntityRepository(CashTransactionTempIndex)
export default class CashTransactionTempIndexRepository extends Repository<
    CashTransactionTempIndex
> {
    async descriptionMatch(searchString: string): Promise<boolean> {
        const stringQuery = Array.from(
            CashTransactionIndexUtils.generateListItem(searchString),
        ).join(' AND ');

        if (stringQuery.length === 0) {
            return false;
        }
        const qb = this.createQueryBuilder('cashTransactionTempIdx')
            .select('rowId')
            .andWhere(`cash_transaction_temp_idx MATCH '{description} :${stringQuery}'`);
        const result = await qb.execute();
        return result.length > 0;
    }

    async detailMatch(searchString: string): Promise<boolean> {
        const stringQuery = Array.from(
            CashTransactionIndexUtils.generateListItem(searchString),
        ).join(' AND ');

        if (stringQuery.length === 0) {
            return false;
        }
        const qb = this.createQueryBuilder('cashTransactionTempIdx')
            .select('rowId')
            .andWhere(`cash_transaction_temp_idx MATCH '{detail} :${stringQuery}'`);
        const result = await qb.execute();
        return result.length > 0;
    }
}
