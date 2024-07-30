"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { RoomProvider, useThreads } from "@liveblocks/react/suspense";
import { Loading } from "../components/Loading";
import { Composer, Thread } from "@liveblocks/react-ui";
import { ClientSideSuspense } from "@liveblocks/react";
import { ErrorBoundary } from "react-error-boundary";

/**
 * Displays a list of threads, along with a composer for creating
 * new threads.
 */

function Example() {
  const { threads } = useThreads();

  return (
    <main>
      {threads.map((thread) => (
        <Thread key={thread.id} thread={thread} className="thread" />
      ))}
      <Composer className="composer" disabled={false} />
    </main>
  );
}

export default function Page() {
  // 10 rooms are created for the example
  const [numberOfExamples, setNumberOfExamples] = useState(10);

  const [exampleIds, setExampleIds] = useState(() =>
    Array.from({ length: numberOfExamples }, (_, i) => i)
  );

  useEffect(() => {
    setExampleIds((exampleIds) => [
      ...exampleIds,
      ...Array.from(
        { length: numberOfExamples - exampleIds.length },
        (_, i) => exampleIds.length + i
      ),
    ]);
  }, [numberOfExamples]);

  return (
    <div>
      {exampleIds.map((exampleId) => (
        <Room key={exampleId} exampleId={exampleId.toString()} />
      ))}
      {/* Load more button */}
      <button
        className="load-more"
        onClick={() => setNumberOfExamples(numberOfExamples + 10)}
      >
        Load more
      </button>
    </div>
  );
}

function Room(props: { roomId?: string; exampleId?: string }) {
  // const roomId = useExampleRoomId("liveblocks:examples:nextjs-comments");
  const roomId =
    props.roomId ?? props.exampleId
      ? `liveblocks:examples:nextjs-comments:${props.exampleId}`
      : "liveblocks:examples:nextjs-comments";
  return (
    <RoomProvider
      id={roomId}
      autoConnect={false}
      // enablePolling={true}
    >
      <ErrorBoundary
        fallback={
          <div className="error">There was an error while getting threads.</div>
        }
      >
        <ClientSideSuspense fallback={<Loading />}>
          <Example />
        </ClientSideSuspense>
      </ErrorBoundary>
    </RoomProvider>
  );
}
