"use client";

import { useCallback, useEffect, useState } from "react";
import { RoomProvider, useThreads } from "@liveblocks/react/suspense";
import { Loading } from "../components/Loading";
import { ClientSideSuspense, useRoom } from "@liveblocks/react";
import { ErrorBoundary } from "react-error-boundary";
import { ThreadData } from "@liveblocks/core";
import useSWR from "swr";
import { Composer, Thread } from "@liveblocks/react-ui";
import { useAuth } from "./Providers";

const seconds = (n: number) => n * 1000;

export default function Page() {
  const [numberOfExamples, setNumberOfExamples] = useState(500);
  const [focusedCustomerId, setFocusedCustomerId] = useState<string | null>(
    null
  );
  const { token } = useAuth();

  const fetcher = useCallback(
    async (url: string) => {
      if (!token) {
        console.log("No token");
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
  const { data } = useSWR<{ threads: ThreadData[] }>(
    "https://dev.dev-liveblocks5948.workers.dev/v2/c/threads",
    fetcher,
    {
      refreshInterval: seconds(5),
    }
  );

  const [customerIds, setcustomerIds] = useState(() =>
    Array.from({ length: numberOfExamples }, (_, i) => i)
  );

  useEffect(() => {
    setcustomerIds((customerIds) => [
      ...customerIds,
      ...Array.from(
        { length: numberOfExamples - customerIds.length },
        (_, i) => customerIds.length + i
      ),
    ]);
  }, [numberOfExamples]);

  return (
    <table style={{ width: "100%", margin: 50, color: "white" }}>
      <thead>
        <tr>
          <th style={{ width: "20%", minWidth: "150px" }}>Name</th>
          <th style={{ minWidth: "150px" }}>has thread</th>
          <th style={{ width: "20%", minWidth: "150px" }}>
            Using RoomProvider
          </th>
          <th style={{ width: "20%", minWidth: "150px" }}>Thread</th>
        </tr>
      </thead>
      <tbody>
        {customerIds.map((customerId) => (
          <CustomerRow
            key={customerId}
            customerId={customerId.toString()}
            onClick={setFocusedCustomerId}
            focused={focusedCustomerId === customerId.toString()}
            hasThread={
              data?.threads.some(
                (thread) => thread.roomId === `zeni:${customerId.toString()}`
              ) ?? false
            }
          />
        ))}
      </tbody>
      <tfoot>
        <tr>
          <td colSpan={4}>
            <button
              onClick={async () => {
                await fetch("/api/liveblocks-rooms", {
                  method: "POST",
                });
              }}
            >
              Create rooms
            </button>
          </td>
        </tr>
      </tfoot>
    </table>
  );
}

function CustomerRow({
  customerId,
  focused,
  onClick,
  hasThread,
}: {
  customerId: string;
  focused: boolean;
  onClick: (customerId: string) => void;
  hasThread: boolean;
}) {
  if (focused) {
    return (
      <RoomProvider id={`zeni:${customerId}`}>
        <LiveblocksRow
          customerId={customerId}
          onClick={onClick}
          focused={focused}
          hasThread={hasThread}
        />
      </RoomProvider>
    );
  }

  return (
    <Row
      customerId={customerId}
      onClick={onClick}
      focused={focused}
      thread={null}
      hasThread={hasThread}
    />
  );
}

function LiveblocksRow({
  customerId,
  onClick,
  focused,
  hasThread,
}: {
  customerId: string;
  onClick: (customerId: string) => void;
  focused: boolean;
  hasThread: boolean;
}) {
  const { threads } = useThreads();

  return (
    <ErrorBoundary
      fallback={
        <div className="error">There was an error while getting threads.</div>
      }
    >
      <ClientSideSuspense fallback={<Loading />}>
        <Row
          customerId={customerId}
          onClick={onClick}
          focused={focused}
          thread={threads.length > 0 ? threads[0] : null}
          hasThread={hasThread}
        />
      </ClientSideSuspense>
    </ErrorBoundary>
  );
}

function Row({
  customerId,
  onClick,
  focused,
  thread,
  hasThread,
}: {
  customerId: string;
  onClick: (customerId: string) => void;
  focused: boolean;
  thread: null | ThreadData;
  hasThread: boolean;
}) {
  return (
    <tr key={customerId} onClick={() => onClick(customerId)}>
      <td>{"zeni:" + customerId}</td>
      <td>{hasThread ? "✅" : "🛑"}</td>
      <td>{focused ? "✅" : "🛑"}</td>
      <td>
        {thread ? <Thread thread={thread} /> : focused ? <Composer /> : "-"}
      </td>
    </tr>
  );
}
