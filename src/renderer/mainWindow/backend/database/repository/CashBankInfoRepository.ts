import { Service } from 'typedi';
import { EntityRepository, Repository } from 'typeorm';
import CashBankInfo from '../entity/CashBankInfo';

@Service()
@EntityRepository(CashBankInfo)
export default class CashBankInfoRepository extends Repository<CashBankInfo> {}
