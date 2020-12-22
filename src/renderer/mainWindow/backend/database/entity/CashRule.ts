import { Entity, Column, ManyToOne, JoinColumn, BeforeInsert, BeforeUpdate } from 'typeorm';

import CashResource from './CashResource';
import CashFilter from './CashFilter';
import CashAction from './CashAction';

@Entity({ name: 'cash_rule' })
export default class CashRule extends CashResource {
    @Column({ name: 'name', type: 'varchar', length: 20 })
    name: string;

    @Column({ name: 'priority', nullable: false })
    priority: number;

    @ManyToOne((type) => CashFilter, (cashFilter) => cashFilter.cashRuleList)
    @JoinColumn({ name: 'filterId', referencedColumnName: 'id' })
    filter: CashFilter;

    @ManyToOne((type) => CashAction, (cashAction) => cashAction.cashRuleList, {
        cascade: ['insert', 'update', 'remove'],
    })
    @JoinColumn({ name: 'actionId', referencedColumnName: 'id' })
    action: CashAction;

    @Column({ name: 'filterId', nullable: true })
    filterId: number;

    @Column({ name: 'actionId', nullable: true })
    actionId: number;

    constructor(jsonObj: any = {}) {
        super(jsonObj);
        if (jsonObj.name != null) {
            this.name = jsonObj.name;
        }
        if (jsonObj.priority != null) {
            this.priority = jsonObj.priority;
        } else {
            this.priority = 0;
        }
        if (jsonObj.filter != null) {
            this.filter = jsonObj.filter;
            this.filterId = jsonObj.filter.id;
        } else if (jsonObj.filterId != null) {
            this.filterId = jsonObj.filterId;
        }
        if (jsonObj.action != null) {
            this.action = jsonObj.action;
            this.actionId = jsonObj.action.id;
        } else if (jsonObj.actionId != null) {
            this.actionId = jsonObj.actionId;
        }
    }

    @BeforeInsert()
    beforeInsert() {
        this.nameAction();
    }

    @BeforeUpdate()
    beforeUpdate() {
        this.nameAction();
    }

    nameAction() {
        if (this.action) {
            this.action.name = this.name;
        }
    }
}

Object.defineProperty(CashRule, 'name', { value: 'CashRule' });
