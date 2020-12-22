import { AccountTestMethodType } from './CashRuleV1';
import {
    FieldNameDetectionType,
    NumberTestMethodType,
    StringTestMethodType,
    EnumOrObjectTestMethodType,
} from './CashRuleV1';

export class OneJsonFilter {
    fieldName: FieldNameDetectionType;
    testMethod:
        | NumberTestMethodType
        | StringTestMethodType
        | EnumOrObjectTestMethodType
        | AccountTestMethodType;
    parameter: string;
    randomId: number;
    constructor(jsonObj: any = {}) {
        if (jsonObj.fieldName) {
            this.fieldName = jsonObj.fieldName;
        }
        if (jsonObj.testMethod) {
            this.testMethod = jsonObj.testMethod;
        }
        if (jsonObj.parameter) {
            this.parameter = jsonObj.parameter;
        }
        this.randomId = Math.random();
    }
}
