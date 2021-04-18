import { ValueTransformer } from 'typeorm';

export const TAG_SEPARATOR = '-';

export default class TagTransformer implements ValueTransformer {
    to(tagIdList: number[]): string {
        const list = tagIdList || [];
        return (
            list
                // We sort it to be able to search for several tags in one query
                .sort()
                // We wrap the ids with "-" to have a simple regex when searching
                .map((item) => `${TAG_SEPARATOR}${item}${TAG_SEPARATOR}`)
                .join('')
        );
    }

    from(stringTagIdList: string): number[] {
        if (!stringTagIdList) {
            return [];
        }
        return stringTagIdList
            .slice(1, stringTagIdList.length - 1)
            .split(`${TAG_SEPARATOR}${TAG_SEPARATOR}`)
            .map((item) => +item);
    }
}
