import { Service } from 'typedi';
import { DeleteResult, EntityRepository, getManager, Repository, WhereExpression } from 'typeorm';
import CashTransaction from '../entity/CashTransaction';
import { TransactionParameters, simpleTransactionParameters } from '../../service/dto/Parameters';
import Page from '../../service/dto/Page';
import CashTransactionIndexRepository from './CashTransactionIndexRepository';
import CashTransactionIndexUtils from '../../utils/CashTransactionIndexUtils';
import QueryBuilderUtil from './QueryBuilderUtil';
import { TAG_SEPARATOR } from '../transformer/TagTransformer';

@Service()
@EntityRepository(CashTransaction)
export default class CashTransactionRepository extends Repository<CashTransaction> {
    async findCustom(
        currentPage: number,
        itemPerPage: number,
        parameters: TransactionParameters = simpleTransactionParameters,
    ): Promise<Page<CashTransaction>> {
        // We want something like this:
        // select * from cash_transaction
        // where cash_transaction.id IN (
        // select s.transactionId from cash_split as s where s.accountId = 8
        // );
        let qb = this.createQueryBuilder('t')
            .leftJoinAndSelect('t.cashSplitList', 'cashSplit')
            .skip((currentPage - 1) * itemPerPage)
            .take(itemPerPage)
            .orderBy('t.transactionDate', 'DESC');

        qb = this.createWhereClause(qb, parameters);

        const response = await qb.getManyAndCount();

        return {
            itemList: response[0],
            currentPage,
            itemPerPage,
            totalItem: response[1],
        };
    }

    async findListCustom(
        parameters: TransactionParameters = simpleTransactionParameters,
    ): Promise<CashTransaction[]> {
        let qb = this.createQueryBuilder('t')
            .leftJoinAndSelect('t.cashSplitList', 'cashSplit')
            .select('t.id')
            .orderBy('t.transactionDate', 'DESC');

        qb = this.createWhereClause(qb, parameters);

        return qb.getMany();
    }

    async findList(idList: string[]): Promise<CashTransaction[]> {
        return this.createQueryBuilder('t')
            .andWhere(`t.id IN (${idList.join(', ')})`)
            .leftJoinAndSelect('t.cashSplitList', 's')
            .leftJoinAndSelect('s.account', 'a')
            .leftJoinAndSelect('s.currency', 'c')
            .getMany();
    }

    async findBestMatch(searchString): Promise<CashTransaction | undefined> {
        const stringQuery = Array.from(
            CashTransactionIndexUtils.generateListItem(searchString),
        ).join(' OR ');

        const cashTransactionIndexRepository = getManager().getCustomRepository(
            CashTransactionIndexRepository,
        );
        const cashTransactionIdQb = cashTransactionIndexRepository
            .createQueryBuilder('cashTransactionIdx')
            .select('rowId')
            .andWhere(`cash_transaction_idx MATCH :stringQuery`)
            .orderBy('rank')
            .limit(1);

        return await this.createQueryBuilder('t')
            .leftJoinAndSelect('t.cashSplitList', 's')
            .leftJoinAndSelect('s.account', 'a')
            .andWhere(`t.id IN ( ${cashTransactionIdQb.getQuery()} )`)
            .setParameter('stringQuery', stringQuery)
            .getOne();
    }

    async countForThisAccountId(accountId: string): Promise<number> {
        return await this.createQueryBuilder('t')
            .andWhere('toSplitAccountId = :accountId')
            .orWhere('fromSplitAccountId = :accountId')
            .setParameter('accountId', accountId)
            .getCount();
    }

    async deleteCustom(
        parameters: TransactionParameters = simpleTransactionParameters,
    ): Promise<DeleteResult> {
        // There is a Bug in TypeORM: the alias doesn't work with delete
        let qb = this.createQueryBuilder().delete();

        qb = this.createWhereClause(qb, parameters, 'cash_transaction');

        return await qb.execute();
    }

