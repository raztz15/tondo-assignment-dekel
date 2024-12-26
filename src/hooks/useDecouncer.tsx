import { useEffect, useState } from "react";

export const useDebouncer = (query: string, timer: number) => {

    const [debounce, setDebounce] = useState<string>(query);

    useEffect(() => {
        const timeOutId = setTimeout(() => {
            setDebounce(query)
        }, timer);

        return () => clearTimeout(timeOutId)
    }, [query, timer])

    return debounce
}