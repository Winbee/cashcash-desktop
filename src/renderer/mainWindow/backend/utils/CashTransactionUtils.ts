import _ from 'lodash';
import FlatCashTransaction from '../database/entity/proxy/FlatCashTransaction';
import CashTransaction from '../database/entity/CashTransaction';
import CashTransactionType from '../database/entity/enumeration/CashTransactionType';
import CashSplit from '../database/entity/CashSplit';
import CashAccount from '../database/entity/CashAccount';
import CashAccountType from '../database/entity/enumeration/CashAccountType';
import CashCurrency from '../database/entity/CashCurrency';
import PrintUtils from './PrintUtils';
import GenericSplit from '../service/dto/GenericSplit';

export default class CashTransactionUtils {
    static getPositiveSplit(cashTransaction: CashTransaction): CashSplit {
        return _.find(cashTransaction.cashSplitList, (split) => {
            return +split.amount > 0;
        })!;
    }

    static getNegativeSplit(cashTransaction: CashTransaction): CashSplit {
        return _.find(cashTransaction.cashSplitList, (split) => {
            return +split.amount < 0;
        })!;
    }

    static convertToFlatTransactionList(
        cashTransactionList: CashTransaction[],
    ): FlatCashTransaction[] {
        const flatCashTransactionList: FlatCashTransaction[] = [];
        for (const cashTransaction of cashTransactionList) {
            flatCashTransactionList.push(
                CashTransactionUtils.convertToFlatTransaction(cashTransaction),
            );
        }
        return flatCashTransactionList;
    }

    static convertToFlatTransaction(cashTransaction: CashTransaction): FlatCashTransaction {
        let outSplit;
        let inSplit;
        const flatCashTransaction: any = {
            id: cashTransaction.id,
            description: cashTransaction.description,
            detail: cashTransaction.detail,
            transactionDate: cashTransaction.transactionDate,
            importId: cashTransaction.importId,
            type: cashTransaction.type || CashTransactionType.ASSET_TRANSFER,
            isMultiCurrency: cashTransaction.isMultiCurrency,
        };
        if (!cashTransaction.isMultiCurrency) {
            // Basic transaction
            inSplit = CashTransactionUtils.getPositiveSplit(cashTransaction);
            outSplit = CashTransactionUtils.getNegativeSplit(cashTransaction);

            flatCashTransaction.outAccount = outSplit.account;
            flatCashTransaction.inAccount = inSplit.account;
            flatCashTransaction.amount = +inSplit.amount;
            flatCashTransaction.currency = inSplit.currency;
            flatCashTransaction.inSplitId = inSplit.id;
            flatCashTransaction.outSplitId = outSplit.id;
        } else {
            // Exchange transaction
            inSplit = CashTransactionUtils.getPositiveSplit(cashTransaction);
            outSplit = CashTransactionUtils.getNegativeSplit(cashTransaction);

            flatCashTransaction.outAccount = outSplit.account;
            flatCashTransaction.inAccount = inSplit.account;
            flatCashTransaction.amount = -outSplit.amount;
            flatCashTransaction.currency = outSplit.currency;
            flatCashTransaction.exchangeAmount = +inSplit.amount;
            flatCashTransaction.exchangeCurrency = inSplit.currency;
            flatCashTransaction.inSplitId = inSplit.id;
            flatCashTransaction.outSplitId = outSplit.id;
        }
        return new FlatCashTransaction(flatCashTransaction);
    }

    static convertToTransactionList(
        flatCashTransactionList: FlatCashTransaction[],
    ): CashTransaction[] {
        const cashTransactionList: CashTransaction[] = [];
        for (const flatCashTransaction of flatCashTransactionList) {
            cashTransactionList.push(
                CashTransactionUtils.convertToTransaction(flatCashTransaction),
            );
        }
        return cashTransactionList;
    }

