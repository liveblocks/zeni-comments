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

const groups = ["Pro", "Growth", "Enterprise"];

const plans = ["tax pro", "payroll", "accounting"];

const seconds = (n: number) => n * 1000;

export default function Page() {
  const [numberOfExamples, setNumberOfExamples] = useState(10);
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
  const { data, error, isLoading } = useSWR(
    "https://dev.dev-liveblocks5948.workers.dev/v2/c/threads",
    fetcher,
    {
      refreshInterval: seconds(5),
    }
  );

  console.log(data, error, isLoading);

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
    <table style={{ width: "100%", margin: 50 }}>
      <thead>
        <tr>
          <th style={{ width: "20%" }}>Name</th>
          <th style={{ width: "20%" }}>Group</th>
          <th style={{ width: "20%" }}>Plan</th>
          <th style={{ width: "20%" }}>Using RoomProvider</th>
          <th style={{ width: "20%" }}>Thread</th>
        </tr>
      </thead>
      <tbody>
        {customerIds.map((customerId) => (
          <CustomerRow
            key={customerId}
            customerId={customerId.toString()}
            onClick={setFocusedCustomerId}
            focused={focusedCustomerId === customerId.toString()}
          />
        ))}
      </tbody>
      <tfoot>
        <tr>
          <td colSpan={4}>
            <button
              className="load-more"
              onClick={() => setNumberOfExamples(numberOfExamples + 10)}
            >
              Load more
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
}: {
  customerId: string;
  focused: boolean;
  onClick: (customerId: string) => void;
}) {
  if (focused) {
    return (
      <RoomProvider id={`liveblocks:examples:nextjs-comments:${customerId}`}>
        <LiveblocksRow
          customerId={customerId}
          onClick={onClick}
          focused={focused}
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
    />
  );
}

function LiveblocksRow({
  customerId,
  onClick,
  focused,
}: {
  customerId: string;
  onClick: (customerId: string) => void;
  focused: boolean;
}) {
  const { threads } = useThreads();

  // disabling for now
  // const room = useRoom();
  // useEffect(() => {
  //   room.connect();

  //   return () => {
  //     // TODO: understand why this is called on focus
  //     console.log("unmounting", customerId);
  //     room.disconnect();
  //   };
  // });

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
}: {
  customerId: string;
  onClick: (customerId: string) => void;
  focused: boolean;
  thread: null | ThreadData;
}) {
  return (
    <tr key={customerId} onClick={() => onClick(customerId)}>
      <td>{"Customer " + customerId}</td>
      <td>
        {/* Random group using customerId value */}
        {groups[parseInt(customerId) % groups.length]}
      </td>
      <td>
        {/* Random plan or none "-" using customerId value */}
        {parseInt(customerId) % 2 === 0
          ? plans[parseInt(customerId) % plans.length]
          : "-"}
      </td>
      <td>{focused.toString()}</td>
      <td>
        {thread ? <Thread thread={thread} /> : focused ? <Composer /> : "-"}
      </td>
    </tr>
  );
}
