import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'cash_transaction_idx' })
export default class CashTransactionIndex {
    @PrimaryGeneratedColumn({ name: 'rowId' })
    rowId: number;

    @Column({ name: 'description', type: 'varchar', length: 100 })
    description: string;

    @Column({ name: 'detail', type: 'varchar', length: 1000 })
    detail: string;
}

Object.defineProperty(CashTransactionIndex, 'name', { value: 'CashTransactionIndex' });
