import XRegExp from 'xregexp/xregexp-all';

const entityMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '/': '&#x2F;',
    '`': '&#x60;',
    '=': '&#x3D;',
};

export default class StringUtils {
    static generateDuplicateName(oldName: string, withDash = false): string {
        return withDash ? 'copy-of-' + oldName : 'Copy of ' + oldName;
    }

    static tokenize(stringValue: string = ''): string {
        const match = XRegExp.match(stringValue, StringUtils.onlyUnicodeLetterRegex, 'all');
        const tokenArray: string[] = [];
        if (match) {
            for (const oneValue of match) {
                if (oneValue.length > 3) {
                    tokenArray.push(oneValue);
                }
            }
        }
        return tokenArray.join(' ');
    }

    static keepLetterOnly(value: string = ''): string {
        const match = XRegExp.match(value, StringUtils.onlyUnicodeLetterRegex, 'all');
        if (match) {
            return match.join(' ');
        } else {
            return '';
        }
    }

    static keepLetterNumberDashOnly(value: string = ''): string {
        const match = XRegExp.match(value, StringUtils.onlyUnicodeLetterNumberDashRegex, 'all');
        if (match) {
            return match.join('');
        } else {
            return '';
        }
    }

    static escapeHtml(string): string {
        return String(string).replace(/[&<>"'`=\/]/g, (s) => {
            return entityMap[s];
        });
    }

    static toUpperCaseFirstLetter(string: string): string {
        if (string) {
            return string[0].toUpperCase() + string.substring(1);
        } else {
            return '';
        }
    }

    private static onlyUnicodeLetterRegex = XRegExp('\\p{Letter}+');
    private static onlyUnicodeLetterNumberDashRegex = XRegExp('[\\p{Letter}\\p{Nd}-]+');
}
