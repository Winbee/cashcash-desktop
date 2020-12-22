import CashParsingConfig from './CashParsingConfig';
import CashConvertingConfig from './CashConvertingConfig';

export default class CashImportConfigDetails {
    parsing: CashParsingConfig;
    converting: CashConvertingConfig;
    extra: {
        detectAlreadyImported?: boolean;
    };
}
