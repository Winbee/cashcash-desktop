import { MigrationInterface, QueryRunner } from 'typeorm';

export default class AddTempFullSearch1535400915285 implements MigrationInterface {
    async up(queryRunner: QueryRunner): Promise<any> {
        const initSql = `CREATE VIRTUAL TABLE cash_transaction_temp_idx USING fts5(description, detail);`;
        await queryRunner.query(initSql);
    }

    async down(queryRunner: QueryRunner): Promise<any> {}
}

Object.defineProperty(AddTempFullSearch1535400915285, 'name', {
    value: 'AddTempFullSearch1535400915285',
});
