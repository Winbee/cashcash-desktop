import StringUtils from './StringUtils';

export default class CashTransactionIndexUtils {
    static generateListItem(searchString: string): Set<string> {
        return new Set(
            StringUtils.keepLetterOnly(searchString)
                .split(' ')
                .filter((s) => s.length >= 2),
        );
    }
}
