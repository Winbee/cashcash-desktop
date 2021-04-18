import { Container, Service } from 'typedi';

import FlatCashTransaction from '../database/entity/proxy/FlatCashTransaction';
import Papa from 'papaparse';
import CashImportConfig from '../database/entity/CashImportConfig';
import CashImportConfigDetails from '../database/entity/proxy/CashImportConfigDetails';
import _ from 'lodash';
import CashCurrencyService from './CashCurrencyService';
import CashAccountService from './CashAccountService';
import CashCurrency from '../database/entity/CashCurrency';
import CashImportCurrencyType from '../database/entity/enumeration/CashImportCurrencyType';
import CashAccount from '../database/entity/CashAccount';
import CashImportAccountType from '../database/entity/enumeration/CashImportAccountType';
import CashTransactionService from './CashTransactionService';
import { DateTime } from 'luxon';
import CashTransactionType from '../database/entity/enumeration/CashTransactionType';
import CashRuleService from './CashRuleService';
import StringUtils from '../utils/StringUtils';
import CashError from './dto/CashError';
import XLSX from 'xlsx';
import CashParsingConfig from '../database/entity/proxy/CashParsingConfig';
import ParseResult from './dto/ParseResult';
import CashImportType from '../database/entity/enumeration/CashImportType';
import CashTag from '../database/entity/CashTag';

@Service()
export default class CashImportService {
    async parseFileToArray(file: File, parsingConfig: CashParsingConfig): Promise<ParseResult> {
        let config: Papa.ParseConfig;
        let objectToParse: File | string;
        if (parsingConfig.type === CashImportType.SPREADSHEET) {
            try {
                const path = file.path || (file as any).raw.path;
                const workbook = XLSX.readFile(path);
                const sheet = workbook.Sheets[workbook.SheetNames[0]];
                const toCSVConfig = {
                    FS: ';',
                    RS: '\n',
                    strip: false,
                    skipHidden: true,
                    blankrows: false,
                };
                objectToParse = XLSX.utils.sheet_to_csv(sheet, toCSVConfig);
            } catch (e) {
                return {
                    data: [],
                    errors: [
                        {
                            type: 'spreadsheet_error',
                            code: '0',
                            message: 'Spreadsheet error',
                            row: 0,
                        },
                    ],
                };
            }
            config = {
                encoding: 'UTF-8',
                delimiter: ';',
                newline: '\n',
                comments: false,
                skipEmptyLines: true,
            };
        } else {
            config = {
                encoding: parsingConfig.encoding,
                delimiter: parsingConfig.delimiter === 'auto-detect' ? '' : parsingConfig.delimiter,
                newline: parsingConfig.newline === 'auto-detect' ? '' : parsingConfig.newline,
                quoteChar: parsingConfig.quoteChar,
                comments: parsingConfig.comment,
                skipEmptyLines: parsingConfig.skipEmptyLines,
            };
            objectToParse = (file as any).raw;
        }
        const promise = new Promise<ParseResult>((resolve) => {
            config.complete = (result) => resolve(result);
        });
        Papa.parse(objectToParse as File, config);
        return promise;
    }

