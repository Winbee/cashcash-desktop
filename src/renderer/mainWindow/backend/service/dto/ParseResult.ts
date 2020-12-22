import ParseError from './ParseError';

export default interface ParseResult {
    data: any[];
    errors: ParseError[];
}
