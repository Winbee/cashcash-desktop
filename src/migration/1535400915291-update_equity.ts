import { MigrationInterface, QueryRunner } from 'typeorm';

export default class UpdateEquity1535400915291 implements MigrationInterface {
    async up(queryRunner: QueryRunner): Promise<any> {
        let initSql = `UPDATE cash_account
        SET name = 'Opening',
            code = 'OPE'
        WHERE
            code = 'EQU';`;
        await queryRunner.query(initSql);

        initSql = `UPDATE cash_account
        SET type = 'OPENING'
        WHERE
            type = 'EQUITY';`;
        await queryRunner.query(initSql);

        initSql = `UPDATE cash_transaction
        SET type = 'OPENING_NEGATIVE'
        WHERE
            type = 'EQUITY_DECREASE';`;
        await queryRunner.query(initSql);

        initSql = `UPDATE cash_transaction
        SET type = 'OPENING_POSITIVE'
        WHERE
            type = 'EQUITY_INCREASE';`;
        await queryRunner.query(initSql);

        initSql = `UPDATE cash_split
        SET transactionType = 'OPENING_NEGATIVE'
        WHERE
            transactionType = 'EQUITY_DECREASE';`;
        await queryRunner.query(initSql);

        initSql = `UPDATE cash_split
        SET transactionType = 'OPENING_POSITIVE'
        WHERE
            transactionType = 'EQUITY_INCREASE';`;
        await queryRunner.query(initSql);

        initSql = `UPDATE cash_budget_transaction
        SET type = 'OPENING_NEGATIVE'
        WHERE
            type = 'EQUITY_DECREASE';`;
        await queryRunner.query(initSql);

        initSql = `UPDATE cash_budget_transaction
        SET type = 'OPENING_POSITIVE'
        WHERE
            type = 'EQUITY_INCREASE';`;
        await queryRunner.query(initSql);

        initSql = `UPDATE cash_budget_split
        SET transactionType = 'OPENING_NEGATIVE'
        WHERE
            transactionType = 'EQUITY_DECREASE';`;
        await queryRunner.query(initSql);

        initSql = `UPDATE cash_budget_split
        SET transactionType = 'OPENING_POSITIVE'
        WHERE
            transactionType = 'EQUITY_INCREASE';`;
        await queryRunner.query(initSql);

        initSql = `UPDATE cash_account
        SET name = 'Asset'
        WHERE
            code = 'ASS';`;
        await queryRunner.query(initSql);

        initSql = `UPDATE cash_account
        SET name = 'Expense'
        WHERE
            code = 'EXP';`;
        await queryRunner.query(initSql);

        initSql = `UPDATE cash_account
        SET name = 'Income'
        WHERE
            code = 'INC';`;
        await queryRunner.query(initSql);

        initSql = `UPDATE cash_account
        SET name = 'Liability'
        WHERE
            code = 'LIA';`;
        await queryRunner.query(initSql);
    }

    async down(queryRunner: QueryRunner): Promise<any> {}
}

Object.defineProperty(UpdateEquity1535400915291, 'name', {
    value: 'UpdateEquity1535400915291',
});
