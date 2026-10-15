import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import { userApi } from "@/api/user";
import { type PaginatedUsers } from "@/types/user";

export const useUserPagination = () => {
  const [data, setData] = useState<PaginatedUsers>({ total: 0, users: [] });
  const [searchParams, setSearchParams] = useSearchParams();

  const page = Number(searchParams.get("page")) || 1;
  const pageSize = Number(searchParams.get("pageSize")) || 10;

  const search = searchParams.get("search") || undefined;
  const role = searchParams.get("role") || undefined;
  const status = searchParams.get("status") || undefined;

  useEffect(() => {
    let ignore = false;

    userApi
      .pagination(page, pageSize, { search, role, status })
      .then((result) => {
        if (!ignore) setData(result);
      })
      .catch((error) => console.error(error));

    return () => {
      ignore = true;
    };
  }, [page, pageSize, search, role, status]);

  const handlePageChange = (nextPage: number) => {
    setSearchParams((params) => {
      params.set("page", String(nextPage));
      return params;
    });
  };

  const handlePageSizeChange = (nextPageSize: number) => {
    setSearchParams((params) => {
      params.set("page", "1");
      params.set("pageSize", String(nextPageSize));
      return params;
    });
  };

  const setFilter = (key: "search" | "role" | "status", value: string) => {
    setSearchParams((params) => {
      params.set("page", "1");
      if (value) params.set(key, value);
      else params.delete(key);
      return params;
    });
  };

  const handleSearch = (searchInfo: string) => setFilter("search", searchInfo);

  const handleRole = (roleInfo: string) => setFilter("role", roleInfo);
  
  const handleStatus = (statusInfo: string) => setFilter("status", statusInfo);

  return {data, page, pageSize, search, role, status, handlePageChange, handlePageSizeChange, handleSearch, handleRole, handleStatus}
}
