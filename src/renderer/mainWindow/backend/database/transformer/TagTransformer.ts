import { ValueTransformer } from 'typeorm';

export default class TagTransformer implements ValueTransformer {
    to(tagIds: number[]): string {
        return JSON.stringify(tagIds);
    }

    from(stringTagIds: string): number[] {
        return JSON.parse(stringTagIds);
    }
}
