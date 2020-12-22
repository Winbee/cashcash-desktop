import { WhereExpression } from 'typeorm';

export default class QueryBuilderUtil {
    static addDateFilter<T extends WhereExpression>(
        qb: T,
        tableAlias: string,
        dateFieldName: string,
        fromDate?: Date,
        toDate?: Date,
    ): T {
        if (fromDate && toDate) {
            const fromDateString = fromDate.toISOString();
            const toDateString = toDate.toISOString();
            qb = qb.andWhere(
                `${tableAlias}.${dateFieldName} BETWEEN datetime('${fromDateString}') AND datetime('${toDateString}')`,
            );
        } else if (fromDate) {
            const fromDateString = fromDate.toISOString();
            qb = qb.andWhere(`${tableAlias}.${dateFieldName} >= datetime('${fromDateString}')`);
        } else if (toDate) {
            const toDateString = toDate.toISOString();
            qb = qb.andWhere(`${tableAlias}.${dateFieldName} < datetime('${toDateString}')`);
        }
        return qb;
    }
}
