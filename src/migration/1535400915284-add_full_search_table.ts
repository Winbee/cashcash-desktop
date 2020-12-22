import { MigrationInterface, QueryRunner } from 'typeorm';

export default class AddFullSearch1535400915284 implements MigrationInterface {
    async up(queryRunner: QueryRunner): Promise<any> {
        let initSql = `DROP TABLE IF EXISTS cash_transaction_idx;`;
        await queryRunner.query(initSql);

        initSql = `DROP TABLE IF EXISTS cash_transaction_detail_idx;`;
        await queryRunner.query(initSql);

        initSql = `CREATE VIRTUAL TABLE cash_transaction_idx USING fts5(description, detail);`;
        await queryRunner.query(initSql);

        initSql = `
CREATE TRIGGER IF NOT EXISTS cash_transaction_ai AFTER INSERT ON cash_transaction BEGIN
    INSERT INTO cash_transaction_idx(rowid, description, detail) VALUES (new.id, new.description, new.detail);
END;`;
        await queryRunner.query(initSql);

        initSql = `
CREATE TRIGGER IF NOT EXISTS cash_transaction_ad AFTER DELETE ON cash_transaction BEGIN
    DELETE FROM cash_transaction_idx WHERE rowid = old.id;
END;`;
        await queryRunner.query(initSql);

        initSql = `
CREATE TRIGGER IF NOT EXISTS cash_transaction_au AFTER UPDATE ON cash_transaction BEGIN
    UPDATE cash_transaction_idx SET description = new.description WHERE rowid = old.id;
END;`;
        await queryRunner.query(initSql);

        initSql = `
INSERT INTO cash_transaction_idx (rowid, description, detail)
SELECT id, description, detail
FROM   cash_transaction;
        `;
        await queryRunner.query(initSql);
    }

    async down(queryRunner: QueryRunner): Promise<any> {}
}

Object.defineProperty(AddFullSearch1535400915284, 'name', { value: 'AddFullSearch1535400915284' });
