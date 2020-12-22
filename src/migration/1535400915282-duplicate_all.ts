import { MigrationInterface, QueryRunner } from 'typeorm';

export default class DuplicateAll1535400915282 implements MigrationInterface {
    async up(queryRunner: QueryRunner): Promise<any> {
        let initSql = `ALTER TABLE cash_split ADD COLUMN isToSplit BOOLEAN NOT NULL DEFAULT 0;`;
        await queryRunner.query(initSql);

        initSql = `ALTER TABLE cash_split ADD COLUMN otherSplitAmountCent INTEGER NOT NULL DEFAULT 0;`;
        await queryRunner.query(initSql);

        initSql = `ALTER TABLE cash_split ADD COLUMN otherSplitAccountId INTEGER NOT NULL DEFAULT 0;`;
        await queryRunner.query(initSql);

        initSql = `ALTER TABLE cash_split ADD COLUMN otherSplitCurrencyId INTEGER NOT NULL DEFAULT 0;`;
        await queryRunner.query(initSql);

        initSql = `ALTER TABLE cash_transaction ADD COLUMN fromSplitAmountCent INTEGER NOT NULL DEFAULT 0;`;
        await queryRunner.query(initSql);

        initSql = `ALTER TABLE cash_transaction ADD COLUMN fromSplitAccountId INTEGER NOT NULL DEFAULT 0;`;
        await queryRunner.query(initSql);

        initSql = `ALTER TABLE cash_transaction ADD COLUMN fromSplitCurrencyId INTEGER NOT NULL DEFAULT 0;`;
        await queryRunner.query(initSql);

        initSql = `ALTER TABLE cash_transaction ADD COLUMN toSplitAmountCent INTEGER NOT NULL DEFAULT 0;`;
        await queryRunner.query(initSql);

        initSql = `ALTER TABLE cash_transaction ADD COLUMN toSplitAccountId INTEGER NOT NULL DEFAULT 0;`;
        await queryRunner.query(initSql);

        initSql = `ALTER TABLE cash_transaction ADD COLUMN toSplitCurrencyId INTEGER NOT NULL DEFAULT 0;`;
        await queryRunner.query(initSql);
    }

    async down(queryRunner: QueryRunner): Promise<any> {}
}

Object.defineProperty(DuplicateAll1535400915282, 'name', { value: 'DuplicateAll1535400915282' });
