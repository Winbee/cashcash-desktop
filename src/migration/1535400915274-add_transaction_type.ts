import { MigrationInterface, QueryRunner } from 'typeorm';

export default class AddTransaction1535400915274 implements MigrationInterface {
    async up(queryRunner: QueryRunner): Promise<any> {
        // tslint:disable-next-line:max-line-length
        const initSql = `ALTER TABLE cash_transaction ADD COLUMN type VARCHAR (20) NOT NULL COLLATE NOCASE DEFAULT 'CUSTOM';`;
        await queryRunner.query(initSql);
    }

    async down(queryRunner: QueryRunner): Promise<any> {}
}

Object.defineProperty(AddTransaction1535400915274, 'name', {
    value: 'AddTransaction1535400915274',
});
