import {
    Column,
    Entity,
    JoinColumn,
    JoinTable,
    ManyToMany,
    ManyToOne,
    OneToMany,
    OneToOne,
} from 'typeorm';

import CashBankInfo from './CashBankInfo';
import CashCurrency from './CashCurrency';
import CashResource from './CashResource';
import CashSplit from './CashSplit';
import CashSplitSum from './CashSplitSum';
import CashAccountType from './enumeration/CashAccountType';
import CashImportConfig from './CashImportConfig';
import CashFilter from './CashFilter';
import CashAction from './CashAction';

@Entity({ name: 'cash_account' })
export default class CashAccount extends CashResource {
    static convertArray(jsonList: any[], optionalParent?: any): CashAccount[] {
        const accountList: CashAccount[] = [];
        for (let jsonObj of jsonList) {
            if (typeof jsonObj === 'string' || jsonObj instanceof String) {
                jsonObj = { name: jsonObj };
            }
            if (optionalParent != null) {
                // It has to be the same type as the parent
                jsonObj.type = optionalParent.type;
                // We take the same currency if not defined
                if (jsonObj.currency == null) {
                    jsonObj.currency = optionalParent.currency;
                }
                jsonObj.level = optionalParent.level + 1;
            } else {
                jsonObj.level = 0;
            }
            const account = new CashAccount(jsonObj);
            accountList.push(account);
        }
        return accountList;
    }

    @Column({ name: 'currencyId', nullable: true })
    currencyId: number;

    @Column({ name: 'name', type: 'varchar', length: 80 })
    name: string;

    @Column({ name: 'level', nullable: false })
    level: number;

    @Column({ name: 'type', type: 'varchar', length: 20 })
    type: CashAccountType;

    @Column({ name: 'code', type: 'varchar', nullable: true })
    code: string | null;

    @OneToOne((type) => CashBankInfo)
    @JoinColumn({ name: 'bankInfoId', referencedColumnName: 'id' })
    bankInfo: CashBankInfo;

    @ManyToMany((type) => CashImportConfig, (cashImportConfig) => cashImportConfig.cashAccountList)
    @JoinTable({
        name: 'cash_account_import_config_list_cash_import_config',
        joinColumns: [{ name: 'cashAccountId', referencedColumnName: 'id' }],
        inverseJoinColumns: [{ name: 'cashImportConfigId', referencedColumnName: 'id' }],
    })
    importConfigList: CashImportConfig[];

    @ManyToMany((type) => CashFilter, (cashFilter) => cashFilter.cashAccountList)
    cashFilterList: CashFilter[];

    @ManyToMany((type) => CashAction, (cashAction) => cashAction.cashAccountList)
    cashActionList: CashAction[];

    @ManyToOne((type) => CashCurrency, (cashCurrency) => cashCurrency.cashAccountList)
    @JoinColumn({ name: 'currencyId', referencedColumnName: 'id' })
    currency: CashCurrency;

    @Column({ name: 'parentAccountId', nullable: true })
    parentAccountId: number;

    @ManyToOne((type) => CashAccount, (cashAccount) => cashAccount.children)
    @JoinColumn({ name: 'parentAccountId', referencedColumnName: 'id' })
    parentAccount: CashAccount;

    @Column({ name: 'isDirectory', type: 'boolean' })
    isDirectory: boolean;

    @Column({ name: 'isMultiCurrency', type: 'boolean' })
    isMultiCurrency: boolean;

    @Column({ name: 'isProtected', type: 'boolean' })
    isProtected: boolean;

    @OneToMany((type) => CashSplit, (cashSplit) => cashSplit.account)
    cashSplitList: Promise<CashSplit[]>;

    @OneToMany((type) => CashSplitSum, (cashSplitSum) => cashSplitSum.account)
    cashSplitSumList: Promise<CashSplitSum[]>;

    @OneToMany((type) => CashAccount, (cashAccount) => cashAccount.parentAccount, {
        cascade: ['insert', 'update'],
    })
    children: CashAccount[];

    constructor(jsonObj: any = {}) {
        super(jsonObj);
        if (jsonObj.name != null) {
            this.name = jsonObj.name;
        }
        if (jsonObj.type != null) {
            this.type = jsonObj.type;
        }
        if (jsonObj.code != null) {
            this.code = jsonObj.code;
        }
        this.isMultiCurrency = jsonObj.isMultiCurrency ? jsonObj.isMultiCurrency : false;
        this.isDirectory = jsonObj.isDirectory ? jsonObj.isDirectory : false;
        this.isProtected = jsonObj.isProtected ? jsonObj.isProtected : false;
        if (jsonObj.bankInfo != null) {
            this.bankInfo = new CashBankInfo(jsonObj.bankInfo);
        }
        if (jsonObj.currency != null) {
            this.currency = new CashCurrency(jsonObj.currency);
            this.currencyId = this.currency.id;
        } else if (jsonObj.currencyId != null) {
            this.currencyId = jsonObj.currencyId;
        }
        if (jsonObj.parentAccount != null) {
            this.parentAccount = jsonObj.parentAccount;
            this.type = this.parentAccount.type;
            if (!this.currency) {
                this.currency = this.parentAccount.currency;
            }
        } else if (jsonObj.parentAccountId != null) {
            this.parentAccountId = jsonObj.parentAccountId;
        }
        if (jsonObj.children != null) {
            this.children = CashAccount.convertArray(jsonObj.children, jsonObj);
            this.isDirectory = true;
        }
        this.level = 0;
    }
}

Object.defineProperty(CashAccount, 'name', { value: 'CashAccount' });
