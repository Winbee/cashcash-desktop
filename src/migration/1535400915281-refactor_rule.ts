import { MigrationInterface, QueryRunner } from 'typeorm';

export default class RefactorRule1535400915281 implements MigrationInterface {
    async up(queryRunner: QueryRunner): Promise<any> {
        let initSql = `DROP TABLE cash_rule;`;
        await queryRunner.query(initSql);

        initSql = `DROP TABLE cash_account_rule_list_cash_rule;`;
        await queryRunner.query(initSql);

        initSql = `
        CREATE TABLE cash_account_filter_list_cash_filter (
            cashAccountId      INTEGER NOT NULL,
            cashFilterId INTEGER NOT NULL,
            CONSTRAINT FK_cash_account_filter_list_cash_filter_cashAccountId FOREIGN KEY (
                cashAccountId
            )
            REFERENCES cash_account (id) ON DELETE CASCADE,
            CONSTRAINT FK_cash_account_filter_list_cash_filter_cashFilterId FOREIGN KEY (
                cashFilterId
            )
            REFERENCES cash_filter (id) ON DELETE CASCADE,
            PRIMARY KEY (
                cashAccountId,
                cashFilterId
            )
        );`;
        await queryRunner.query(initSql);

        initSql = `
                CREATE TABLE cash_filter (
                    id              INTEGER     PRIMARY KEY AUTOINCREMENT
                                                NOT NULL,
                    createdDate     DATETIME    NOT NULL
                                                DEFAULT (datetime('now') ),
                    updatedDate     DATETIME    NOT NULL
                                                DEFAULT (datetime('now') ),
                    name            VARCHAR (20) NOT NULL COLLATE NOCASE,
                    jsonFilter  CLOB         NOT NULL
                );`;
        await queryRunner.query(initSql);

        initSql = `
        CREATE TABLE cash_account_action_list_cash_action (
            cashAccountId      INTEGER NOT NULL,
            cashActionId INTEGER NOT NULL,
            CONSTRAINT FK_cash_account_action_list_cash_action_cashAccountId FOREIGN KEY (
                cashAccountId
            )
            REFERENCES cash_account (id) ON DELETE CASCADE,
            CONSTRAINT FK_cash_account_action_list_cash_action_cashActionId FOREIGN KEY (
                cashActionId
            )
            REFERENCES cash_action (id) ON DELETE CASCADE,
            PRIMARY KEY (
                cashAccountId,
                cashActionId
            )
        );`;
        await queryRunner.query(initSql);

        initSql = `
                CREATE TABLE cash_action (
                    id              INTEGER     PRIMARY KEY AUTOINCREMENT
                                                NOT NULL,
                    createdDate     DATETIME    NOT NULL
                                                DEFAULT (datetime('now') ),
                    updatedDate     DATETIME    NOT NULL
                                                DEFAULT (datetime('now') ),
                    name            VARCHAR (20) NOT NULL COLLATE NOCASE,
                    jsonActionList  CLOB         NOT NULL
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
                    priority      INTEGER NOT NULL,
                    filterId      INTEGER NOT NULL,
                    actionId      INTEGER NOT NULL,
                    CONSTRAINT FK_cash_filter_filterId FOREIGN KEY (filterId)
                    REFERENCES cash_filter (id),
                    CONSTRAINT FK_cash_action_actionId FOREIGN KEY (actionId)
                    REFERENCES cash_action (id)
                );`;
        await queryRunner.query(initSql);
    }

    async down(queryRunner: QueryRunner): Promise<any> {}
}

Object.defineProperty(RefactorRule1535400915281, 'name', { value: 'RefactorRule1535400915281' });
