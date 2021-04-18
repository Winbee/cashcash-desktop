import { Entity, Column } from 'typeorm';

import CashResource from './CashResource';

@Entity({ name: 'cash_tag' })
export default class CashTag extends CashResource {
    @Column({ name: 'name', type: 'varchar', length: 20 })
    name: string;

    constructor(jsonObj: any = {}) {
        super(jsonObj);
        if (jsonObj.name != null) {
            this.name = jsonObj.name;
        }
    }
}

Object.defineProperty(CashTag, 'name', { value: 'CashTag' });
