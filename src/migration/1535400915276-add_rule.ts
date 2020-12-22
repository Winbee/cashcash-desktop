import { MigrationInterface, QueryRunner } from 'typeorm';

export default class AddRule1535400915276 implements MigrationInterface {
    async up(queryRunner: QueryRunner): Promise<any> {
        let initSql = `
        CREATE TABLE cash_account_rule_list_cash_rule (
            cashAccountId      INTEGER NOT NULL,
            cashRuleId INTEGER NOT NULL,
            CONSTRAINT FK_cash_account_rule_list_cash_rule_cashAccountId FOREIGN KEY (
                cashAccountId
            )
            REFERENCES cash_account (id) ON DELETE CASCADE,
            CONSTRAINT FK_cash_account_rule_list_cash_rule_cashRuleId FOREIGN KEY (
                cashRuleId
            )
            REFERENCES cash_rule (id) ON DELETE CASCADE,
            PRIMARY KEY (
                cashAccountId,
                cashRuleId
            )
        );`;
        await queryRunner.query(initSql);

        initSql = `
                CREATE TABLE cash_rule (
                    id          INTEGER      PRIMARY KEY AUTOINCREMENT
                                             NOT NULL,
                    createdDate DATETIME     NOT NULL
                                             DEFAULT (datetime('now') ),
                    updatedDate DATETIME     NOT NULL
                                             DEFAULT (datetime('now') ),
                    name        VARCHAR (20) NOT NULL COLLATE NOCASE,
                    type        VARCHAR (20) NOT NULL COLLATE NOCASE,
                    jsonRule  CLOB         NOT NULL
                );`;
        await queryRunner.query(initSql);
    }

    async down(queryRunner: QueryRunner): Promise<any> {}
}

Object.defineProperty(AddRule1535400915276, 'name', { value: 'AddRule1535400915276' });
