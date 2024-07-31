"use client";

import {
  ComponentProps,
  MouseEvent,
  useCallback,
  useMemo,
  useState,
} from "react";
import {
  ClientSideSuspense,
  RoomProvider,
  useThreads,
} from "@liveblocks/react";
import { ThreadData } from "@liveblocks/core";
import { Composer, Thread } from "@liveblocks/react-ui";
import { useAllThreads } from "../useAllThreads";
import { Loading } from "../components/Loading";

interface RowProps extends ComponentProps<"li"> {
  customerId: string;
  onRowFocusChange: (customerId: string) => void;
  isFocused: boolean;
  hasThread: boolean;
  thread?: ThreadData;
  isLoading?: boolean;
}

export default function Page() {
  const [numberOfExamples, setNumberOfExamples] = useState(500);
  const customerIds = useMemo(() => {
    return Array.from({ length: numberOfExamples }, (_, index) => `${index}`);
  }, [numberOfExamples]);
  const [focusedCustomerId, setFocusedCustomerId] = useState<string | null>(
    null
  );
  const { threads } = useAllThreads();

  const createAllRooms = useCallback(async () => {
    await fetch("/api/liveblocks-rooms", {
      method: "POST",
    });
  }, []);

  // const handleRowFocusChange = useCallback((customerId: string) => {
  //   setFocusedCustomerId((focusedCustomerId) =>
  //     focusedCustomerId === customerId ? null : customerId
  //   );
  // }, []);

  return (
    <>
      <main className="content">
        <ClientSideSuspense fallback={<Loading />}>
          <ul className="rows">
            {customerIds.map((customerId) => (
              <CustomerRow
                key={customerId}
                customerId={customerId}
                onRowFocusChange={setFocusedCustomerId}
                isFocused={focusedCustomerId === customerId}
                hasThread={
                  threads?.some(
                    (thread) => thread.roomId === `zeni:${customerId}`
                  ) ?? false
                }
              />
            ))}
          </ul>
        </ClientSideSuspense>
      </main>
      <header className="header">
        <button className="button" onClick={createAllRooms}>
          Create all rooms
        </button>
      </header>
    </>
  );
}

function CustomerRow({ isFocused, customerId, ...props }: RowProps) {
  if (isFocused) {
    return (
      <RoomProvider id={`zeni:${customerId}`}>
        <LiveblocksRow
          customerId={customerId}
          isFocused={isFocused}
          {...props}
        />
      </RoomProvider>
    );
  }

  return <Row customerId={customerId} isFocused={isFocused} {...props} />;
}

function LiveblocksRow(props: RowProps) {
  const { threads, isLoading } = useThreads();

  return (
    <Row
      {...props}
      thread={threads && threads.length > 0 ? threads[0] : undefined}
      isLoading={isLoading}
    />
  );
}

function Row({
  customerId,
  onRowFocusChange,
  isFocused,
  isLoading,
  thread,
  hasThread,
  onClick,
  ...props
}: RowProps) {
  const handleClick = useCallback(
    (event: MouseEvent<HTMLLIElement>) => {
      onClick?.(event);

      if (event.isDefaultPrevented()) {
        return;
      }

      event.stopPropagation();

      onRowFocusChange(customerId);
    },
    [onRowFocusChange, customerId]
  );

  return (
    <li
      onClick={handleClick}
      className="row"
      data-focused={isFocused ? "" : undefined}
      {...props}
    >
      <div className="row-info">
        <span className="row-info-primary">
          <span>zeni:{customerId}</span>
          {hasThread && <div className="row-dot" />}
        </span>
        <small className="row-info-secondary">
          {isFocused ? (
            <>
              Connected to Liveblocks via <code>RoomProvider</code>
            </>
          ) : (
            <>Not connected to Liveblocks</>
          )}
        </small>
      </div>
      {(thread || isFocused) && (
        <div className="row-comments">
          {thread ? (
            <Thread
              thread={thread}
              className="row-comments-thread"
              showComposer
            />
          ) : isLoading && hasThread ? (
            <Loading />
          ) : (
            <>
              <div className="empty">No thread yet.</div>
              <Composer
                className="row-comments-composer"
                overrides={{ COMPOSER_PLACEHOLDER: "Create thread…" }}
              />
            </>
          )}
        </div>
      )}
    </li>
  );
}
