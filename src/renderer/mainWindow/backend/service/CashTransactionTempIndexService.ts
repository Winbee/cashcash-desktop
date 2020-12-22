import { Service } from 'typedi';
import FlatCashTransaction from '../database/entity/proxy/FlatCashTransaction';
import CashTransactionTempIndexRepository from '../database/repository/CashTransactionTempIndexRepository';
import { getManager } from 'typeorm';
import CashTransactionTempIndex from '../database/entity/CashTransactionTempIndex';

@Service()
export default class CashTransactionTempIndexService {
    async putTransaction(transaction: FlatCashTransaction) {
        const indexRepository: CashTransactionTempIndexRepository = getManager().getCustomRepository(
            CashTransactionTempIndexRepository,
        );
        await indexRepository.delete(1);
        await indexRepository.insert(
            new CashTransactionTempIndex({
                rowId: 1,
                description: transaction.description,
                detail: transaction.detail,
            }),
        );
    }

    async descriptionMatch(searchString: string): Promise<boolean> {
        const indexRepository: CashTransactionTempIndexRepository = getManager().getCustomRepository(
            CashTransactionTempIndexRepository,
        );
        return await indexRepository.descriptionMatch(searchString);
    }

    async detailMatch(searchString: string): Promise<boolean> {
        const indexRepository: CashTransactionTempIndexRepository = getManager().getCustomRepository(
            CashTransactionTempIndexRepository,
        );
        return await indexRepository.detailMatch(searchString);
    }
}
