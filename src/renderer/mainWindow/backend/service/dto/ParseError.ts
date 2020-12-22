export default interface ParseError {
    type: string; // A generalization of the error
    code: string; // Standardized error code
    message: string; // Human-readable details
    row: number; // Row index of parsed data where error is
}
