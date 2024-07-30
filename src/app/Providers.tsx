"use client";

import { LiveblocksProvider } from "@liveblocks/react";
import React from "react";
import {
  createContext,
  Dispatch,
  SetStateAction,
  useContext,
  useState,
} from "react";

export const AuthContext = createContext<{
  token: null;
  setToken: Dispatch<SetStateAction<null>>;
}>({ token: null, setToken: () => {} });
import { ReactNode } from "react";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState(null);
  return (
    <AuthContext.Provider value={{ token, setToken }}>
      {children}
    </AuthContext.Provider>
  );
};
export const useAuth = () => useContext(AuthContext);

export const Providers = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState(null);
  return (
    <AuthContext.Provider value={{ token, setToken }}>
      <LiveblocksProvider
        // @ts-expect-error
        baseUrl="https://dev.dev-liveblocks5948.workers.dev"
        authEndpoint={async (room) => {
          const response = await fetch("/api/liveblocks-auth", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ room }),
          });

          const auth = await response.json();

          const token = auth.token;

          if (!token) {
            throw new Error("Problem authenticating");
          }

          setToken(token); // Set the token in AuthProvider

          return auth;
        }}
        // Get users' info from their ID
        resolveUsers={async ({ userIds }) => {
          const searchParams = new URLSearchParams(
            userIds.map((userId) => ["userIds", userId])
          );
          const response = await fetch(`/api/users?${searchParams}`);

          if (!response.ok) {
            throw new Error("Problem resolving users");
          }

          const users = await response.json();
          return users;
        }}
        // Find a list of users that match the current search term
        resolveMentionSuggestions={async ({ text }) => {
          const response = await fetch(
            `/api/users/search?text=${encodeURIComponent(text)}`
          );

          if (!response.ok) {
            throw new Error("Problem resolving mention suggestions");
          }

          const userIds = await response.json();
          return userIds;
        }}
      >
        {children}
      </LiveblocksProvider>
    </AuthContext.Provider>
  );
};
