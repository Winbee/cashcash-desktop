import { Service } from 'typedi';
import { getManager, EntityManager } from 'typeorm';

import { TagParameters } from './dto/Parameters';
import Page from './dto/Page';
import CashTag from '../database/entity/CashTag';
import CashTagRepository from '../database/repository/CashTagRepository';
import StringUtils from '../utils/StringUtils';

@Service()
export default class CashTagService {
    async get(id: string): Promise<CashTag | undefined> {
        const repo = getManager().getCustomRepository(CashTagRepository);
        return await repo.findOne(id);
    }

    async getPage(
        currentPage: number = 1,
        parameters: TagParameters = {},
        itemPerPage: number = 15,
    ): Promise<Page<CashTag>> {
        const repo = getManager().getCustomRepository(CashTagRepository);
        return await repo.findCustom(currentPage, itemPerPage, parameters);
    }

    async getList(): Promise<CashTag[]> {
        const repo = getManager().getCustomRepository(CashTagRepository);
        return await repo.find();
    }

    async getListByParam(parameters: TagParameters = {}): Promise<CashTag[]> {
        const repo = getManager().getCustomRepository(CashTagRepository);
        return await repo.findListCustom(parameters);
    }

    async save(item: CashTag) {
        this.sanitize(item);
        const repo = getManager().getCustomRepository(CashTagRepository);
        return await repo.save(item);
    }

    async duplicate(id: string): Promise<CashTag | undefined> {
        const item = await this.get(id);
        if (item) {
            return new CashTag({
                name: StringUtils.generateDuplicateName(item.name, true),
            });
        }
        return;
    }

    async delete(id: string) {
        return await getManager().transaction(async (entityManager: EntityManager) => {
            const item: CashTag | undefined = await this.get(id)!;
            if (item) {
                await entityManager.remove(item);
            }
        });
    }

    async deleteList(idList: string[]) {
        for (const id of idList) {
            await this.delete(id);
        }
    }

    private sanitize(item: CashTag) {
        if (item.name) {
            item.name = StringUtils.keepLetterNumberDashOnly(item.name).toLowerCase();
        }
    }
}
