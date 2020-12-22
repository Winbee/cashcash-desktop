import { Service } from 'typedi';
import { EntityRepository, Repository } from 'typeorm';
import CashCurrency from '../entity/CashCurrency';

@Service()
@EntityRepository(CashCurrency)
export default class CashCurrencyRepository extends Repository<CashCurrency> {}
