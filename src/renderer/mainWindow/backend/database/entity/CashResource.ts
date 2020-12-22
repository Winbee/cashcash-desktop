import { CreateDateColumn, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export default abstract class CashResource {
    @PrimaryGeneratedColumn({ name: 'id' })
    id: number;

    @CreateDateColumn({ name: 'createdDate' })
    createdDate: Date;

    @UpdateDateColumn({ name: 'updatedDate' })
    updatedDate: Date;

    constructor(jsonObj?: any) {
        if (jsonObj) {
            if (jsonObj.id) {
                this.id = +jsonObj.id;
            }
            if (jsonObj.createdDate) {
                this.createdDate = jsonObj.createdDate;
            }
            if (jsonObj.updatedDate) {
                this.updatedDate = jsonObj.updatedDate;
            }
        }
    }
}
