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
import { FieldNameActionType } from './proxy/CashRuleV1';
import { JsonAction } from './proxy/JsonAction';
import JsonTransformer from '../transformer/JsonTransformer';
import CashAccount from './CashAccount';
import CashRule from './CashRule';

@Entity({ name: 'cash_action' })
export default class CashAction extends CashResource {
    @Column({ name: 'name', type: 'varchar', length: 20 })
    name: string;

    @Column({
        name: 'JsonActionList',
        type: 'clob',
        transformer: new JsonTransformer<JsonAction[]>(),
    })
    jsonActionList: JsonAction[];

    @ManyToMany((type) => CashAccount, (cashAccount) => cashAccount.cashActionList)
    @JoinTable({
        name: 'cash_account_action_list_cash_action',
        joinColumns: [{ name: 'cashActionId', referencedColumnName: 'id' }],
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
        if (jsonObj.jsonActionList != null) {
            this.jsonActionList = jsonObj.jsonActionList;
        } else {
            this.jsonActionList = [];
        }
    }

    attachAccount() {
        const linkedAccountIdList = new Set();
        if (this.jsonActionList) {
            for (const action of this.jsonActionList) {
                if (
                    action.fieldName === FieldNameActionType.ACCOUNT_FROM ||
                    action.fieldName === FieldNameActionType.ACCOUNT_TO
                ) {
                    linkedAccountIdList.add(action.parameter);
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
        if (this.jsonActionList) {
            this.jsonActionList.forEach((item) => (item.randomId = Math.random()));
        }
    }
}

Object.defineProperty(CashAction, 'name', { value: 'CashAction' });
