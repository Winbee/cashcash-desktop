import { Service } from 'typedi';
import { getManager } from 'typeorm';

import { RuleParameters } from './dto/Parameters';
import Page from './dto/Page';
import CashAction from '../database/entity/CashAction';
import CashActionRepository from '../database/repository/CashActionRepository';
import StringUtils from '../utils/StringUtils';

@Service()
export default class CashActionService {
    async get(id: string): Promise<CashAction | undefined> {
        const repo = getManager().getCustomRepository(CashActionRepository);
        return await repo.findOne(id, {
            relations: ['cashAccountList'],
        });
    }

    async getPage(
        currentPage: number = 1,
        parameters: RuleParameters = {},
        itemPerPage: number = 15,
    ): Promise<Page<CashAction>> {
        const repo = getManager().getCustomRepository(CashActionRepository);
        return await repo.findCustom(currentPage, itemPerPage, parameters);
    }

    async getList(): Promise<CashAction[]> {
        const repo = getManager().getCustomRepository(CashActionRepository);
        return await repo.find();
    }

    async getListByParam(parameters: RuleParameters = {}): Promise<CashAction[]> {
        const repo = getManager().getCustomRepository(CashActionRepository);
        return await repo.findListCustom(parameters);
    }

    async save(item: CashAction): Promise<CashAction> {
        this.sanitize(item);
        const repo = getManager().getCustomRepository(CashActionRepository);
        return await repo.save(item);
    }

    async duplicate(id: string): Promise<CashAction | undefined> {
        const item = await this.get(id);
        if (item) {
            return new CashAction({
                name: StringUtils.generateDuplicateName(item.name),
                jsonActionList: item.jsonActionList,
            });
        }
        return;
    }

    async delete(id: string) {
        const repo = getManager().getCustomRepository(CashActionRepository);
        return await repo.delete(id);
    }

    async deleteList(idList: string[]) {
        const repo = getManager().getCustomRepository(CashActionRepository);
        return await repo.delete(idList);
    }

    private sanitize(item: CashAction) {
        if (item.name) {
            item.name = item.name.trim();
        }
    }
}
