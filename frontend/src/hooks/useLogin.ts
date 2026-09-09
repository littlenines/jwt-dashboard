import { useState, type SubmitEvent } from "react";
import { useNavigate } from "react-router";
import { authApi } from "@/api/auth";
import { useAuth } from "@/context/auth/useAuth";
import { useFormSubmit } from "./useFormSubmit";

const initialValues = { email: "", password: "", remember: false };

export const useLogin = () => {
  const [values, setValues] = useState(initialValues);
  const { error, pending, run } = useFormSubmit();

  const navigate = useNavigate();
  const { refetch } = useAuth();

  const setField = <K extends keyof typeof values>(key: K, value: (typeof values)[K]) =>
    setValues((current) => ({ ...current, [key]: value }));

  const submit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    void run(async () => {
      await authApi.login(values);
      refetch();
      navigate("/dashboard");
    });
  };

  return { values, setField, error, pending, submit };
};
