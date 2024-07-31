import { ThreadData } from "@liveblocks/client";
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
const minutes = (minutes: number) => seconds(minutes * 60);

export function useAllThreads(): ThreadsState {
  const fetcher = async (url: string) => {
    const res = await fetch(url);

    return res.json();
  };

  const { data, isLoading, error } = useSWR<{ threads: ThreadData[] }, Error>(
    "/api/liveblocks-user-threads",
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
