import { MigrationInterface, QueryRunner } from 'typeorm';

export default class AddTransactionTypeInSplit1535400915279 implements MigrationInterface {
    async up(queryRunner: QueryRunner): Promise<any> {
        // tslint:disable-next-line:max-line-length
        const initSql = `ALTER TABLE cash_split ADD COLUMN transactionType VARCHAR (20) NOT NULL COLLATE NOCASE DEFAULT 'CUSTOM';`;
        await queryRunner.query(initSql);
    }

    async down(queryRunner: QueryRunner): Promise<any> {}
}

Object.defineProperty(AddTransactionTypeInSplit1535400915279, 'name', {
    value: 'AddTransactionTypeInSplit1535400915279',
});
