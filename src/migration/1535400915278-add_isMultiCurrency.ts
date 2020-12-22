import { MigrationInterface, QueryRunner } from 'typeorm';

export default class AddIsMultiCurrency1535400915278 implements MigrationInterface {
    async up(queryRunner: QueryRunner): Promise<any> {
        const initSql = `ALTER TABLE cash_transaction ADD COLUMN isMultiCurrency BOOLEAN NOT NULL DEFAULT 0;`;
        await queryRunner.query(initSql);
    }

    async down(queryRunner: QueryRunner): Promise<any> {}
}

Object.defineProperty(AddIsMultiCurrency1535400915278, 'name', {
    value: 'AddIsMultiCurrency1535400915278',
});