    async convertCsvToTransaction(
        parsedCsv: ParseResult,
        selectedImportConfig: CashImportConfig,
        selectedAccount: CashAccount | null,
        accountMap: Map<number, CashAccount>,
        tagMap: Map<number, CashTag>,
        isTest: boolean = false,
        updateProgress: (number) => void = () => {},
    ): Promise<FlatCashTransaction[]> {
        updateProgress(0);
        if (parsedCsv.errors.length !== 0) {
            throw new Error('Error during parsing');
        }
        // Get existing data
        const cashCurrencyService = Container.get(CashCurrencyService);
        const currencyList = await cashCurrencyService.getList();
        const cashAccountService = Container.get(CashAccountService);
        const accountList = await cashAccountService.getList();
        const cashRuleService = Container.get(CashRuleService);
        const unknownIncome = accountList.find((a) => a.code === 'INC_UNK')!;
        const unknownExpense = accountList.find((a) => a.code === 'EXP_UNK')!;
        const rules = await cashRuleService.getList();

        const transactionList: FlatCashTransaction[] = [];
        const csvConfig = selectedImportConfig.jsonConfig as CashImportConfigDetails;
        let data;
        let currentLine;
        if (csvConfig.parsing.header) {
            data = parsedCsv.data.slice(1);
            currentLine = 2;
        } else {
            data = parsedCsv.data;
            currentLine = 1;
        }
        let i = 0;
        for (const oneLine of data) {
            const transaction = new FlatCashTransaction();
            transaction.transactionDate = this.buildTransactionDate(
                oneLine,
                csvConfig,
                currentLine,
            )!;
            transaction.description = this.buildDescription(oneLine, csvConfig, currentLine);
            transaction.detail = this.buildDetail(oneLine, csvConfig, currentLine);
            transaction.importId = this.buildImportId(oneLine, csvConfig, currentLine);
            const amount = this.buildAmount(oneLine, csvConfig, currentLine);
            transaction.currency = this.buildCurrency(
                oneLine,
                csvConfig,
                currencyList,
                currentLine,
            )!;
            if (amount >= 0) {
                transaction.amount = amount;
                transaction.inAccount = this.buildAccount(
                    oneLine,
                    csvConfig,
                    selectedAccount,
                    accountList,
                    currentLine,
                )!;
                transaction.outAccount = unknownIncome;
                transaction.type = CashTransactionType.INCOME;
            } else {
                transaction.amount = -amount;
                transaction.outAccount = this.buildAccount(
                    oneLine,
                    csvConfig,
                    selectedAccount,
                    accountList,
                    currentLine,
                )!;
                transaction.inAccount = unknownExpense;
                transaction.type = CashTransactionType.EXPENSE;
            }
            if (!isTest) {
                if (csvConfig.extra.detectAlreadyImported) {
                    await this.checkAlreadyImport(transaction);
                }
                const cashRuleService = Container.get(CashRuleService);
                await cashRuleService.assignWithRules(
                    transaction,
                    accountMap,
                    tagMap,
                    rules,
                    accountList,
                );
            }
            transactionList.push(transaction);
            if (isTest) {
                return transactionList;
            }
            i++;
            currentLine++;
            await updateProgress(Math.round((i * 100) / data.length));
        }
        await updateProgress(100);
        return transactionList;
    }

    private buildAccount(
        oneLine: string[],
        csvConfig: CashImportConfigDetails,
        selectedAccount: CashAccount | null,
        accountList: CashAccount[],
        currentLine: number,
    ): CashAccount | null {
        if (selectedAccount) {
            return selectedAccount;
        }

        const config = csvConfig.converting.property.account;
        if (!config) {
            return null;
        }
        if (oneLine.length < config.index) {
            throw new Error(
                // tslint:disable-next-line:max-line-length
                `Line ${currentLine}: Not enough columns to get account. Impossible to access column n°${config.index} because only ${oneLine.length} columns are available.`,
            );
        }
        const propertyValue: string = oneLine[config.index - 1].toLowerCase();
        let foundAccount: CashAccount | undefined;
        switch (config.format) {
            case CashImportAccountType.NAME: {
                foundAccount = _.find(accountList, (o: CashAccount) => {
                    return o.name.toLowerCase() === propertyValue;
                });
                break;
            }
            case CashImportAccountType.BIC: {
                foundAccount = _.find(accountList, (o: CashAccount) => {
                    if (!o.bankInfo) {
                        return false;
                    }
                    return o.bankInfo.bic.toLowerCase() === propertyValue;
                });
                break;
            }
            case CashImportAccountType.IBAN: {
                foundAccount = _.find(accountList, (o: CashAccount) => {
                    if (!o.bankInfo) {
                        return false;
                    }
                    return o.bankInfo.iban.toLowerCase() === propertyValue;
                });
                break;
            }
            default: {
                throw new Error(`Line ${currentLine}: Unknown account import type`);
            }
        }
        return foundAccount ? foundAccount : null;
    }

