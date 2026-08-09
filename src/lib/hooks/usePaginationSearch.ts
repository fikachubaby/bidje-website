import { useState } from "react";

export function usePaginationSearch(initialLimit = 10) {
    const [page, setPage] = useState(1);
    const [limit] = useState(initialLimit);
    const [search, setSearchState] = useState("");

    const setSearch = (term: string) => {
        setSearchState(term);
        setPage(1);
    };

    const handleFilterChange = <T>(setFilter: (val: T) => void) => (val: T) => {
        setFilter(val);
        setPage(1);
    };

    return {
        page,
        setPage,
        limit,
        search,
        setSearch,
        handleFilterChange,
    };
}