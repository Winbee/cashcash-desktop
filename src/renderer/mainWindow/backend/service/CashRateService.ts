import { Service } from 'typedi';
import { getManager, In } from 'typeorm';

import CashRate from '../database/entity/CashRate';
import CashRateRepository from '../database/repository/CashRateRepository';
import { RateParameters } from './dto/Parameters';
import Page from './dto/Page';

@Service()
export default class CashRateService {
    cache: Map<string, CashRate> = new Map();

    async get(id: string): Promise<CashRate | undefined> {
        const repo = getManager().getCustomRepository(CashRateRepository);
        return await repo.findOne(id, {
            relations: ['fromCurrency', 'toCurrency'],
        });
    }

    async getPage(
        currentPage: number = 1,
        parameters: RateParameters = {},
        itemPerPage: number = 15,
    ): Promise<Page<CashRate>> {
        const repo = getManager().getCustomRepository(CashRateRepository);
        return await repo.findCustom(currentPage, itemPerPage, parameters);
    }

    async getByCurrency(
        fromCurrencyId: number,
        toCurrencyId: number,
    ): Promise<CashRate | undefined> {
        const key = this.createKey(fromCurrencyId, toCurrencyId);
        const cachedRate = this.cache.get(key);
        if (cachedRate) {
            return cachedRate;
        } else {
            const repo = getManager().getCustomRepository(CashRateRepository);
            const result = await repo.findOne({
                select: ['id', 'fromCurrencyId', 'toCurrencyId', 'rate', 'updatedDate'],
                where: {
                    fromCurrencyId,
                    toCurrencyId,
                },
                order: {
                    updatedDate: 'DESC',
                },
            });
            if (result) {
                this.cache.set(key, result);
            }
            return result;
        }
    }

    async getList(): Promise<CashRate[]> {
        const repo = getManager().getCustomRepository(CashRateRepository);
        return await repo.find();
    }

    async getListByParam(parameters: RateParameters = {}): Promise<CashRate[]> {
        const repo = getManager().getCustomRepository(CashRateRepository);
        return await repo.findListCustom();
    }

    async save(cashRate: CashRate) {
        return await getManager().transaction(async (transactionalEntityManager) => {
            const repo = transactionalEntityManager.getCustomRepository(CashRateRepository);
            const oldCashRate = await this.getByCurrency(
                cashRate.fromCurrencyId,
                cashRate.toCurrencyId,
            );
            if (oldCashRate && oldCashRate.id !== cashRate.id) {
                await repo.delete(oldCashRate.id);
            }
            this.cache.clear();
            return await repo.save(cashRate);
        });
    }

    async delete(id: string) {
        const repo = getManager().getCustomRepository(CashRateRepository);
        this.cache.clear();
        return await repo.delete(id);
    }

    async deleteList(idList: string[]) {
        const repo = getManager().getCustomRepository(CashRateRepository);
        this.cache.clear();
        return await repo.delete(idList);
    }

    async removeRate(currencyId1: number, currencyId2: number) {
        const repository = getManager().getCustomRepository(CashRateRepository);
        const currencyIdList = [currencyId1, currencyId2];
        const rateList: CashRate[] = await repository.find({
            select: ['id'],
            where: {
                fromCurrencyId: In(currencyIdList),
                toCurrencyId: In(currencyIdList),
            },
        });
        this.cache.clear();
        await repository.remove(rateList);
    }

    private createKey(fromCurrencyId: number, toCurrencyId: number): string {
        return fromCurrencyId + '_to_' + toCurrencyId;
    }
}
