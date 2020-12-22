import { MigrationInterface, QueryRunner } from 'typeorm';

export default class InitDatabase1535400915273 implements MigrationInterface {
    async up(queryRunner: QueryRunner): Promise<any> {
        let initSql = `
CREATE TABLE cash_account (
    id              INTEGER      PRIMARY KEY AUTOINCREMENT
                                 NOT NULL,
    createdDate     DATETIME     NOT NULL
                                 DEFAULT (datetime('now') ),
    updatedDate     DATETIME     NOT NULL
                                 DEFAULT (datetime('now') ),
    name            VARCHAR (80) NOT NULL COLLATE NOCASE,
    level           INTEGER      NOT NULL,
    type            VARCHAR (20) NOT NULL COLLATE NOCASE,
    code            VARCHAR COLLATE NOCASE,
    currencyId      INTEGER NOT NULL,
    parentAccountId INTEGER,
    isMultiCurrency BOOLEAN      NOT NULL,
    isDirectory     BOOLEAN      NOT NULL,
    isProtected     BOOLEAN      NOT NULL,
    bankInfoId      INTEGER,
    CONSTRAINT UQ_cash_account_code UNIQUE (code),
    CONSTRAINT REL_cash_account_bankInfoId UNIQUE (bankInfoId),
    CONSTRAINT FK_cash_account_bankInfoId FOREIGN KEY (bankInfoId)
    REFERENCES cash_bank_info (id),
    CONSTRAINT FK_cash_account_currencyId FOREIGN KEY (currencyId)
    REFERENCES cash_currency (id),
    CONSTRAINT FK_cash_account_parentAccountId FOREIGN KEY (parentAccountId)
    REFERENCES cash_account (id)
);`;
        await queryRunner.query(initSql);

        initSql = `
CREATE TABLE cash_account_import_config_list_cash_import_config (
    cashAccountId      INTEGER NOT NULL,
    cashImportConfigId INTEGER NOT NULL,
    CONSTRAINT FK_cash_account_import_config_list_cash_import_config_cashAccountId FOREIGN KEY (
        cashAccountId
    )
    REFERENCES cash_account (id) ON DELETE CASCADE,
    CONSTRAINT FK_cash_account_import_config_list_cash_import_config_cashImportConfigId FOREIGN KEY (
        cashImportConfigId
    )
    REFERENCES cash_import_config (id) ON DELETE CASCADE,
    PRIMARY KEY (
        cashAccountId,
        cashImportConfigId
    )
);`;
        await queryRunner.query(initSql);

        initSql = `
CREATE TABLE cash_bank_info (
    id            INTEGER       PRIMARY KEY AUTOINCREMENT
                                NOT NULL,
    createdDate   DATETIME      NOT NULL
                                DEFAULT (datetime('now') ),
    updatedDate   DATETIME      NOT NULL
                                DEFAULT (datetime('now') ),
    bankId        VARCHAR (255) COLLATE NOCASE,
    branchId      VARCHAR (255) COLLATE NOCASE,
    accountNumber VARCHAR (255) COLLATE NOCASE,
    accountKey    VARCHAR (255) COLLATE NOCASE,
    iban          VARCHAR (255) COLLATE NOCASE,
    bic           VARCHAR (255) COLLATE NOCASE
);`;
        await queryRunner.query(initSql);

        initSql = `
CREATE TABLE cash_currency (
    id          INTEGER      PRIMARY KEY AUTOINCREMENT
                             NOT NULL,
    createdDate DATETIME     NOT NULL
                             DEFAULT (datetime('now') ),
    updatedDate DATETIME     NOT NULL
                             DEFAULT (datetime('now') ),
    name        VARCHAR (20) NOT NULL COLLATE NOCASE,
    isoCode     VARCHAR (3)  NOT NULL COLLATE NOCASE,
    symbol      VARCHAR (5)  NOT NULL COLLATE NOCASE,
    CONSTRAINT UQ_cash_currency_isoCode UNIQUE (
        isoCode
    )
);`;
        await queryRunner.query(initSql);

        initSql = `
CREATE TABLE cash_import_config (
    id          INTEGER      PRIMARY KEY AUTOINCREMENT
                             NOT NULL,
    createdDate DATETIME     NOT NULL
                             DEFAULT (datetime('now') ),
    updatedDate DATETIME     NOT NULL
                             DEFAULT (datetime('now') ),
    name        VARCHAR (20) NOT NULL COLLATE NOCASE,
    type        VARCHAR (20) NOT NULL COLLATE NOCASE,
    jsonConfig  CLOB         NOT NULL
);`;
        await queryRunner.query(initSql);

        initSql = `
CREATE TABLE cash_rate (
    id               INTEGER      PRIMARY KEY AUTOINCREMENT
                                  NOT NULL,
    createdDate      DATETIME     NOT NULL
                                  DEFAULT (datetime('now') ),
    updatedDate      DATETIME     NOT NULL
                                  DEFAULT (datetime('now') ),
    fromCurrencyId   INTEGER NOT NULL,
    toCurrencyId     INTEGER NOT NULL,
    rate             VARCHAR (10) NOT NULL COLLATE NOCASE,
    validityDate     DATETIME     NOT NULL,
    CONSTRAINT FK_cash_rate_fromCurrencyId FOREIGN KEY (
        fromCurrencyId
    )
    REFERENCES cash_currency (id) ON DELETE CASCADE,
    CONSTRAINT FK_cash_rate_toCurrencyId FOREIGN KEY (
        toCurrencyId
    )
    REFERENCES cash_currency (id) ON DELETE CASCADE
);`;
        await queryRunner.query(initSql);

        initSql = `
CREATE TABLE cash_split (
    id                     INTEGER       PRIMARY KEY AUTOINCREMENT
                                         NOT NULL,
    createdDate            DATETIME      NOT NULL
                                         DEFAULT (datetime('now') ),
    updatedDate            DATETIME      NOT NULL
                                         DEFAULT (datetime('now') ),
    amountCent             INTEGER NOT NULL,
    accountId              INTEGER NOT NULL,
    currencyId             INTEGER NOT NULL,
    transactionId          INTEGER NOT NULL,
    transactionDescription VARCHAR (100) NOT NULL COLLATE NOCASE,
    transactionDate        DATETIME      NOT NULL,
    CONSTRAINT FK_cash_split_accountId FOREIGN KEY (
        accountId
    )
    REFERENCES cash_account (id),
    CONSTRAINT FK_cash_split_currencyId FOREIGN KEY (
        currencyId
    )
    REFERENCES cash_currency (id),
    CONSTRAINT FK_cash_split_transactionId FOREIGN KEY (
        transactionId
    )
    REFERENCES cash_transaction (id)
    ON DELETE CASCADE
);`;
        await queryRunner.query(initSql);

        initSql = `
CREATE TABLE cash_split_sum (
    id          INTEGER      PRIMARY KEY AUTOINCREMENT
                             NOT NULL,
    createdDate DATETIME     NOT NULL
                             DEFAULT (datetime('now') ),
    updatedDate DATETIME     NOT NULL
                             DEFAULT (datetime('now') ),
    amountCent      INTEGER NOT NULL,
    accountId   INTEGER NOT NULL,
    currencyId  INTEGER NOT NULL,
    CONSTRAINT FK_cash_split_sum_accountId FOREIGN KEY (
        accountId
    )
    REFERENCES cash_account (id),
    CONSTRAINT FK_cash_split_sum_currencyId FOREIGN KEY (
        currencyId
    )
    REFERENCES cash_currency (id)
);`;
        await queryRunner.query(initSql);

        initSql = `
CREATE TABLE cash_transaction (
    id              INTEGER       PRIMARY KEY AUTOINCREMENT
                                  NOT NULL,
    createdDate     DATETIME      NOT NULL
                                  DEFAULT (datetime('now') ),
    updatedDate     DATETIME      NOT NULL
                                  DEFAULT (datetime('now') ),
    description     VARCHAR (100) NOT NULL COLLATE NOCASE,
    detail          TEXT,
    importId        VARCHAR (50) COLLATE NOCASE,
    transactionDate DATETIME      NOT NULL
);`;
        await queryRunner.query(initSql);

        initSql = `
CREATE INDEX IDX_cash_transaction_importId ON cash_transaction (
    "importId"
);`;
        await queryRunner.query(initSql);

        initSql = `
CREATE INDEX IDX_cash_transaction_transactionDate ON cash_transaction (
    "transactionDate"
);`;
        await queryRunner.query(initSql);

        initSql = `
CREATE INDEX IDX_cash_split_transactionDate ON cash_split (
    "transactionDate"
);`;
        await queryRunner.query(initSql);

        initSql = `
CREATE INDEX IDX_cash_rate_validityDate ON cash_rate (
    "validityDate"
);`;
        await queryRunner.query(initSql);
    }

    async down(queryRunner: QueryRunner): Promise<any> {}
}

Object.defineProperty(InitDatabase1535400915273, 'name', { value: 'InitDatabase1535400915273' });
