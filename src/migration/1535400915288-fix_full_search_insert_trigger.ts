import { MigrationInterface, QueryRunner } from 'typeorm';

export default class FixFullSearchInsert1535400915288 implements MigrationInterface {
    async up(queryRunner: QueryRunner): Promise<any> {
        let initSql = `
DROP TRIGGER IF EXISTS cash_transaction_aiAFTER;`;
        await queryRunner.query(initSql);

        initSql = `
DROP TRIGGER IF EXISTS cash_transaction_ai;`;
        await queryRunner.query(initSql);

        initSql = `
CREATE TRIGGER IF NOT EXISTS cash_transaction_ai AFTER INSERT ON cash_transaction BEGIN
    INSERT INTO cash_transaction_idx(rowid, description, detail) VALUES (new.id, new.description, new.detail);
END;`;
        await queryRunner.query(initSql);
    }

    async down(queryRunner: QueryRunner): Promise<any> {}
}

Object.defineProperty(FixFullSearchInsert1535400915288, 'name', {
    value: 'FixFullSearchInsert1535400915288',
});
