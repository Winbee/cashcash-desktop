import {
    Entity,
    Column,
    ManyToMany,
    JoinTable,
    AfterLoad,
    OneToMany,
    BeforeInsert,
    BeforeUpdate,
} from 'typeorm';

import CashResource from './CashResource';
import { FieldNameDetectionType } from './proxy/CashRuleV1';
import { JsonFilter } from './proxy/JsonFilter';
import JsonTransformer from '../transformer/JsonTransformer';
import CashAccount from './CashAccount';
import CashRule from './CashRule';

@Entity({ name: 'cash_filter' })
export default class CashFilter extends CashResource {
    @Column({ name: 'name', type: 'varchar', length: 20 })
    name: string;

    @Column({
        name: 'jsonFilter',
        type: 'clob',
        transformer: new JsonTransformer<JsonFilter>(),
    })
    jsonFilter: JsonFilter;

    @ManyToMany((type) => CashAccount, (cashAccount) => cashAccount.cashFilterList, { cascade: [] })
    @JoinTable({
        name: 'cash_account_filter_list_cash_filter',
        joinColumns: [{ name: 'cashFilterId', referencedColumnName: 'id' }],
        inverseJoinColumns: [{ name: 'cashAccountId', referencedColumnName: 'id' }],
    })
    cashAccountList: CashAccount[];

    @OneToMany((type) => CashRule, (cashRule) => cashRule.filter)
    cashRuleList: Promise<CashRule[]>;

    constructor(jsonObj: any = {}) {
        super(jsonObj);
        if (jsonObj.name != null) {
            this.name = jsonObj.name;
        }
        if (jsonObj.jsonFilter != null) {
            this.jsonFilter = jsonObj.jsonFilter;
        } else {
            this.jsonFilter = {
                list: [],
            };
        }
    }

    attachAccount() {
        const linkedAccountIdList = new Set();
        if (this.jsonFilter) {
            for (const filter of this.jsonFilter.list) {
                if (filter.fieldName === FieldNameDetectionType.ACCOUNT) {
                    linkedAccountIdList.add(filter.parameter);
                }
            }
        }
        // We empty the list
        this.cashAccountList = [];
        for (const id of linkedAccountIdList) {
            this.cashAccountList.push(new CashAccount({ id }));
        }
    }

    @BeforeInsert()
    beforeInsert() {
        this.attachAccount();
    }

    @BeforeUpdate()
    beforeUpdate() {
        this.attachAccount();
    }

    @AfterLoad()
    updateRandomId() {
        if (this.jsonFilter) {
            this.jsonFilter.list.forEach((item) => (item.randomId = Math.random()));
        }
    }
}

Object.defineProperty(CashFilter, 'name', { value: 'CashFilter' });
