import { useState, type SubmitEvent } from "react";
import { userApi } from "@/api/user";
import { getErrorMessage } from "@/lib/apiError";
import { useFormSubmit } from "./useFormSubmit";
import type { AddUserInput } from "@/types/user";

const initialValues: AddUserInput = {
  username: "",
  email: "",
  password: "",
  confirmPassword: "",
  role: "staff",
  status: "active",
};

export const useAddUser = (onSuccess: () => void) => {
  const [values, setValues] = useState(initialValues);
  const { error, setError, pending, setPending } = useFormSubmit();

  const setField = <K extends keyof typeof values>(key: K, value: (typeof values)[K]) =>
    setValues((current) => ({ ...current, [key]: value }));

  const submit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setPending(true);

    try {
      await userApi.add(values);
      onSuccess();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setPending(false);
    }
  };

  return { values, setField, error, pending, submit };
};
