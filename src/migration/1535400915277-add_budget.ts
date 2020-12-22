import { MigrationInterface, QueryRunner } from 'typeorm';

export default class AddBudget1535400915277 implements MigrationInterface {
    async up(queryRunner: QueryRunner): Promise<any> {
        const initSql = `
        CREATE TABLE cash_budget (
            id                     INTEGER       PRIMARY KEY AUTOINCREMENT NOT NULL,
            createdDate            DATETIME      NOT NULL
                                DEFAULT (datetime('now') ),
            updatedDate            DATETIME      NOT NULL
                                DEFAULT (datetime('now') ),
            amountCent             INTEGER NOT NULL,
            accountId              INTEGER NOT NULL,
            CONSTRAINT FK_cash_budget_accountId FOREIGN KEY (
            accountId
            )
            REFERENCES cash_account (id) ON DELETE CASCADE
        );`;
        await queryRunner.query(initSql);
    }

    async down(queryRunner: QueryRunner): Promise<any> {}
}

Object.defineProperty(AddBudget1535400915277, 'name', { value: 'AddBudget1535400915277' });
