import GraphSplitExtended from '../service/dto/GraphSplitExtended';

export default class CashBudgetUtils {
    static generateKey(item: GraphSplitExtended): string {
        if (item.isToSplit) {
            return `${item.otherSplitAccountId}-${item.accountId}`;
        } else {
            return `${item.accountId}-${item.otherSplitAccountId}`;
        }
    }
}
