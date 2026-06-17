import { useAuth } from "@clerk/nextjs";
import { useCallback } from "react";

export function useAuthFetch() {
  const { getToken } = useAuth();
  return useCallback(async (url: string, options: RequestInit = {}): Promise<Response> => {
    const token = await getToken({ skipCache: true });
    return fetch(url, {
      ...options,
      headers: {
        ...(options.headers as Record<string, string> | undefined),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
  }, [getToken]);
}
