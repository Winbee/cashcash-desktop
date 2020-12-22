import { Service } from 'typedi';
import { EntityManager, FindOneOptions, getManager } from 'typeorm';

import CashCurrency from '../database/entity/CashCurrency';
import CashCurrencyRepository from '../database/repository/CashCurrencyRepository';

@Service()
export default class CashCurrencyService {
    async get(id: number): Promise<CashCurrency | undefined> {
        const repo = getManager().getCustomRepository(CashCurrencyRepository);
        return await repo.findOne(id);
    }

    async getList(): Promise<CashCurrency[]> {
        const repo = getManager().getCustomRepository(CashCurrencyRepository);
        return await repo.find({
            order: {
                name: 'ASC',
            },
        });
    }

    async save(cashCurrency: CashCurrency) {
        this.sanitize(cashCurrency);
        const repo = getManager().getCustomRepository(CashCurrencyRepository);
        return await repo.save(cashCurrency);
    }

    async delete(id: string) {
        const repo = getManager().getCustomRepository(CashCurrencyRepository);
        return await repo.delete(id);
    }

    async find(isoCode1: string, manager?: EntityManager) {
        const criteria: FindOneOptions<CashCurrency> = {
            select: ['id', 'name', 'isoCode', 'symbol'],
            where: {
                isoCode: isoCode1,
            },
        };

        if (!manager) {
            manager = getManager();
        }
        const repository = manager.getCustomRepository(CashCurrencyRepository);
        return await repository.findOne(criteria);
    }

    async init() {
        const currencyList: CashCurrency[] = CashCurrency.convertArray([
            { isoCode: 'EUR', name: 'Euro', symbol: '€' },
            { isoCode: 'AUD', name: 'Australian dollar', symbol: 'A$' },
            { isoCode: 'BGN', name: 'Bulgarian lev', symbol: 'лв' },
            { isoCode: 'BRL', name: 'Brazilian real', symbol: 'R$' },
            { isoCode: 'CAD', name: 'Canadian dollar', symbol: 'C$' },
            { isoCode: 'CHF', name: 'Swiss franc', symbol: 'Fr' },
            { isoCode: 'CNY', name: 'Renminbi', symbol: '元' },
            { isoCode: 'CZK', name: 'Czech koruna', symbol: 'Kč' },
            { isoCode: 'DKK', name: 'Danish krone', symbol: 'kr' },
            { isoCode: 'GBP', name: 'Pound sterling', symbol: '£' },
            { isoCode: 'HKD', name: 'Hong Kong dollar', symbol: 'HK$' },
            { isoCode: 'HRK', name: 'Croatian kuna', symbol: 'Kn' },
            { isoCode: 'HUF', name: 'Hungarian forint', symbol: 'Ft' },
            { isoCode: 'IDR', name: 'Indonesian rupiah', symbol: 'Rp' },
            { isoCode: 'ILS', name: 'Israeli new shekel', symbol: '₪' },
            { isoCode: 'INR', name: 'Indian rupee', symbol: '₹' },
            { isoCode: 'ISK', name: 'Icelandic króna', symbol: 'Íkr' },
            { isoCode: 'JPY', name: 'Japanese yen', symbol: '¥' },
            { isoCode: 'KRW', name: 'South Korean won', symbol: '₩' },
            { isoCode: 'MXN', name: 'Mexican peso', symbol: 'Mex$' },
            { isoCode: 'MYR', name: 'Malaysian ringgit', symbol: 'Rm' },
            { isoCode: 'NOK', name: 'Norwegian krone', symbol: 'Kr' },
            { isoCode: 'NZD', name: 'New Zealand dollar', symbol: 'NZ$' },
            { isoCode: 'PHP', name: 'Philippine peso', symbol: '₱' },
            { isoCode: 'PLN', name: 'Polish złoty', symbol: 'zł' },
            { isoCode: 'RON', name: 'Romanian leu', symbol: 'lei' },
            { isoCode: 'RUB', name: 'Russian ruble', symbol: '₽' },
            { isoCode: 'SEK', name: 'Swedish krona', symbol: 'kr' },
            { isoCode: 'SGD', name: 'Singapore dollar', symbol: 'S$' },
            { isoCode: 'THB', name: 'Thai baht', symbol: '฿' },
            { isoCode: 'TRY', name: 'Turkish lira', symbol: '₺' },
            { isoCode: 'USD', name: 'United States dollar', symbol: '$' },
            { isoCode: 'ZAR', name: 'South African rand', symbol: 'R' },
        ]);

        const repository = getManager().getCustomRepository(CashCurrencyRepository);
        const existingCurrencyList = await repository.find();
        if (existingCurrencyList.length === 0) {
            await repository.save(currencyList);
        }
    }

    private sanitize(item: CashCurrency) {
        if (item.name) {
            item.name = item.name.trim();
        }
        if (item.isoCode) {
            item.isoCode = item.isoCode.trim().toUpperCase();
        }
        if (item.symbol) {
            item.symbol = item.isoCode.trim();
        }
    }
}
