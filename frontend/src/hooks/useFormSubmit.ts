import { useState } from "react";
import { getErrorMessage } from "@/lib/apiError";

export const useFormSubmit = () => {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const run = async (action: () => Promise<void>) => {
    setError(null);
    setPending(true);
    try {
      await action();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setPending(false);
    }
  };

  return { error, pending, run };
};
