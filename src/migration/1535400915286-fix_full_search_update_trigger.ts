import { MigrationInterface, QueryRunner } from 'typeorm';

export default class FixFullSearch1535400915286 implements MigrationInterface {
    async up(queryRunner: QueryRunner): Promise<any> {
        let initSql = `
DROP TRIGGER cash_transaction_au;`;
        await queryRunner.query(initSql);

        initSql = `
CREATE TRIGGER IF NOT EXISTS cash_transaction_au AFTER UPDATE ON cash_transaction BEGIN
    UPDATE cash_transaction_idx SET description = new.description, detail = new.detail WHERE rowid = old.id;
END;`;
        await queryRunner.query(initSql);
    }

    async down(queryRunner: QueryRunner): Promise<any> {}
}

Object.defineProperty(FixFullSearch1535400915286, 'name', { value: 'FixFullSearch1535400915286' });
