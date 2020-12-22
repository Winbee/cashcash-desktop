import CashImportCurrencyType from '../enumeration/CashImportCurrencyType';
import CashImportAccountType from '../enumeration/CashImportAccountType';
import ExtraDescription from './ExtraDescription';

export default class CashConvertingConfig {
    property: {
        description: {
            extra: ExtraDescription[];
        };
        transactionDate: {
            index: number;
            format: string;
        };
        amount: {
            index: number;
            decimalSeparator: string;
        };
        currency: {
            index: number;
            format: CashImportCurrencyType;
        };
        detail?: {
            extra: ExtraDescription[];
        };
        importId?: {
            index: number;
        };
        account?: {
            index: number;
            format: CashImportAccountType;
        };
    };
}
