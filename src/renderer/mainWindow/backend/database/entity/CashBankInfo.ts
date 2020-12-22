import { Column, Entity } from 'typeorm';
import CashResource from './CashResource';

@Entity({ name: 'cash_bank_info' })
export default class CashBankInfo extends CashResource {
    @Column({ name: 'bankId', type: 'varchar', nullable: true, length: 255 })
    bankId: string;

    @Column({ name: 'branchId', type: 'varchar', nullable: true, length: 255 })
    branchId: string;

    @Column({ name: 'accountNumber', type: 'varchar', nullable: true, length: 255 })
    accountNumber: string;

    @Column({ name: 'accountKey', type: 'varchar', nullable: true, length: 255 })
    accountKey: string;

    @Column({ name: 'iban', type: 'varchar', nullable: true, length: 255 })
    iban: string;

    @Column({ name: 'bic', type: 'varchar', nullable: true, length: 255 })
    bic: string;

    constructor(jsonObj?: any) {
        super(jsonObj);
        if (jsonObj) {
            if (jsonObj.bankId != null) {
                this.bankId = jsonObj.bankId;
            }
            if (jsonObj.branchId != null) {
                this.branchId = jsonObj.branchId;
            }
            if (jsonObj.accountNumber != null) {
                this.accountNumber = jsonObj.accountNumber;
            }
            if (jsonObj.accountKey != null) {
                this.accountKey = jsonObj.accountKey;
            }
            if (jsonObj.iban != null) {
                this.iban = jsonObj.iban;
            }
        }
    }
}

Object.defineProperty(CashBankInfo, 'name', { value: 'CashBankInfo' });
