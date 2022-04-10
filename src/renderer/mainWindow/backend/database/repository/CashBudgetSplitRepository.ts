import { Service } from 'typedi';
import { EntityRepository, In, Repository, WhereExpression } from 'typeorm';
import { simpleTransactionParameters, SplitParameters } from '../../service/dto/Parameters';
import CashBudgetTransactionRepository from './CashBudgetTransactionRepository';
import CashBudgetSplit from '../entity/CashBudgetSplit';

@Service()
@EntityRepository(CashBudgetSplit)
export default class CashBudgetSplitRepository extends Repository<CashBudgetSplit> {
    async findByTransactionId(transactionIdList: number[]): Promise<CashBudgetSplit[]> {
        return await this.find({
            select: ['accountId', 'currencyId', 'amount'],
            where: {
                transactionId: In(transactionIdList),
            },
        });
    }

    async findByAccountId(accountIdList: number[]): Promise<CashBudgetSplit[]> {
        return await this.find({
            select: ['accountId', 'currencyId', 'amount', 'transactionDate'],
            where: {
                accountId: In(accountIdList),
            },
        });
    }

    async findCustom(parameters: SplitParameters): Promise<CashBudgetSplit[]> {
        let qb = this.createQueryBuilder('s');

        qb = this.createWhereClause(qb, parameters);

        return await qb.getMany();
    }

    async hasSplits(accountId: string): Promise<boolean> {
        const qb = this.createQueryBuilder('s').andWhere(`s.accountId = ${accountId}`).limit(1);

        const count = await qb.getCount();
        return count === 1;
    }

    async computeSum(parameters: SplitParameters): Promise<number> {
        let qb = this.createQueryBuilder('s').select('SUM(s.amountCent)', 'sum');

        if (parameters) {
            qb = this.createWhereClause(qb, parameters);
        }

        const { sum } = await qb.getRawOne();
        return sum / 100 || 0;
    }

    private createWhereClause<T extends WhereExpression>(
        qb: T,
        parameters: SplitParameters = simpleTransactionParameters,
    ): T {
        if (parameters.splitAccountIdList && parameters.splitAccountIdList.length > 0) {
            qb = qb.andWhere(`s.accountId IN ( ${parameters.splitAccountIdList.join(', ')} )`);
        }

        const repo = this.manager.getCustomRepository(CashBudgetTransactionRepository);
        let cashBudgetTransactionIdQb = repo.createQueryBuilder('t').select('t.id');
        cashBudgetTransactionIdQb = repo.createWhereClause(cashBudgetTransactionIdQb, parameters);
        qb = qb.andWhere(`s.transactionId IN ( ${cashBudgetTransactionIdQb.getQuery()} )`);

        return qb;
    }
}
