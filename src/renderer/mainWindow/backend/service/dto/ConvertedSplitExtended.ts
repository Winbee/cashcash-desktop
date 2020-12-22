import ConvertedSplit from './ConvertedSplit';

export default interface ConvertedSplitExtended extends ConvertedSplit {
    transactionId: number;
    otherSplitAccountId: number;
    isToSplit: boolean;
}