    createWhereClause<T extends WhereExpression>(
        qb: T,
        parameters: TransactionParameters = simpleTransactionParameters,
        alias: string = 't',
    ): T {
        qb = QueryBuilderUtil.addDateFilter(
            qb,
            alias,
            'createdDate',
            parameters.createdDateFrom,
            parameters.createdDateTo,
        );
        qb = QueryBuilderUtil.addDateFilter(
            qb,
            alias,
            'updatedDate',
            parameters.updatedDateFrom,
            parameters.updatedDateTo,
        );

        if (parameters.accountIdList && parameters.accountIdList.length > 0) {
            // tslint:disable-next-line:max-line-length
            qb = qb.andWhere(
                `(${alias}.fromSplitAccountId IN (${parameters.accountIdList.join(
                    ', ',
                )}) OR ${alias}.toSplitAccountId IN (${parameters.accountIdList.join(', ')}))`,
            );
        }
        if (parameters.fromAccountIdList && parameters.fromAccountIdList.length > 0) {
            qb = qb.andWhere(
                `${alias}.fromSplitAccountId IN (${parameters.fromAccountIdList.join(', ')})`,
            );
        }
        if (parameters.toAccountIdList && parameters.toAccountIdList.length > 0) {
            qb = qb.andWhere(
                `${alias}.toSplitAccountId IN (${parameters.toAccountIdList.join(', ')})`,
            );
        }
        if (parameters.currencyIdList && parameters.currencyIdList.length > 0) {
            // tslint:disable-next-line:max-line-length
            qb = qb.andWhere(
                `(${alias}.fromSplitCurrencyId IN (${parameters.currencyIdList.join(
                    ', ',
                )}) OR ${alias}.toSplitCurrencyId IN (${parameters.currencyIdList.join(', ')}))`,
            );
        }
        if (parameters.tagIdList && parameters.tagIdList.length > 0) {
            const formatedList = [...parameters.tagIdList]
                .sort()
                .map((item) => `${TAG_SEPARATOR}${item}${TAG_SEPARATOR}`);
            qb = qb.andWhere(`LIKE('%${formatedList.join('%')}%',${alias}.tagIdList)`);
        }
        if (parameters.amountLessThan) {
            // tslint:disable-next-line:max-line-length
            qb = qb.andWhere(
                `(abs(${alias}.fromSplitAmountCent) < ${
                    parameters.amountLessThan * 100
                } OR abs(${alias}.toSplitAmountCent) < ${parameters.amountLessThan * 100})`,
            );
        }
        if (parameters.amountGreaterThan) {
            // tslint:disable-next-line:max-line-length
            qb = qb.andWhere(
                `(abs(${alias}.fromSplitAmountCent) > ${
                    parameters.amountGreaterThan * 100
                } OR abs(${alias}.toSplitAmountCent) > ${parameters.amountGreaterThan * 100})`,
            );
        }
        if (parameters.amountEquals) {
            // tslint:disable-next-line:max-line-length
            qb = qb.andWhere(
                `(abs(${alias}.fromSplitAmountCent) == ${
                    parameters.amountEquals * 100
                } OR abs(${alias}.toSplitAmountCent) == ${parameters.amountEquals * 100})`,
            );
        }

        if (parameters.searchString && parameters.searchString.length > 1) {
            const stringQuery = Array.from(
                CashTransactionIndexUtils.generateListItem(parameters.searchString),
            ).join(' AND ');
            if (stringQuery.length > 0) {
                const repo = this.manager.getCustomRepository(CashTransactionIndexRepository);
                const cashTransactionIdQb = repo
                    .createQueryBuilder('cashTransactionIdx')
                    .select('rowId')
                    .andWhere(`cash_transaction_idx MATCH '{description} :${stringQuery}'`);
                qb = qb.andWhere(`${alias}.id IN ( ${cashTransactionIdQb.getQuery()} )`);
            }
        }

        if (parameters.detailSearchString && parameters.detailSearchString.length > 1) {
            const stringQuery = Array.from(
                CashTransactionIndexUtils.generateListItem(parameters.detailSearchString),
            ).join(' AND ');
            if (stringQuery.length > 0) {
                const repo = this.manager.getCustomRepository(CashTransactionIndexRepository);
                const cashTransactionIdQb = repo
                    .createQueryBuilder('cashTransactionIdx')
                    .select('rowId')
                    .andWhere(`cash_transaction_idx MATCH '{detail} :${stringQuery}'`);
                qb = qb.andWhere(`${alias}.id IN ( ${cashTransactionIdQb.getQuery()} )`);
            }
        }

        qb = QueryBuilderUtil.addDateFilter(
            qb,
            alias,
            'transactionDate',
            parameters.transactionDateFrom,
            parameters.transactionDateTo,
        );

        if (parameters.transactionTypeList && parameters.transactionTypeList.length > 0) {
            const formatedList = parameters.transactionTypeList.map((s) => `'${s}'`).join(', ');
            qb = qb.andWhere(`${alias}.type IN ( ${formatedList} )`);
        }

        return qb;
    }
}
