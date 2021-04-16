import { FieldNameActionType } from './CashRuleV1';

export class JsonAction {
    fieldName: FieldNameActionType;
    parameter: string | number[];
    randomId: number;
    constructor(jsonObj: any = {}) {
        if (jsonObj.fieldName) {
            this.fieldName = jsonObj.fieldName;
        }
        if (jsonObj.parameter) {
            this.parameter = jsonObj.parameter;
        }
        this.randomId = Math.random();
    }
}