    private buildDescription(
        oneLine: string[],
        csvConfig: CashImportConfigDetails,
        currentLine: number,
    ): string {
        const config = csvConfig.converting.property.description;
        if (!config || config.extra.length === 0) {
            return '';
        }

        let description = '';
        for (const oneConfig of _.orderBy(config.extra, 'order')) {
            if (oneLine.length < oneConfig.index) {
                throw new Error(
                    // tslint:disable-next-line:max-line-length
                    `Line ${currentLine}: Not enough columns to get description. Impossible to access column n°${oneConfig.index} because only ${oneLine.length} columns are available.`,
                );
            }
            try {
                let value = oneLine[oneConfig.index - 1];
                if (value) {
                    if (oneConfig.cleanSpace) {
                        value = value.replace(/\s+/g, ' ');
                        value = value.replace(/^\s+|\s+$/g, '');
                    }
                    if (oneConfig.prefix) {
                        description = this.addText(description, oneConfig.prefix);
                    }
                    description = this.addText(description, value);
                }
            } catch (e) {
                throw new CashError(`Line ${currentLine}: Can't build description: ${e.message}`);
            }
        }
        return description;
    }

    private buildDetail(
        oneLine: string[],
        csvConfig: CashImportConfigDetails,
        currentLine: number,
    ): string {
        const config = csvConfig.converting.property.detail;
        if (!config || config.extra.length === 0) {
            return '';
        }

        let detail = '';
        for (const oneConfig of _.orderBy(config.extra, 'order')) {
            if (oneLine.length < oneConfig.index) {
                throw new CashError(
                    // tslint:disable-next-line:max-line-length
                    `Line ${currentLine}: Not enough columns to get detail. Impossible to access column n°${oneConfig.index} because only ${oneLine.length} columns are available.`,
                );
            }
            try {
                let value = oneLine[oneConfig.index - 1];
                if (value) {
                    let textToAdd = '';
                    if (oneConfig.prefix) {
                        textToAdd += oneConfig.prefix + ' ';
                    }
                    if (oneConfig.cleanSpace) {
                        value = value.replace(/\s+/g, ' ');
                        value = value.replace(/^\s+|\s+$/g, '');
                    }
                    textToAdd += value;
                    detail = this.addText(detail, textToAdd, true);
                }
            } catch (e) {
                throw new CashError(`Line ${currentLine}: Can't build detail: ${e.message}`);
            }
        }
        return detail;
    }

    private buildAmount(
        oneLine: string[],
        csvConfig: CashImportConfigDetails,
        currentLine: number,
    ): number {
        const config = csvConfig.converting.property.amount;
        if (!config) {
            return 0;
        }
        if (oneLine.length < config.index) {
            throw new CashError(
                // tslint:disable-next-line:max-line-length
                `Line ${currentLine}: Not enough columns to get amount. Impossible to access column n°${config.index} because only ${oneLine.length} columns are available.`,
            );
        }
        try {
            const stringNumber = oneLine[config.index - 1].trim();
            return this.parseNumber(stringNumber, config.decimalSeparator);
        } catch (e) {
            throw new CashError(`Line ${currentLine}: Can't build amount: ${e.message}`);
        }
    }

    private buildImportId(
        oneLine: string[],
        csvConfig: CashImportConfigDetails,
        currentLine: number,
    ): string {
        const config = csvConfig.converting.property.importId;
        if (!config) {
            return '';
        }
        if (oneLine.length < config.index) {
            throw new CashError(
                // tslint:disable-next-line:max-line-length
                `Line ${currentLine}: Not enough columns to get import id. Impossible to access column n°${config.index} because only ${oneLine.length} columns are available.`,
            );
        }
        return oneLine[config.index - 1];
    }

