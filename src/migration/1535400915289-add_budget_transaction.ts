import { MigrationInterface, QueryRunner } from 'typeorm';

export default class AddBudgetTransaction1535400915289 implements MigrationInterface {
    async up(queryRunner: QueryRunner): Promise<any> {
        let initSql = `
        CREATE TABLE cash_budget_transaction (
            id                  INTEGER       PRIMARY KEY AUTOINCREMENT
                                              NOT NULL,
            createdDate         DATETIME      NOT NULL
                                              DEFAULT (datetime('now') ),
            updatedDate         DATETIME      NOT NULL
                                              DEFAULT (datetime('now') ),
            description         VARCHAR (100) NOT NULL
                                              COLLATE NOCASE
                                              DEFAULT 'NO DESCRIPTION',
            detail              TEXT,
            importId            VARCHAR (50)  COLLATE NOCASE,
            transactionDate     DATETIME      NOT NULL
                                              DEFAULT (datetime('now') ),
            type                VARCHAR (20)  NOT NULL
                                              COLLATE NOCASE
                                              DEFAULT 'CUSTOM',
            isMultiCurrency     BOOLEAN       NOT NULL
                                              DEFAULT 0,
            fromSplitAmountCent INTEGER       NOT NULL
                                              DEFAULT 0,
            fromSplitAccountId  INTEGER       NOT NULL
                                              DEFAULT 0,
            fromSplitCurrencyId INTEGER       NOT NULL
                                              DEFAULT 0,
            toSplitAmountCent   INTEGER       NOT NULL
                                              DEFAULT 0,
            toSplitAccountId    INTEGER       NOT NULL
                                              DEFAULT 0,
            toSplitCurrencyId   INTEGER       NOT NULL
                                              DEFAULT 0
        );`;
        await queryRunner.query(initSql);

        initSql = `
        CREATE TABLE cash_budget_split (
            id                     INTEGER       PRIMARY KEY AUTOINCREMENT
                                                 NOT NULL,
            createdDate            DATETIME      NOT NULL
                                                 DEFAULT (datetime('now') ),
            updatedDate            DATETIME      NOT NULL
                                                 DEFAULT (datetime('now') ),
            amountCent             INTEGER       NOT NULL,
            accountId              INTEGER       NOT NULL,
            currencyId             INTEGER       NOT NULL,
            transactionId          INTEGER       NOT NULL,
            transactionDescription VARCHAR (100) NOT NULL
                                                 COLLATE NOCASE,
            transactionDate        DATETIME      NOT NULL,
            transactionType        VARCHAR (20)  NOT NULL
                                                 COLLATE NOCASE
                                                 DEFAULT 'CUSTOM',
            isToSplit              BOOLEAN       NOT NULL
                                                 DEFAULT 0,
            otherSplitAmountCent   INTEGER       NOT NULL
                                                 DEFAULT 0,
            otherSplitAccountId    INTEGER       NOT NULL
                                                 DEFAULT 0,
            otherSplitCurrencyId   INTEGER       NOT NULL
                                                 DEFAULT 0,
            CONSTRAINT FK_cash_budget_split_accountId FOREIGN KEY (
                accountId
            )
            REFERENCES cash_account (id),
            CONSTRAINT FK_cash_budget_split_currencyId FOREIGN KEY (
                currencyId
            )
            REFERENCES cash_currency (id),
            CONSTRAINT FK_cash_budget_split_budget_transactionId FOREIGN KEY (
                transactionId
            )
            REFERENCES cash_budget_transaction (id) ON DELETE CASCADE
        );`;
        await queryRunner.query(initSql);

        initSql = `DROP TABLE IF EXISTS cash_budget;`;
        await queryRunner.query(initSql);
    }

    async down(queryRunner: QueryRunner): Promise<any> {}
}

Object.defineProperty(AddBudgetTransaction1535400915289, 'name', {
    value: 'AddBudgetTransaction1535400915289',
});
