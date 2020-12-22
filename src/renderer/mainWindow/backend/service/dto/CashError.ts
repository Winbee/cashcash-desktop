export default class CashError extends Error {
    constructor(message) {
        super(message);
        this.name = 'CASH_ERROR';
        this.message = message;
        this.stack = new Error().stack;
    }
}
