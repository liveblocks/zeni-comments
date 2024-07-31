import { useCallback } from "react";
import { useLiveblocksAuth } from "./authentication";
import { ThreadData } from "@liveblocks/client";
import { LIVEBLOCKS_BASE_URL } from "./constants";
import useSWR from "swr";

type ThreadsStateLoading = {
  threads?: never;
  isLoading: true;
  error?: never;
};

type ThreadsStateError = {
  threads?: never;
  isLoading: false;
  error: Error;
};

type ThreadsStateSuccess = {
  threads: ThreadData[];
  isLoading: false;
  error?: never;
};

type ThreadsState =
  | ThreadsStateLoading
  | ThreadsStateError
  | ThreadsStateSuccess;

const seconds = (seconds: number) => seconds * 1000;

export function useAllThreads(): ThreadsState {
  const { token } = useLiveblocksAuth();

  const fetcher = useCallback(
    async (url: string) => {
      if (!token) {
        console.log("Missing Liveblocks token.");
        return;
      }

      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return res.json();
    },
    [token]
  );

  const { data, isLoading, error } = useSWR<{ threads: ThreadData[] }, Error>(
    // Only start fetching threads if we have a token
    token ? `${LIVEBLOCKS_BASE_URL}/v2/c/threads` : null,
    fetcher,
    {
      refreshInterval: seconds(5),
    }
  );

  return {
    threads: data?.threads,
    isLoading,
    error,
  } as ThreadsState;
}
