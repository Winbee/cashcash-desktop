import { Service } from 'typedi';
import { EntityRepository, Repository } from 'typeorm';
import CashTransactionIndex from '../entity/CashTransactionIndex';

@Service()
@EntityRepository(CashTransactionIndex)
export default class CashTransactionIndexRepository extends Repository<CashTransactionIndex> {}
