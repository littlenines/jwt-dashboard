import { useState } from "react";

// Shared error/pending state for a form submit. Each hook (useLogin,
// useRegister, useAddUser, …) drives it with its own try/catch.
export const useFormSubmit = () => {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  return { error, setError, pending, setPending };
};
