import { getManager } from 'typeorm';
import { Inject, Service } from 'typedi';

import CashAccount from '../database/entity/CashAccount';
import CashAccountType from '../database/entity/enumeration/CashAccountType';
import CashAccountRepository from '../database/repository/CashAccountRepository';
import CashCurrencyService from './CashCurrencyService';
import CashCurrency from '../database/entity/CashCurrency';
import { AccountParameters } from './dto/Parameters';
import { DependentObject } from './dto/DependentObject';
import Container from 'typedi';
import CashTransactionService from './CashTransactionService';
import CashFilterService from './CashFilterService';
import CashRuleService from './CashRuleService';
import CashAccountUtils from '../utils/CashAccountUtils';
import i18n from '@/renderer/common/i18n/i18n';

@Service()
export default class CashAccountService {
    @Inject((type) => CashCurrencyService)
    private cashCurrencyService: CashCurrencyService;

    async get(id: number | string): Promise<CashAccount | undefined> {
        const cashAccountRepository = getManager().getCustomRepository(CashAccountRepository);
        return await cashAccountRepository.findOne(id, {
            relations: ['bankInfo', 'currency', 'parentAccount'],
        });
    }

    async find(name: string): Promise<CashAccount | undefined> {
        const cashAccountRepository = getManager().getCustomRepository(CashAccountRepository);
        return await cashAccountRepository.findOne({
            where: {
                name,
            },
            relations: ['currency'],
        });
    }

    async getList(): Promise<CashAccount[]> {
        const repo = getManager().getCustomRepository(CashAccountRepository);
        return await repo.find({
            relations: ['bankInfo', 'currency'],
            order: {
                name: 'ASC',
            },
        });
    }

    async getInternalLeafList(): Promise<CashAccount[]> {
        const repo = getManager().getCustomRepository(CashAccountRepository);
        const parameters: AccountParameters = {
            accountIdList: [],
            currencyIdList: [],
            accountTypeList: [
                CashAccountType.ASSET,
                CashAccountType.OPENING,
                CashAccountType.LIABILITY,
            ],
            isLeaf: true,
        };
        return await repo.findCustom(parameters);
    }

    async hasAccount(): Promise<boolean> {
        const repo = getManager().getCustomRepository(CashAccountRepository);
        const accountCount = await repo.count();
        return accountCount > 0;
    }

    async countChildrenAccount(id: string): Promise<number> {
        const repo = getManager().getCustomRepository(CashAccountRepository);
        return await repo.count({
            where: {
                parentAccountId: id,
            },
        });
    }

    async save(
        cashAccount: CashAccount,
        oldAccountMap: Map<number, CashAccount>,
    ): Promise<CashAccount> {
        this.validate(cashAccount, oldAccountMap);
        this.sanitize(cashAccount);
        const repo = getManager().getCustomRepository(CashAccountRepository);
        if (cashAccount.parentAccount) {
            cashAccount.type = cashAccount.parentAccount.type;
        }
        return await repo.save(cashAccount);
    }

    validate(cashAccount: CashAccount, oldAccountMap: Map<number, CashAccount>): void {
        if (cashAccount.parentAccount) {
            if (cashAccount.id) {
                if (cashAccount.parentAccount.id === cashAccount.id) {
                    throw new Error('The parent of the account is the account itself');
                }
                // No circular dependencie allowed
                // The parent of cashAccount should not be in any of the children
                const oldCashAccount = oldAccountMap.get(cashAccount.id);
                if (
                    oldCashAccount &&
                    CashAccountUtils.contains(oldCashAccount.children, cashAccount.parentAccount)
                ) {
                    throw new Error('The parent of the account is one of its children');
                }
            }

            // The parent should have the same type
            if (cashAccount.type !== cashAccount.parentAccount.type) {
                throw new Error('Account and its parent should have the same type');
            }
            // The parent should be a directory
            if (!cashAccount.parentAccount.isDirectory) {
                throw new Error('Parent account should be a directory');
            }
        }
        // If not a directory, it shouldn't have children
        if (!cashAccount.isDirectory && cashAccount.children && cashAccount.children.length > 0) {
            throw new Error('Only directory account can have children.');
        }
    }

    async countDependentObject(id: string): Promise<DependentObject[]> {
        const dependentObjectList: DependentObject[] = [];
        // Get child account
        const accountNumber: number = await this.countChildrenAccount(id);
        if (accountNumber > 0) {
            dependentObjectList.push({
                description: 'Accounts with this parent',
                numberOfDep: accountNumber,
            });
        }

        // Get transaction
        const cashTransactionService = Container.get(CashTransactionService);
        const transactionNumber: number = await cashTransactionService.countForThisAccountId(id);
        dependentObjectList.push({
            description: 'Transactions',
            numberOfDep: transactionNumber,
        });

        // Get filter
        const cashFilterService = Container.get(CashFilterService);
        const filterNumber: number = await cashFilterService.countForThisAccountId(id);
        dependentObjectList.push({
            description: 'Filters',
            numberOfDep: filterNumber,
        });

        // Get rule
        const cashRuleService = Container.get(CashRuleService);
        const ruleNumber: number = await cashRuleService.countForThisAccountId(id);
        dependentObjectList.push({
            description: 'Rules',
            numberOfDep: ruleNumber,
        });

        return dependentObjectList;
    }

