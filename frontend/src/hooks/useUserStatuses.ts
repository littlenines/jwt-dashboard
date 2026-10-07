import { useState, useEffect } from "react";
import { type UserStatusCounts } from "@/types/user";
import { userApi } from "@/api/user";

const initialStatus: UserStatusCounts = {
  total: 0,
  active: 0,
  inactive: 0,
  suspended: 0,
};

export const useUserStatuses = () => {
  const [status, setStatus] = useState(initialStatus);

  useEffect(() => {
    userApi.status().then(setStatus).catch((error) => console.error(error));
  }, []);

  return status;
};
