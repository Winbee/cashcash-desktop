import { Column, Entity, ManyToMany, AfterLoad } from 'typeorm';
import CashAccount from './CashAccount';
import CashResource from './CashResource';
import CashImportType from './enumeration/CashImportType';
import CashImportConfigDetails from './proxy/CashImportConfigDetails';
import CashImportCurrencyFieldType from './enumeration/CashImportCurrencyFieldType';
import JsonTransformer from '../transformer/JsonTransformer';
import _ from 'lodash';
import CashImportCurrencyMode from './enumeration/CashImportCurrencyMode';

@Entity({ name: 'cash_import_config' })
export default class CashImportConfig extends CashResource {
    static convertArray(jsonList: any[]): CashImportConfig[] {
        const currencyList: CashImportConfig[] = [];
        for (const jsonObj of jsonList) {
            const item = new CashImportConfig(jsonObj);
            currencyList.push(item);
        }
        return currencyList;
    }

    @Column({ name: 'name', type: 'varchar', length: 20 })
    name: string;

    @Column({ name: 'type', type: 'varchar', length: 20 })
    type: CashImportType;

    @Column({
        name: 'jsonConfig',
        type: 'clob',
        transformer: new JsonTransformer<CashImportConfigDetails>(),
    })
    jsonConfig: CashImportConfigDetails;

    @ManyToMany((type) => CashAccount, (cashAccount) => cashAccount.importConfigList)
    cashAccountList: CashAccount[];

    constructor(jsonObj: any = {}) {
        super(jsonObj);
        if (jsonObj.name != null) {
            this.name = jsonObj.name;
        }
        if (jsonObj.jsonConfig != null) {
            this.jsonConfig = jsonObj.jsonConfig;
        } else {
            this.jsonConfig = _.cloneDeep(DEFAULT_IMPORT_CONFIG);
        }
        if (this.jsonConfig && this.jsonConfig.parsing && this.jsonConfig.parsing.type) {
            this.type = this.jsonConfig.parsing.type;
        } else {
            this.type = CashImportType.SPREADSHEET;
        }
    }

    @AfterLoad()
    initializeObject() {
        const defaultImportConfig: CashImportConfigDetails = _.cloneDeep(DEFAULT_IMPORT_CONFIG);

        if (this.jsonConfig && this.jsonConfig.parsing && this.jsonConfig.parsing.type) {
            this.type = this.jsonConfig.parsing.type;
        } else {
            this.type = CashImportType.SPREADSHEET;
        }
        if (!this.jsonConfig.converting) {
            this.jsonConfig.converting = defaultImportConfig.converting;
        }
        if (!this.jsonConfig.converting.property.description) {
            this.jsonConfig.converting.property.description =
                defaultImportConfig.converting.property.description;
        }
        if (!this.jsonConfig.converting.property.detail) {
            this.jsonConfig.converting.property.detail =
                defaultImportConfig.converting.property.detail;
        }
        if (!this.jsonConfig.converting.property.transactionDate) {
            this.jsonConfig.converting.property.transactionDate =
                defaultImportConfig.converting.property.transactionDate;
        }
        if (!this.jsonConfig.converting.property.amount) {
            this.jsonConfig.converting.property.amount =
                defaultImportConfig.converting.property.amount;
        }
        if (!this.jsonConfig.converting.property.currency) {
            this.jsonConfig.converting.property.currency =
                defaultImportConfig.converting.property.currency;
        }
        if (!this.jsonConfig.converting.property.currency.mode) {
            // We fix old version without mode
            (this.jsonConfig.converting.property.currency as any).mode =
                CashImportCurrencyMode.READ;
        }
        if (
            this.jsonConfig.converting.property.description &&
            this.jsonConfig.converting.property.description.extra
        ) {
            this.jsonConfig.converting.property.description.extra.forEach(
                (item) => (item.randomId = Math.random()),
            );
        }
        if (
            this.jsonConfig.converting.property.detail &&
            this.jsonConfig.converting.property.detail.extra
        ) {
            this.jsonConfig.converting.property.detail.extra.forEach(
                (item) => (item.randomId = Math.random()),
            );
        }
        if (!this.jsonConfig.extra) {
            this.jsonConfig.extra = {};
        }
    }
}

Object.defineProperty(CashImportConfig, 'name', { value: 'CashImportConfig' });

const DEFAULT_IMPORT_CONFIG: CashImportConfigDetails = {
    parsing: {
        type: CashImportType.SPREADSHEET,
        header: true,
    },
    converting: {
        property: {
            description: {
                extra: [
                    {
                        prefix: '',
                        index: 0,
                        cleanSpace: true,
                    },
                ],
            },
            detail: {
                extra: [],
            },
            transactionDate: {
                index: 1,
                format: 'yyyyMMdd',
            },
            amount: {
                index: 2,
                decimalSeparator: 'auto-detect',
            },
            currency: {
                mode: CashImportCurrencyMode.READ,
                index: 3,
                format: CashImportCurrencyFieldType.ISO_CODE,
            },
        },
    },
    extra: {
        detectAlreadyImported: true,
    },
};
