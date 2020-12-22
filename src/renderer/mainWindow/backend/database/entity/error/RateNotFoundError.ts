export default class RateNotFoundError extends Error {
    fromCurrencyId: number;
    toCurrencyId: number;

    constructor(fromCurrencyId: number, toCurrencyId: number) {
        const message = 'Unknown Rate: ' + fromCurrencyId + ', ' + toCurrencyId;
        super(message);
        // see: typescriptlang.org/docs/handbook/release-notes/typescript-2-2.html
        Object.setPrototypeOf(this, new.target.prototype); // restore prototype chain
        this.name = RateNotFoundError.name; // stack traces display correctly now
        this.fromCurrencyId = fromCurrencyId;
        this.toCurrencyId = toCurrencyId;
    }
}