    static convertToTransaction(flatCashTransaction: FlatCashTransaction): CashTransaction {
        // Sanitize first
        if (flatCashTransaction.description) {
            flatCashTransaction.description = flatCashTransaction.description.trim();
        }
        if (flatCashTransaction.detail) {
            flatCashTransaction.detail = flatCashTransaction.detail.trim();
        }
        if (flatCashTransaction.importId) {
            const importId = flatCashTransaction.importId.trim();
            if (importId) {
                flatCashTransaction.importId = importId;
            } else {
                flatCashTransaction.importId = null;
            }
        }

        const cashTransaction: any = {
            id: flatCashTransaction.id,
            description: flatCashTransaction.description,
            detail: flatCashTransaction.detail,
            transactionDate: flatCashTransaction.transactionDate,
            importId: flatCashTransaction.importId,
            type: flatCashTransaction.type || CashTransactionType.ASSET_TRANSFER,
            cashSplitList: [],
            isMultiCurrency: flatCashTransaction.isMultiCurrency,
        };

        const transactionInfo = {
            transactionId: cashTransaction.id,
            transactionDescription: cashTransaction.description,
            transactionDate: cashTransaction.transactionDate,
            transactionType: cashTransaction.type,
        };

        let inSplit: CashSplit;
        let outSplit: CashSplit;
        const currency = flatCashTransaction.currency;
        if (flatCashTransaction.isMultiCurrency) {
            // Exchange transaction
            const amount = flatCashTransaction.amount;
            const exchangeAmount = flatCashTransaction.exchangeAmount;
            outSplit = new CashSplit({
                id: flatCashTransaction.outSplitId!,
                account: flatCashTransaction.outAccount!,
                amount: (-amount).toString(),
                currency: currency!,
                ...transactionInfo,
                otherSplitAmount: (+exchangeAmount).toString(),
                otherSplitAccountId: flatCashTransaction.inAccount.id,
                otherCurrencyId: flatCashTransaction.exchangeCurrency!.id,
                isToSplit: false,
            });

            const convertedCurrency = flatCashTransaction.exchangeCurrency;
            inSplit = new CashSplit({
                id: flatCashTransaction.inSplitId,
                account: flatCashTransaction.inAccount,
                amount: (+exchangeAmount).toString(),
                currency: convertedCurrency,
                ...transactionInfo,
                otherSplitAmount: (-amount).toString(),
                otherSplitAccountId: flatCashTransaction.outAccount.id,
                otherCurrencyId: currency!.id,
                isToSplit: true,
            });
            cashTransaction.cashSplitList = [outSplit, inSplit];
        } else {
            // Basic transaction
            const amount = flatCashTransaction.amount;
            outSplit = new CashSplit({
                id: flatCashTransaction.outSplitId,
                account: flatCashTransaction.outAccount,
                amount: (-amount).toString(),
                currency,
                ...transactionInfo,
                otherSplitAmount: (+amount).toString(),
                otherSplitAccountId: flatCashTransaction.inAccount.id,
                otherCurrencyId: currency!.id,
                isToSplit: false,
            });
            inSplit = new CashSplit({
                id: flatCashTransaction.inSplitId,
                account: flatCashTransaction.inAccount,
                amount: amount.toString(),
                currency,
                ...transactionInfo,
                otherSplitAmount: (-amount).toString(),
                otherSplitAccountId: flatCashTransaction.outAccount.id,
                otherCurrencyId: currency!.id,
                isToSplit: true,
            });
            cashTransaction.cashSplitList = [outSplit, inSplit];
        }

        cashTransaction.fromSplitAmount = outSplit.amount;
        cashTransaction.fromSplitAccountId = outSplit.account.id;
        cashTransaction.fromSplitCurrencyId = outSplit.currency.id;
        cashTransaction.toSplitAmount = inSplit.amount;
        cashTransaction.toSplitAccountId = inSplit.account.id;
        cashTransaction.toSplitCurrencyId = inSplit.currency.id;
        return new CashTransaction(cashTransaction);
    }

    static printAmountFromSplit(
        cashSplitSum: GenericSplit,
        currencyMap: Map<number, CashCurrency>,
    ): string {
        return PrintUtils.printAmount(cashSplitSum.amount, cashSplitSum.currencyId, currencyMap);
    }

    static printAmount(
        cashTransaction: CashTransaction,
        accountMap: Map<number, CashAccount>,
        currencyMap: Map<number, CashCurrency>,
    ): string {
        const fromAccountType = accountMap.get(cashTransaction.fromSplitAccountId)!.type;
        const toAccountType = accountMap.get(cashTransaction.toSplitAccountId)!.type;

        let splitToPrint;
        if (
            toAccountType === CashAccountType.EXPENSE ||
            (fromAccountType === CashAccountType.ASSET &&
                toAccountType === CashAccountType.LIABILITY) ||
            (fromAccountType === CashAccountType.ASSET && toAccountType === CashAccountType.OPENING)
        ) {
            splitToPrint = CashTransactionUtils.getNegativeSplit(cashTransaction);
        } else {
            splitToPrint = CashTransactionUtils.getPositiveSplit(cashTransaction);
        }
        return PrintUtils.printAmount(splitToPrint.amount, splitToPrint.currencyId, currencyMap);
    }
}
