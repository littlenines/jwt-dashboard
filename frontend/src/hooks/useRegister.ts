import { useState, type SubmitEvent } from "react";
import { useNavigate } from "react-router";
import { authApi } from "@/api/auth";
import { useFormSubmit } from "./useFormSubmit";

const initialValues = {
  username: "",
  email: "",
  password: "",
  confirmPassword: "",
  accept: false,
};

export const useRegister = () => {
  const [values, setValues] = useState(initialValues);
  const { error, pending, run } = useFormSubmit();

  const navigate = useNavigate();

  const setField = <K extends keyof typeof values>(key: K, value: (typeof values)[K]) =>
    setValues((current) => ({ ...current, [key]: value }));

  const submit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    void run(async () => {
      await authApi.register(values);
      navigate("/");
    });
  };

  return { values, setField, error, pending, submit };
};
