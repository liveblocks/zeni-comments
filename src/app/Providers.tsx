"use client";

import { LiveblocksProvider } from "@liveblocks/react";
import React, { PropsWithChildren } from "react";
import { LIVEBLOCKS_BASE_URL } from "../constants";
import { useAuthEndpointCallback } from "../authentication";

export function Providers({ children }: PropsWithChildren) {
  const authEndpoint = useAuthEndpointCallback("/api/liveblocks-auth");

  return (
    <LiveblocksProvider
      // @ts-expect-error
      baseUrl={LIVEBLOCKS_BASE_URL}
      // Get the auth token from the auth endpoint
      authEndpoint={authEndpoint}
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
  );
}
