import { ThreadData } from "@liveblocks/client";
import { useClient } from "@liveblocks/react";
import { useCallback, useEffect } from "react";
import {
  kInternal,
  applyOptimisticUpdates,
  CacheState,
} from "@liveblocks/core";
import { useSyncExternalStoreWithSelector } from "use-sync-external-store/shim/with-selector.js";

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

export function useAllThreads(): ThreadsState {
  const client = useClient();
  const store = client[kInternal].cacheStore;

  useEffect(() => {
    // TODO: Polling and inbox notifications
    (client as any).getThreads().then(({ threads }: any) => {
      store.updateThreadsAndNotifications(threads, [], [], []);
    });
  }, [store]);

  const selector = useCallback(
    (state: CacheState<any>): ThreadsStateSuccess => {
      const result = applyOptimisticUpdates(state);

      // TODO: filter deleted
      return {
        threads: Object.values(result.threads).sort(
          (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
        ),
        // TODO: Loading and error handling
        isLoading: false,
      };
    },
    []
  );

  return useSyncExternalStoreWithSelector(
    store.subscribe,
    store.get,
    store.get,
    selector
  );
}
