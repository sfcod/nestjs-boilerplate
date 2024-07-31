export type ListResponseType<T> = {
    list: T[];
    page: number;
    pageSize: number;
    totalPages: number;
    totalCount: number;
};
