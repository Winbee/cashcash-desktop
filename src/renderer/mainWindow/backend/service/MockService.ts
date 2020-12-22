import { addMonths, startOfMonth, isAfter, setDate, endOfMonth } from 'date-fns';
import FlatCashTransaction from '../database/entity/proxy/FlatCashTransaction';
import CashAccountService from './CashAccountService';
import Container from 'typedi';
import CashTransactionService from './CashTransactionService';
import CashAccountType from '../database/entity/enumeration/CashAccountType';
import CashTransactionType from '../database/entity/enumeration/CashTransactionType';
import { Service } from 'typedi';
import faker from 'faker';
import i18n from '@/renderer/common/i18n/i18n';

@Service()
export class MockService {
    async addMockData() {
        if (process.env.NODE_ENV === 'development') {
            const mockInputArray = [
                {
                    outAccount: i18n.t('Wages and salarie'),
                    inAccount: i18n.t('Checking account'),
                    amount: 1150,
                    transactionDay: 3,
                },
                {
                    outAccount: i18n.t('Cash gifts received'),
                    inAccount: i18n.t('Checking account'),
                    amount: 80,
                    probablity: 0.1,
                    valueVariability: 80 * 0.5,
                },
                {
                    outAccount: i18n.t('Checking account'),
                    inAccount: i18n.t('Clothing'),
                    amount: 1566 / 12,
                    probablity: 0.5,
                    valueVariability: (1566 / 12) * 0.5,
                },
                {
                    outAccount: i18n.t('Checking account'),
                    inAccount: i18n.t('Footwear'),
                    amount: 391 / 12,
                    probablity: 0.3,
                    valueVariability: (391 / 12) * 0.8,
                },
                {
                    outAccount: i18n.t('Checking account'),
                    inAccount: i18n.t('Other clothing products and services'),
                    amount: 221 / 12,
                    probablity: 0.3,
                    valueVariability: (221 / 12) * 0.99,
                },
                {
                    outAccount: i18n.t('Checking account'),
                    inAccount: i18n.t('School books and supplies'),
                    amount: 56 / 12,
                    probablity: 0.8,
                    valueVariability: (56 / 12) * 0.5,
                },
                {
                    outAccount: i18n.t('Checking account'),
                    inAccount: i18n.t('Tuition'),
                    amount: 798 / 12,
                    probablity: 0.3,
                    valueVariability: (798 / 12) * 0.5,
                },
                {
                    outAccount: i18n.t('Checking account'),
                    inAccount: i18n.t('Television/cable services'),
                    amount: 672 / 12,
                    valueVariability: 672 / 12,
                },
                {
                    outAccount: i18n.t('Checking account'),
                    inAccount: i18n.t('Musical instruments'),
                    amount: 33 / 12,
                    probablity: 0.2,
                    valueVariability: (33 / 12) * 0.8,
                },
                {
                    outAccount: i18n.t('Checking account'),
                    inAccount: i18n.t('Video game and services'),
                    amount: 14 / 12,
                    probablity: 0.4,
                    valueVariability: (14 / 12) * 0.5,
                },
                {
                    outAccount: i18n.t('Checking account'),
                    inAccount: i18n.t('Streaming video services'),
                    amount: 50 / 12,
                    probablity: 0.8,
                    valueVariability: (50 / 12) * 1,
                },
                {
                    outAccount: i18n.t('Checking account'),
                    inAccount: i18n.t('Streaming audio services'),
                    amount: 11 / 12,
                    probablity: 0.8,
                    valueVariability: (11 / 12) * 0.5,
                },
                {
                    outAccount: i18n.t('Checking account'),
                    inAccount: i18n.t('Television and sound equipments'),
                    amount: 89 / 12,
                    probablity: 0.8,
                    valueVariability: (89 / 12) * 0.5,
                },
                {
                    outAccount: i18n.t('Checking account'),
                    inAccount: i18n.t('Video game and services'),
                    amount: 43 / 12,
                    probablity: 0.8,
                    valueVariability: (43 / 12) * 0.5,
                },
                {
                    outAccount: i18n.t('Checking account'),
                    inAccount: i18n.t('Sporting events'),
                    amount: 50 / 12,
                    probablity: 0.2,
                    valueVariability: (50 / 12) * 0.9,
                },
                {
                    outAccount: i18n.t('Checking account'),
                    inAccount: i18n.t('Sport/Gym subscription'),
                    amount: 198 / 12,
                    probablity: 0.8,
                    valueVariability: (198 / 12) * 0.5,
                },
                {
                    outAccount: i18n.t('Checking account'),
                    inAccount: i18n.t('Recreational lessons'),
                    amount: 113 / 12,
                    probablity: 0.8,
                    valueVariability: (113 / 12) * 0.5,
                },
                {
                    outAccount: i18n.t('Checking account'),
                    inAccount: i18n.t('Play, theater, opera'),
                    amount: 66 / 12,
                    probablity: 0.8,
                    valueVariability: (66 / 12) * 0.5,
                },
                {
                    outAccount: i18n.t('Checking account'),
                    inAccount: i18n.t('Movies'),
                    amount: 48 / 12,
                    probablity: 0.8,
                    valueVariability: (48 / 12) * 0.5,
                },
                {
                    outAccount: i18n.t('Checking account'),
                    inAccount: i18n.t('Parks or museums'),
                    amount: 26 / 12,
                    probablity: 0.8,
                    valueVariability: (26 / 12) * 0.5,
                },
                {
                    outAccount: i18n.t('Checking account'),
                    inAccount: i18n.t('Photographic equipment'),
                    amount: 40 / 12,
                    probablity: 0.8,
                    valueVariability: (40 / 12) * 0.5,
                },
                {
                    outAccount: i18n.t('Checking account'),
                    inAccount: i18n.t('Pet food'),
                    amount: 219 / 12,
                    probablity: 0.8,
                    valueVariability: (219 / 12) * 0.5,
                },
                {
                    outAccount: i18n.t('Checking account'),
                    inAccount: i18n.t('Pet purchase, supplies, medicine'),
                    amount: 150 / 12,
                    probablity: 0.8,
                    valueVariability: (150 / 12) * 0.5,
                },
                {
                    outAccount: i18n.t('Checking account'),
                    inAccount: i18n.t('Pet services'),
                    amount: 66 / 12,
                    probablity: 0.8,
                    valueVariability: (66 / 12) * 0.5,
                },
                {
                    outAccount: i18n.t('Checking account'),
                    inAccount: i18n.t('Vet services'),
                    amount: 225 / 12,
                    probablity: 0.8,
                    valueVariability: (225 / 12) * 0.5,
                },
                {
                    outAccount: i18n.t('Checking account'),
                    inAccount: i18n.t('Toys, arts and crafts'),
                    amount: 148 / 12,
                    probablity: 0.8,
                    valueVariability: (148 / 12) * 0.5,
                },
                {
                    outAccount: i18n.t('Checking account'),
                    inAccount: i18n.t('E-Books'),
                    amount: 24 / 12,
                    probablity: 0.8,
                    valueVariability: (24 / 12) * 0.5,
                },
                {
                    outAccount: i18n.t('Checking account'),
                    inAccount: i18n.t('Newspapers/Magazines'),
                    amount: 53 / 12,
                    probablity: 0.8,
                    valueVariability: (53 / 12) * 0.5,
                },
                {
                    outAccount: i18n.t('Checking account'),
                    inAccount: i18n.t('Bar'),
                    amount: 289 / 12,
                    probablity: 0.8,
                    valueVariability: (289 / 12) * 0.5,
                },
                {
                    outAccount: i18n.t('Checking account'),
                    inAccount: i18n.t('Market'),
                    amount: 1200 / 12,
                    probablity: 0.8,
                    valueVariability: (1200 / 12) * 0.5,
                },
                {
                    outAccount: i18n.t('Checking account'),
                    inAccount: i18n.t('Restaurant'),
                    amount: 3458 / 12,
                    probablity: 0.8,
                    valueVariability: (3458 / 12) * 0.5,
                },
                {
                    outAccount: i18n.t('Checking account'),
                    inAccount: i18n.t('Supermarket'),
                    amount: 3200 / 12,
                    probablity: 0.8,
                    valueVariability: (3200 / 12) * 0.5,
                },
                {
                    outAccount: i18n.t('Checking account'),
                    inAccount: i18n.t('Drugs'),
                    amount: 483 / 12,
                    probablity: 0.8,
                    valueVariability: (483 / 12) * 0.5,
                },
                {
                    outAccount: i18n.t('Checking account'),
                    inAccount: i18n.t('Commercial health insurance'),
                    amount: 662 / 12,
                    probablity: 0.8,
                    valueVariability: (662 / 12) * 0.5,
                },
                {
                    outAccount: i18n.t('Checking account'),
                    inAccount: i18n.t('Medical services'),
                    amount: 1566 / 12,
                    probablity: 0.8,
                    valueVariability: (1566 / 12) * 0.5,
                },
                {
                    outAccount: i18n.t('Checking account'),
                    inAccount: i18n.t('Medical supplies'),
                    amount: 171 / 12,
                    probablity: 0.8,
                    valueVariability: (171 / 12) * 0.5,
                },
                {
                    outAccount: i18n.t('Checking account'),
                    inAccount: i18n.t('Furniture'),
                    amount: 2024 / 12,
                    probablity: 0.8,
                    valueVariability: (2024 / 12) * 0.5,
                },
                {
                    outAccount: i18n.t('Checking account'),
                    inAccount: i18n.t('Other household expenses'),
                    amount: 1050 / 12,
                    probablity: 0.8,
                    valueVariability: (1050 / 12) * 0.5,
                },
                {
                    outAccount: i18n.t('Checking account'),
                    inAccount: i18n.t('Medical services'),
                    amount: 908 / 12,
                    probablity: 0.8,
                    valueVariability: (908 / 12) * 0.5,
                },
                {
                    outAccount: i18n.t('Checking account'),
                    inAccount: i18n.t('Babysitting'),
                    amount: 100 / 12,
                    probablity: 0.8,
                    valueVariability: (100 / 12) * 0.5,
                },
                {
                    outAccount: i18n.t('Checking account'),
                    inAccount: i18n.t('Insurance (Housing)'),
                    amount: 467 / 12,
                    probablity: 0.8,
                    valueVariability: (467 / 12) * 0.5,
                },
                {
                    outAccount: i18n.t('Checking account'),
                    inAccount: i18n.t('Repair commodities (Housing)'),
                    amount: 26 / 12,
                    probablity: 0.8,
                    valueVariability: (26 / 12) * 0.5,
                },
                {
                    outAccount: i18n.t('Checking account'),
                    inAccount: i18n.t('Repair services (Housing)'),
                    amount: 55 / 12,
                    probablity: 0.8,
                    valueVariability: (55 / 12) * 0.5,
                },
                {
                    outAccount: i18n.t('Checking account'),
                    inAccount: i18n.t('Rent'),
                    amount: 4057 / 12,
                },
                {
                    outAccount: i18n.t('Checking account'),
                    inAccount: i18n.t('Electricity'),
                    amount: 1496 / 12,
                    probablity: 0.8,
                    valueVariability: (1496 / 12) * 0.5,
                },
                {
                    outAccount: i18n.t('Checking account'),
                    inAccount: i18n.t('Natural gas'),
                    amount: 409 / 12,
                    probablity: 0.8,
                    valueVariability: (1566 / 12) * 0.5,
                },
                {
                    outAccount: i18n.t('Checking account'),
                    inAccount: i18n.t('Garbage collection'),
                    amount: 162 / 12,
                    probablity: 0.8,
                    valueVariability: (162 / 12) * 0.5,
                },
                {
                    outAccount: i18n.t('Checking account'),
                    inAccount: i18n.t('Water'),
                    amount: 445 / 12,
                    probablity: 0.8,
                    valueVariability: (445 / 12) * 0.5,
                },
                {
                    outAccount: i18n.t('Checking account'),
                    inAccount: i18n.t('Bank service charges'),
                    amount: 25 / 12,
                    probablity: 0.8,
                    valueVariability: (25 / 12) * 0.5,
                },
                {
                    outAccount: i18n.t('Checking account'),
                    inAccount: i18n.t('Personal care products'),
                    amount: 395 / 12,
                    probablity: 0.8,
                    valueVariability: (395 / 12) * 0.5,
                },
                {
                    outAccount: i18n.t('Checking account'),
                    inAccount: i18n.t('Personal care services'),
                    amount: 372 / 12,
                    probablity: 0.8,
                    valueVariability: (372 / 12) * 0.5,
                },
                {
                    outAccount: i18n.t('Checking account'),
                    inAccount: i18n.t('Gasoline and other fuels'),
                    amount: 2108 / 12,
                    probablity: 0.8,
                    valueVariability: (2108 / 12) * 0.5,
                },
                {
                    outAccount: i18n.t('Checking account'),
                    inAccount: i18n.t('Vehicle maintenance'),
                    amount: 889 / 12,
                    probablity: 0.8,
                    valueVariability: (889 / 12) * 0.5,
                },
                {
                    outAccount: i18n.t('Checking account'),
                    inAccount: i18n.t('Vehicle insurance'),
                    amount: 976 / 12,
                    probablity: 0.8,
                    valueVariability: (976 / 12) * 0.5,
                },
                {
                    outAccount: i18n.t('Checking account'),
                    inAccount: i18n.t('Parking fees'),
                    amount: 56 / 12,
                    probablity: 0.8,
                    valueVariability: (56 / 12) * 0.5,
                },
                {
                    outAccount: i18n.t('Checking account'),
                    inAccount: i18n.t('Tolls passes'),
                    amount: 48 / 12,
                    probablity: 0.8,
                    valueVariability: (48 / 12) * 0.5,
                },
                {
                    outAccount: i18n.t('Checking account'),
                    inAccount: i18n.t('Airline fares'),
                    amount: 500 / 12,
                    probablity: 0.8,
                    valueVariability: (500 / 12) * 0.5,
                },
                {
                    outAccount: i18n.t('Checking account'),
                    inAccount: i18n.t('Intercity bus/train fares'),
                    amount: 89 / 12,
                    probablity: 0.8,
                    valueVariability: (89 / 12) * 0.5,
                },
                {
                    outAccount: i18n.t('Checking account'),
                    inAccount: i18n.t('Intracity bus/train/metro fares'),
                    amount: 211 / 12,
                    probablity: 0.8,
                    valueVariability: (211 / 12) * 0.5,
                },
                {
                    outAccount: i18n.t('Checking account'),
                    inAccount: i18n.t('Taxi fares'),
                    amount: 71 / 12,
                    probablity: 0.8,
                    valueVariability: (71 / 12) * 0.5,
                },
            ];

            const now = startOfMonth(new Date());
            const nowMinus24month = addMonths(now, -24);

            let currentMonth = now;

            const cashAccountService = Container.get(CashAccountService);
            const cashTransactionService = Container.get(CashTransactionService);
            while (isAfter(currentMonth, nowMinus24month)) {
                for (const oneMockInput of mockInputArray) {
                    if (!oneMockInput.probablity || Math.random() < oneMockInput.probablity) {
                        let transactionDate = new Date(currentMonth);
                        if (oneMockInput.transactionDay) {
                            transactionDate = setDate(transactionDate, oneMockInput.transactionDay);
                        } else {
                            transactionDate = faker.date.between(
                                startOfMonth(currentMonth),
                                endOfMonth(currentMonth),
                            );
                        }
                        let amount;
                        if (oneMockInput.valueVariability) {
                            const fromValue = Math.max(
                                1,
                                oneMockInput.amount - oneMockInput.valueVariability,
                            );
                            const toValue = oneMockInput.amount - oneMockInput.valueVariability;
                            amount = this.getRandomNumber(fromValue, toValue);
                        } else {
                            amount = oneMockInput.amount;
                        }

                        const inAccount = await cashAccountService.find(
                            oneMockInput.inAccount.toString(),
                        );
                        if (!inAccount) {
                            throw new Error(`Account not found: ${oneMockInput.inAccount}`);
                        }
                        const outAccount = await cashAccountService.find(
                            oneMockInput.outAccount.toString(),
                        );
                        if (!outAccount) {
                            throw new Error(`Account not found: ${oneMockInput.outAccount}`);
                        }
                        const flatCashTransaction: FlatCashTransaction = new FlatCashTransaction({
                            description: `${faker.commerce.product()} from ${faker.company.companyName()}`,
                            detail: faker.lorem.sentence(3),
                            transactionDate,
                            currency: inAccount.currency,
                            amount,
                            inAccount,
                            outAccount,
                            type:
                                inAccount.type === CashAccountType.ASSET
                                    ? CashTransactionType.INCOME
                                    : CashTransactionType.EXPENSE,
                        });
                        await cashTransactionService.save(flatCashTransaction);
                        // tslint:disable-next-line:no-console
                        console.log('Transaction created');
                    }
                }
                currentMonth = addMonths(currentMonth, -1);
            }
        }
    }

    private getRandomNumber(fromNumber: number, toNumber: number): number {
        return fromNumber + Math.random() * (toNumber - fromNumber);
    }
}
