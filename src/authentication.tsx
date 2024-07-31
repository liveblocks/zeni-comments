"use client";

import {
  createContext,
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  useCallback,
  useContext,
  useState,
} from "react";

type LiveblocksAuthContext = {
  token: string | null;
  setToken: Dispatch<SetStateAction<string | null>>;
};

export const LiveblocksAuthContext =
  createContext<LiveblocksAuthContext | null>(null);

export function LiveblocksAuthProvider({ children }: PropsWithChildren) {
  const [token, setToken] = useState<string | null>(null);

  return (
    <LiveblocksAuthContext.Provider value={{ token, setToken }}>
      {children}
    </LiveblocksAuthContext.Provider>
  );
}

export function useLiveblocksAuth() {
  const auth = useContext(LiveblocksAuthContext);

  if (!auth) {
    throw new Error(
      "useLiveblocksAuth must be used within LiveblocksAuthProvider."
    );
  }

  return auth;
}

export function useAuthEndpointCallback(endpoint: string) {
  const { setToken } = useLiveblocksAuth();

  const authEndpointCallback = useCallback(
    async (room?: string) => {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ room }),
      });

      const auth = await response.json();
      const token = auth.token;

      if (!token) {
        throw new Error("There was a problem while authenticating.");
      }

      // Store the token in LiveblocksAuthContext
      setToken(token);

      return auth;
    },
    [setToken]
  );

  return authEndpointCallback;
}
