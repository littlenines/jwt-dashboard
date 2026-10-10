import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import { userApi } from "@/api/user";
import { type PaginatedUsers } from "@/types/user";

export const useUserPagination = () => {
  const [data, setData] = useState<PaginatedUsers>({ total: 0, users: [] });
  const [searchParams, setSearchParams] = useSearchParams();

  const page = Number(searchParams.get("page")) || 1;
  const pageSize = Number(searchParams.get("pageSize")) || 10;

  useEffect(() => {
    userApi.pagination(page, pageSize).then(setData).catch((error) => console.error(error));
  }, [page, pageSize])

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

  return {data, page, pageSize, handlePageChange, handlePageSizeChange}
}
