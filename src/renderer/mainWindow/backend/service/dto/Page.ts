export default interface Page<Type> {
    itemList: Type[];
    currentPage: number;
    itemPerPage: number;
    totalItem: number;
}
