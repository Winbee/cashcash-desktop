import { ValueTransformer } from 'typeorm';

export default class AmountTransformer implements ValueTransformer {
    to(stringAmount: string): number {
        return +stringAmount * 100;
    }

    from(amountCent: number): string {
        return (amountCent / 100).toFixed(2);
    }
}
