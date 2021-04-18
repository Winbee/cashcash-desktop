import { MigrationInterface, QueryRunner } from 'typeorm';

export default class AddTag1535400915292 implements MigrationInterface {
    async up(queryRunner: QueryRunner): Promise<any> {
        let initSql = `
        CREATE TABLE cash_tag (
            id          INTEGER      PRIMARY KEY AUTOINCREMENT
                                     NOT NULL,
            createdDate DATETIME     NOT NULL
                                     DEFAULT (datetime('now') ),
            updatedDate DATETIME     NOT NULL
                                     DEFAULT (datetime('now') ),
            name        VARCHAR (20) NOT NULL COLLATE NOCASE
        );`;
        await queryRunner.query(initSql);

        initSql = `
        ALTER TABLE cash_transaction
        ADD COLUMN tagIdList VARCHAR COLLATE NOCASE;`;
        await queryRunner.query(initSql);

        initSql = `
        ALTER TABLE cash_split
        ADD COLUMN tagIdList VARCHAR COLLATE NOCASE;`;
        await queryRunner.query(initSql);
    }

    async down(queryRunner: QueryRunner): Promise<any> {}
}

Object.defineProperty(AddTag1535400915292, 'name', {
    value: 'AddTag1535400915292',
});
