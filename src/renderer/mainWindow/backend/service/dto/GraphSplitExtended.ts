import GraphSplit from './GraphSplit';

export default interface GraphSplitExtended extends GraphSplit {
    transactionId: number;
    otherSplitAccountId: number;
    isToSplit: boolean;
}
