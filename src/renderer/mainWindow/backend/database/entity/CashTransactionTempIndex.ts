import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'cash_transaction_temp_idx' })
export default class CashTransactionTempIndex {
    @PrimaryGeneratedColumn({ name: 'rowId' })
    rowId: number;

    @Column({ name: 'description', type: 'varchar', length: 100 })
    description: string;

    @Column({ name: 'detail', type: 'varchar', length: 1000 })
    detail: string;

    constructor(jsonObj: any = {}) {
        if (jsonObj.rowId != null) {
            this.rowId = jsonObj.rowId;
        }
        if (jsonObj.description != null) {
            this.description = jsonObj.description;
        }
        if (jsonObj.detail != null) {
            this.detail = jsonObj.detail;
        }
    }
}

Object.defineProperty(CashTransactionTempIndex, 'name', { value: 'CashTransactionTempIndex' });
