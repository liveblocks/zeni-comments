"use client";

import {
  ComponentProps,
  MouseEvent,
  ReactNode,
  useCallback,
  useState,
} from "react";
import {
  ClientSideSuspense,
  RoomProvider,
  useThreads,
  useUserThreads_experimental,
} from "@liveblocks/react";
import { ThreadData } from "@liveblocks/core";
import { Composer, Thread } from "@liveblocks/react-ui";
import * as Dialog from "@radix-ui/react-dialog";
import { Loading } from "../components/Loading";
import { CollapsedThread } from "../components/CollapsedThread";

interface RowProps extends ComponentProps<"li"> {
  customerId: string;
  onRowFocusChange: (customerId: string) => void;
  isFocused: boolean;
  hasThread: boolean;
  thread?: ThreadData;
  isLoading?: boolean;
}

interface SidebarProps
  extends Omit<Dialog.DialogTriggerProps, "content" | "title"> {
  content?: ReactNode;
  title: ReactNode;
  description: ReactNode;
}

const customerIds = Array.from({ length: 20 }, (_, index) => `${index}`);

export default function Page() {
  const [focusedCustomerId, setFocusedCustomerId] = useState<string | null>(
    null
  );
  const { threads, isLoading: isLoadingAllThreads } =
    useUserThreads_experimental();

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
        <Sidebar
          title="Comments"
          description="All threads for current user"
          content={
            <div className="sidebar-threads">
              {isLoadingAllThreads ? (
                <Loading />
              ) : (
                threads?.map((thread) => (
                  <CollapsedThread
                    key={thread.id}
                    thread={thread}
                    className="sidebar-thread"
                  />
                ))
              )}
            </div>
          }
        >
          <button className="button square" aria-label="View all comments">
            <svg
              width="20"
              height="20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="m6.615 16.128.484-.874a1 1 0 0 0-.8-.074l.316.948ZM2.5 17.5l-.949-.316a1 1 0 0 0 1.265 1.265L2.5 17.5Zm1.372-4.115.948.316a1 1 0 0 0-.074-.8l-.874.484ZM10 18a8 8 0 0 0 8-8h-2a6 6 0 0 1-6 6v2Zm-3.87-.997A7.968 7.968 0 0 0 10 18v-2a5.968 5.968 0 0 1-2.901-.746l-.969 1.75ZM2.816 18.45l4.115-1.372-.633-1.897-4.114 1.371.632 1.898Zm.107-5.38L1.55 17.184l1.898.632 1.371-4.114-1.897-.633ZM2 10c0 1.402.361 2.722.997 3.87l1.75-.969A5.968 5.968 0 0 1 4 10H2Zm8-8a8 8 0 0 0-8 8h2a6 6 0 0 1 6-6V2Zm8 8a8 8 0 0 0-8-8v2a6 6 0 0 1 6 6h2Z"
                fill="currentColor"
              />
            </svg>
          </button>
        </Sidebar>
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

function Sidebar({
  children,
  title,
  description,
  content,
  ...props
}: SidebarProps) {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild {...props}>
        {children}
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="sidebar-overlay" />
        <Dialog.Content className="sidebar-content">
          <header className="sidebar-header">
            <Dialog.Title className="sidebar-title">{title}</Dialog.Title>
            <Dialog.Close className="button square" aria-label="Close">
              <svg
                width="20"
                height="20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M15 5 5 15M5 5l10 10"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Dialog.Close>
          </header>
          <Dialog.Description className="sidebar-description">
            {description}
          </Dialog.Description>
          {content}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
