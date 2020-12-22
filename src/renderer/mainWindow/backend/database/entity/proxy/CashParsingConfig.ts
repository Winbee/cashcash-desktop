import CashImportType from '../enumeration/CashImportType';

export default class CashParsingConfig {
    type: CashImportType;
    // tslint:disable-next-line:max-line-length
    encoding?: string; // Encoding type https://developer.mozilla.org/en-US/docs/Web/API/TextDecoder/TextDecoder#Parameters
    delimiter?: string; // default: "," or autodetect if ""
    newline?: string; // default: "\r\n" or autodetect if ""
    quoteChar?: string; // default: '"'
    comment?: boolean; // default: false
    skipEmptyLines?: boolean; // default: false
    header?: boolean; // default: false,
}