    async delete(id: string) {
        const dependentObjectList = await this.countDependentObject(id);
        if (dependentObjectList.some((item) => item.numberOfDep > 0)) {
            throw new Error("Can't delete this CashAccount because other objects depend on it.");
        }

        const repo = getManager().getCustomRepository(CashAccountRepository);
        return await repo.delete(id);
    }

    async init(currency?: CashCurrency) {
        if (!currency) {
            currency = (await this.cashCurrencyService.find('EUR'))!;
        }

        const accountList: CashAccount[] = CashAccount.convertArray([
            {
                name: i18n.t(CashAccountType.ASSET),
                type: CashAccountType.ASSET,
                currency,
                isProtected: true,
                code: 'ASS',
                children: [
                    {
                        name: i18n.t('Current assets'),
                        children: [
                            {
                                name: i18n.t('Default bank'),
                                children: [i18n.t('Checking account'), i18n.t('Saving account')],
                            },
                            {
                                name: i18n.t('Cash'),
                                children: [{ name: i18n.t('Cash in ') + currency.isoCode }],
                            },
                        ],
                    },
                ],
            },
            {
                name: i18n.t(CashAccountType.OPENING),
                type: CashAccountType.OPENING,
                currency,
                isProtected: true,
                code: 'OPE',
                children: [{ name: i18n.t('Opening balances') }],
            },
            {
                name: i18n.t(CashAccountType.EXPENSE),
                type: CashAccountType.EXPENSE,
                currency,
                isProtected: true,
                code: 'EXP',
                children: [
                    {
                        name: i18n.t('Food and beverages'),
                        children: [
                            i18n.t('Supermarket'),
                            i18n.t('Market'),
                            i18n.t('Restaurant'),
                            i18n.t('Bar'),
                        ],
                    },
                    {
                        name: i18n.t('Housing'),
                        children: [
                            {
                                name: i18n.t('Shelter'),
                                children: [
                                    i18n.t('Morgage interest (Housing)'),
                                    i18n.t('Property taxes'),
                                    i18n.t('Rent'),
                                    {
                                        name: i18n.t('Other shelter expenses'),
                                        children: [
                                            i18n.t('Insurance (Housing)'),
                                            i18n.t('Repair services (Housing)'),
                                            i18n.t('Repair commodities (Housing)'),
                                            i18n.t('Furniture'),
                                        ],
                                    },
                                ],
                            },
                            {
                                name: i18n.t('Utilities and fuels (Housing)'),
                                children: [
                                    i18n.t('Natural gas'),
                                    i18n.t('Electricity'),
                                    i18n.t('Fuel (Housing)'),
                                    i18n.t('Water'),
                                    i18n.t('Garbage collection'),
                                ],
                            },
                            {
                                name: i18n.t('Household operations'),
                                children: [
                                    {
                                        name: i18n.t('Personal services'),
                                        children: [i18n.t('Babysitting'), i18n.t('Preschools')],
                                    },
                                ],
                            },
                            i18n.t('Other household expenses'),
                        ],
                    },
                    {
                        name: i18n.t('Informatic and communication'),
                        children: [
                            i18n.t('Internet services'),
                            i18n.t('Phone services'),
                            i18n.t('Computer/Phone purchase'),
                        ],
                    },
                    {
                        name: i18n.t('Clothing and services'),
                        children: [
                            i18n.t('Clothing'),
                            i18n.t('Footwear'),
                            i18n.t('Other clothing products and services'),
                        ],
                    },
                    {
                        name: i18n.t('Transportation'),
                        children: [
                            i18n.t('Vehicle purchases'),
                            i18n.t('Gasoline and other fuels'),
                            {
                                name: i18n.t('Other vehicle expenses'),
                                children: [
                                    i18n.t('Vehicle finance charges'),
                                    i18n.t('Vehicle maintenance'),
                                    i18n.t('Vehicle insurance'),
                                    {
                                        name: i18n.t('Vehicle other charges'),
                                        children: [
                                            i18n.t('Vehicle registration'),
                                            i18n.t('Parking fees'),
                                            i18n.t('Tolls passes'),
                                            i18n.t('Fines and Tickets'),
                                        ],
                                    },
                                ],
                            },
                            {
                                name: i18n.t('Public and other transportation'),
                                children: [
                                    i18n.t('Airline fares'),
                                    i18n.t('Intercity bus/train fares'),
                                    i18n.t('Intracity bus/train/metro fares'),
                                    i18n.t('Taxi fares'),
                                    i18n.t('Ship fares'),
                                    i18n.t('School bus'),
                                    i18n.t('Rented vehicles'),
                                ],
                            },
                        ],
                    },
                    {
                        name: i18n.t('Healthcare'),
                        children: [
                            i18n.t('Commercial health insurance'),
                            i18n.t('Medical services'),
                            i18n.t('Drugs'),
                            i18n.t('Medical supplies'),
                        ],
                    },
                    {
                        name: i18n.t('Entertainment'),
                        children: [
                            {
                                name: i18n.t('Fees and admissions'),
                                children: [
                                    i18n.t('Sport/Gym subscription'),
                                    i18n.t('Play, theater, opera'),
                                    i18n.t('Concert'),
                                    i18n.t('Movies'),
                                    i18n.t('Parks or museums'),
                                    i18n.t('Sporting events'),
                                    i18n.t('Recreational lessons'),
                                ],
                            },
                            {
                                name: i18n.t('Audio, visual equipment and services'),
                                children: [
                                    i18n.t('Television and sound equipments'),
                                    i18n.t('Television/cable services'),
                                    i18n.t('Streaming audio services'),
                                    i18n.t('Streaming video services'),
                                    i18n.t('Video game and services'),
                                    i18n.t('Musical instruments'),
                                ],
                            },
                            {
                                name: i18n.t('Reading'),
                                children: [
                                    i18n.t('Newspapers/Magazines'),
                                    i18n.t('Books'),
                                    i18n.t('E-Books'),
                                ],
                            },
                            {
                                name: i18n.t('Pets'),
                                children: [
                                    i18n.t('Pet food'),
                                    i18n.t('Pet purchase, supplies, medicine'),
                                    i18n.t('Pet services'),
                                    i18n.t('Vet services'),
                                ],
                            },
                            {
                                name: i18n.t('Other entertainment'),
                                children: [
                                    i18n.t('Toys, arts and crafts'),
                                    i18n.t('Playground equipment'),
                                    i18n.t('Sport equipment'),
                                    i18n.t('Photographic equipment'),
                                    i18n.t('Hotel, camping, homestay'),
                                ],
                            },
                        ],
                    },
                    {
                        name: i18n.t('Personal care'),
                        children: [
                            i18n.t('Personal care products'),
                            i18n.t('Personal care services'),
                        ],
                    },
                    {
                        name: i18n.t('Education'),
                        children: [
                            i18n.t('Tuition'),
                            i18n.t('Tutoring service'),
                            i18n.t('School books and supplies'),
                        ],
                    },
                    {
                        name: i18n.t('Miscellaneous'),
                        children: [
                            i18n.t('Miscellaneous fees'),
                            i18n.t('Bank service charges'),
                            i18n.t('Postal fees'),
                        ],
                    },
                    {
                        name: i18n.t('Cash contributions'),
                        children: [
                            i18n.t('Child support'),
                            i18n.t('Charity'),
                            i18n.t('Cash gifts given'),
                        ],
                    },
                    {
                        name: i18n.t('Personal insurance and pensions'),
                        children: [
                            i18n.t('Life and other personal insurance'),
                            i18n.t('Pensions and Social Security'),
                        ],
                    },
                    {
                        name: i18n.t('Personal taxes'),
                        children: [
                            i18n.t('Federal income taxes'),
                            i18n.t('State and local income taxes'),
                            i18n.t('Other taxes'),
                        ],
                    },
                    {
                        name: i18n.t('Unknown expense'),
                        isProtected: true,
                        code: 'EXP_UNK',
                    },
                ],
            },
            {
                name: i18n.t(CashAccountType.INCOME),
                type: CashAccountType.INCOME,
                isProtected: true,
                currency,
                code: 'INC',
                children: [
                    i18n.t('Wages and salarie'),
                    i18n.t('Self-employment income'),
                    {
                        name: i18n.t('Other incomes'),
                        children: [
                            i18n.t('Interest and dividends'),
                            i18n.t('Rental income'),
                            i18n.t('Royalty, estate, trust income'),
                            i18n.t('Cash gifts received'),
                        ],
                    },
                    {
                        name: i18n.t('Welfare benefit'),
                        children: [i18n.t('Unemployment compensation'), i18n.t('Familly benefits')],
                    },
                    {
                        name: i18n.t('Unknown income'),
                        isProtected: true,
                        code: 'INC_UNK',
                    },
                ],
            },
            {
                name: i18n.t(CashAccountType.LIABILITY),
                type: CashAccountType.LIABILITY,
                isProtected: true,
                currency,
                code: 'LIA',
                children: [
                    { name: i18n.t('Credit card') },
                    {
                        name: i18n.t('Loan'),
                        children: [
                            i18n.t('Mortgage loan'),
                            i18n.t('Student loan'),
                            i18n.t('Other loan'),
                        ],
                    },
                ],
            },
        ]);

        const repository = getManager().getCustomRepository(CashAccountRepository);
        const existingList = await repository.find();
        if (existingList.length === 0) {
            await repository.save(accountList);
        }
    }

    private sanitize(account: CashAccount) {
        if (account.name) {
            account.name = account.name.trim();
        }
        if (account.code) {
            account.code = account.code.trim().toUpperCase();
        }
        if (account.code === '') {
            account.code = null;
        }
    }
}
