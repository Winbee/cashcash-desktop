import { Service } from 'typedi';
import { getManager } from 'typeorm';

import CashImportConfig from '../database/entity/CashImportConfig';
import CashImportConfigRepository from '../database/repository/CashImportConfigRepository';
import CashImportConfigDetails from '../database/entity/proxy/CashImportConfigDetails';
import CashImportAccountType from '../database/entity/enumeration/CashImportAccountType';
import CashImportCurrencyType from '../database/entity/enumeration/CashImportCurrencyType';
import { ImportConfigParameters } from './dto/Parameters';
import Page from './dto/Page';
import StringUtils from '../utils/StringUtils';
import CashImportType from '../database/entity/enumeration/CashImportType';

@Service()
export default class CashImportConfigService {
    async get(id: string): Promise<CashImportConfig | undefined> {
        const repo = getManager().getCustomRepository(CashImportConfigRepository);
        return await repo.findOne(id);
    }

    async getPage(
        currentPage: number = 1,
        parameters: ImportConfigParameters = {},
        itemPerPage: number = 15,
    ): Promise<Page<CashImportConfig>> {
        const repo = getManager().getCustomRepository(CashImportConfigRepository);
        return await repo.findCustom(currentPage, itemPerPage, parameters);
    }

    async getList(): Promise<CashImportConfig[]> {
        const repo = getManager().getCustomRepository(CashImportConfigRepository);
        return await repo.find();
    }

    async getListByParam(parameters: ImportConfigParameters = {}): Promise<CashImportConfig[]> {
        const repo = getManager().getCustomRepository(CashImportConfigRepository);
        return await repo.findListCustom(parameters);
    }

    async save(cashImportConfig: CashImportConfig) {
        const repo = getManager().getCustomRepository(CashImportConfigRepository);
        return await repo.save(cashImportConfig);
    }

    async duplicate(id: string): Promise<CashImportConfig | undefined> {
        const item = await this.get(id);
        if (item) {
            return new CashImportConfig({
                name: StringUtils.generateDuplicateName(item.name),
                type: item.type,
                jsonConfig: item.jsonConfig,
            });
        }
        return;
    }

    async delete(id: string) {
        const repo = getManager().getCustomRepository(CashImportConfigRepository);
        return await repo.delete(id);
    }

    async deleteList(idList: string[]) {
        const repo = getManager().getCustomRepository(CashImportConfigRepository);
        return await repo.delete(idList);
    }

    async init() {
        const repository = getManager().getCustomRepository(CashImportConfigRepository);
        const existingList = await repository.find();
        if (existingList.length === 0) {
            const item: CashImportConfig = new CashImportConfig({
                name: 'Example',
                type: CashImportType.SPREADSHEET,
                jsonConfig: {
                    parsing: {
                        type: CashImportType.SPREADSHEET,
                        header: true,
                    },
                    converting: {
                        property: {
                            importId: {
                                index: 8,
                            },
                            description: {
                                extra: [
                                    {
                                        prefix: '',
                                        index: 7,
                                        cleanSpace: true,
                                    },
                                    {
                                        prefix: 'Partner:',
                                        index: 4,
                                        cleanSpace: true,
                                    },
                                    {
                                        prefix: 'Account of partner:',
                                        index: 5,
                                        cleanSpace: true,
                                    },
                                ],
                            },
                            account: {
                                index: 0,
                                format: CashImportAccountType.NAME,
                            },
                            transactionDate: {
                                index: 2,
                                format: 'yyyyMMdd',
                            },
                            amount: {
                                index: 6,
                                decimalSeparator: 'auto-detect',
                            },
                            currency: {
                                index: 1,
                                format: CashImportCurrencyType.ISO_CODE,
                            },
                        },
                    },
                } as CashImportConfigDetails,
            });

            await repository.save(item);
        }
    }
}
