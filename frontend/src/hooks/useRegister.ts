import { useState, type SubmitEvent } from "react";
import { useNavigate } from "react-router";
import { authApi } from "@/api/auth";
import { getErrorMessage } from "@/lib/apiError";
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
  const { error, setError, pending, setPending } = useFormSubmit();

  const navigate = useNavigate();

  const setField = <K extends keyof typeof values>(key: K, value: (typeof values)[K]) =>
    setValues((current) => ({ ...current, [key]: value }));

  const submit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setPending(true);

    try {
      await authApi.register(values);
      navigate("/"); // register does not log you in — go to the login screen
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setPending(false);
    }
  };

  return { values, setField, error, pending, submit };
};
