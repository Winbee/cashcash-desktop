import { Service } from 'typedi';
import { EntityRepository, Repository, DeleteResult } from 'typeorm';
import CashPreferences from '../entity/CashPreferences';

@Service()
@EntityRepository(CashPreferences)
export default class CashPreferencesRepository extends Repository<CashPreferences> {
    async deleteAll(): Promise<DeleteResult> {
        return await this.createQueryBuilder().delete().execute();
    }
}
