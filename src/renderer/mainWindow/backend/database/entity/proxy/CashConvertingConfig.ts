import CashImportCurrencyFieldType from '../enumeration/CashImportCurrencyFieldType';
import CashImportAccountType from '../enumeration/CashImportAccountType';
import ExtraDescription from './ExtraDescription';
import CashImportCurrencyMode from '../enumeration/CashImportCurrencyMode';

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
        currency:
            | {
                  mode: CashImportCurrencyMode.READ;
                  index: number;
                  format: CashImportCurrencyFieldType;
              }
            | {
                  mode: CashImportCurrencyMode.PRE_DEFINED;
                  isoCode: string;
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
