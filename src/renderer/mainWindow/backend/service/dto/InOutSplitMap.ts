import GraphSplit from './GraphSplit';

export default interface InOutSplitMap {
    inMap: Map<number, GraphSplit>;
    outMap: Map<number, GraphSplit>;
}
