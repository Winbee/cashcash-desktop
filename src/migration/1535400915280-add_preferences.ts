import { MigrationInterface, QueryRunner } from 'typeorm';

export default class AddPreferences1535400915280 implements MigrationInterface {
    async up(queryRunner: QueryRunner): Promise<any> {
        const initSql = `
        CREATE TABLE cash_preferences (
            id                  INTEGER     PRIMARY KEY AUTOINCREMENT
                                            NOT NULL,
            createdDate         DATETIME    NOT NULL
                                            DEFAULT (datetime('now') ),
            updatedDate         DATETIME    NOT NULL
                                            DEFAULT (datetime('now') ),
            jsonPreferences     CLOB        NOT NULL,
            preferedCurrencyId  INTEGER     NULL,

            CONSTRAINT FK_cash_rate_preferedCurrencyId FOREIGN KEY (
                preferedCurrencyId
            )
            REFERENCES cash_currency (id) ON DELETE CASCADE
        );`;
        await queryRunner.query(initSql);
    }

    async down(queryRunner: QueryRunner): Promise<any> {}
}

Object.defineProperty(AddPreferences1535400915280, 'name', {
    value: 'AddPreferences1535400915280',
});
