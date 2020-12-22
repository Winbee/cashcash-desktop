import { MigrationInterface, QueryRunner } from 'typeorm';

export default class AddUuid1535400915290 implements MigrationInterface {
    async up(queryRunner: QueryRunner): Promise<any> {
        // tslint:disable-next-line:max-line-length
        const initSql = `ALTER TABLE cash_preferences ADD COLUMN uuid type VARCHAR (40);`;
        await queryRunner.query(initSql);
    }

    async down(queryRunner: QueryRunner): Promise<any> {}
}

Object.defineProperty(AddUuid1535400915290, 'name', {
    value: 'AddUuid1535400915290',
});
