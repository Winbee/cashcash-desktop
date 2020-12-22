import { Service, Container } from 'typedi';
import { getManager } from 'typeorm';

import CashPreferences from '../database/entity/CashPreferences';
import CashPreferencesRepository from '../database/repository/CashPreferencesRepository';
import CashCurrencyService from './CashCurrencyService';
import { v4 as uuidv4 } from 'uuid';
import { DEFAULT_PREFERENCES } from '../database/entity/CashPreferences';

@Service()
export default class CashPreferencesService {
    async get(): Promise<CashPreferences> {
        const repo = getManager().getCustomRepository(CashPreferencesRepository);
        const one = await repo.findOne({
            relations: ['preferedCurrency'],
        });
        if (!one) {
            return this.reset();
        } else {
            one.jsonPreferences = {
                ...DEFAULT_PREFERENCES,
                ...one.jsonPreferences,
            };
            return one;
        }
    }

    async save(cashPreferences: CashPreferences): Promise<CashPreferences> {
        const repo = getManager().getCustomRepository(CashPreferencesRepository);
        if (!cashPreferences.uuid) {
            cashPreferences.uuid = uuidv4();
        }
        return await repo.save(cashPreferences);
    }

    async reset(): Promise<CashPreferences> {
        this.delete();
        const repo = getManager().getCustomRepository(CashPreferencesRepository);
        const cashPreferences = new CashPreferences();
        const cashCurrencyService = Container.get(CashCurrencyService);
        const currency = await cashCurrencyService.find('USD');
        if (currency) {
            cashPreferences.preferedCurrencyId = currency.id;
        }
        return await repo.save(cashPreferences);
    }

    async delete() {
        const repo = getManager().getCustomRepository(CashPreferencesRepository);
        return await repo.deleteAll();
    }
}