    private buildCurrency(
        oneLine: string[],
        csvConfig: CashImportConfigDetails,
        currencyList,
        currentLine: number,
    ): CashCurrency | null {
        const config = csvConfig.converting.property.currency;
        if (!config) {
            return null;
        }
        if (oneLine.length < config.index) {
            throw new CashError(
                // tslint:disable-next-line:max-line-length
                `Line ${currentLine}: Not enough columns to get Currency. Impossible to access column n°${config.index} because only ${oneLine.length} columns are available.`,
            );
        }
        try {
            const propertyValue: string = StringUtils.keepLetterOnly(
                oneLine[config.index - 1],
            ).toLowerCase();
            let foundCurrency: CashCurrency | undefined;
            switch (config.format) {
                case CashImportCurrencyType.ISO_CODE: {
                    foundCurrency = _.find(currencyList, (o: CashCurrency) => {
                        return o.isoCode.toLowerCase() === propertyValue;
                    });
                    break;
                }
                case CashImportCurrencyType.NAME: {
                    foundCurrency = _.find(currencyList, (o: CashCurrency) => {
                        return o.name.toLowerCase() === propertyValue;
                    });
                    break;
                }
                case CashImportCurrencyType.SYMBOL: {
                    foundCurrency = _.find(currencyList, (o: CashCurrency) => {
                        return o.symbol === propertyValue;
                    });
                    break;
                }
                default: {
                    throw new Error(`Line ${currentLine}: Unknown currency import type`);
                }
            }
            if (!foundCurrency) {
                throw new CashError(`Line ${currentLine}: Currency not found`);
            }
            return foundCurrency ? foundCurrency : null;
        } catch (e) {
            throw new CashError(`Line ${currentLine}: Can't build currency: ${e.message}`);
        }
    }

    private async checkAlreadyImport(currentTransaction: FlatCashTransaction) {
        const cashTransactionService = Container.get(CashTransactionService);

        let sameTransactionExist = false;
        if (currentTransaction.importId) {
            sameTransactionExist = await cashTransactionService.hasTransactionWithImportId(
                currentTransaction.importId,
            );
        } else {
            sameTransactionExist = await cashTransactionService.hasSimilarTransaction(
                currentTransaction,
            );
        }
        if (sameTransactionExist) {
            // This is the same transaction
            currentTransaction.doNotImport = true;
        }
    }

    private addText(existingText: string, textToAdd: string, addEndOfLine: boolean = false) {
        let newText = existingText;
        if (existingText.length > 0) {
            if (addEndOfLine) {
                newText += '\n';
            } else {
                newText += ' ';
            }
        }
        return newText + textToAdd;
    }

    private parseNumber(strg = '', decimalSeparator: string) {
        strg = strg.replace(/[^\d.,\-+]/g, '');
        const decimal = this.defineDecimal(strg, decimalSeparator);
        strg = strg.replace(new RegExp('[^\\d' + decimal + '\\-+]', 'g'), '');
        strg = strg.replace(',', '.');
        return parseFloat(strg);
    }

    private defineDecimal(strg, decimalSeparator: string): string {
        let decimal;
        if (!decimalSeparator || decimalSeparator === 'auto-detect') {
            if (strg.indexOf(',') > strg.indexOf('.')) {
                decimal = ',';
            } else {
                decimal = '.';
            }
            if ((strg.match(new RegExp('\\' + decimal, 'g')) || []).length > 1) {
                decimal = '';
            }
            if (
                decimal !== '' &&
                strg.length - strg.indexOf(decimal) - 1 === 3 &&
                strg.indexOf('0' + decimal) !== 0
            ) {
                decimal = '';
            }
        } else {
            decimal = decimalSeparator;
        }
        return decimal;
    }

    private buildTransactionDate(
        oneLine: string[],
        csvConfig: CashImportConfigDetails,
        currentLine: number,
    ): Date | null {
        const config = csvConfig.converting.property.transactionDate;
        if (!config) {
            return null;
        }
        if (oneLine.length < config.index) {
            throw new CashError(
                // tslint:disable-next-line:max-line-length
                `Line ${currentLine}: Not enough columns to get transaction date. Impossible to access column n°${config.index} because only ${oneLine.length} columns are available.`,
            );
        }
        try {
            const value: string = oneLine[config.index - 1];
            const luxonDate = DateTime.fromFormat(value, config.format);
            return luxonDate.toJSDate();
        } catch (e) {
            throw new CashError(`Line ${currentLine}: Can't build transaction date: ${e.message}`);
        }
    }
}
