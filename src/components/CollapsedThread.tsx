"use client";

import clsx from "clsx";
import { ComponentProps, useMemo, useState } from "react";
import { ThreadData } from "@liveblocks/client";
import { RoomProvider, useUser } from "@liveblocks/react";
import { Thread, useOverrides } from "@liveblocks/react-ui";
import {
  Timestamp,
  Comment,
  CommentBodyLinkProps,
  CommentLinkProps,
} from "@liveblocks/react-ui/primitives";

interface CollapsedThreadProps extends ComponentProps<"div"> {
  thread: ThreadData;
}

export interface AvatarProps extends ComponentProps<"div"> {
  userId: string;
}

interface UserProps extends ComponentProps<"span"> {
  userId: string;
}

interface CommentMentionProps extends ComponentProps<"span"> {
  userId: string;
}

function getInitials(name: string) {
  return name
    .trim()
    .split(" ")
    .reduce((initials, name, index, array) => {
      if (index === 0 || index === array.length - 1) {
        initials += name.charAt(0).toLocaleUpperCase();
      }

      return initials;
    }, "");
}

export function Avatar({ userId, className, ...props }: AvatarProps) {
  const { user, isLoading } = useUser(userId);
  const resolvedUserName = useMemo(() => user?.name, [user]);
  const resolvedUserAvatar = useMemo(() => user?.avatar, [user]);
  const resolvedUserInitials = useMemo(
    () => (resolvedUserName ? getInitials(resolvedUserName) : undefined),
    [resolvedUserName]
  );
  const resolvedUserIdInitials = useMemo(
    () => (!isLoading && !user ? getInitials(userId) : undefined),
    [isLoading, user, userId]
  );

  return (
    <div
      className={clsx("lb-avatar", className)}
      data-loading={isLoading ? "" : undefined}
      {...props}
    >
      {resolvedUserAvatar && (
        <img
          className="lb-avatar-image"
          src={resolvedUserAvatar}
          alt={resolvedUserName}
        />
      )}
      {resolvedUserInitials ? (
        <span className="lb-avatar-fallback" aria-hidden>
          {resolvedUserInitials}
        </span>
      ) : resolvedUserIdInitials ? (
        <span className="lb-avatar-fallback" aria-label={userId} title={userId}>
          {resolvedUserIdInitials}
        </span>
      ) : null}
    </div>
  );
}

function User({ userId, className, ...props }: UserProps) {
  const { user, isLoading } = useUser(userId);
  const $ = useOverrides();
  const resolvedUserName = useMemo(() => {
    return user?.name ?? $.USER_UNKNOWN;
  }, [userId, $.USER_SELF, $.USER_UNKNOWN, user?.name]);

  return (
    <span
      className={clsx("lb-name lb-user", className)}
      data-loading={isLoading ? "" : undefined}
      {...props}
    >
      {isLoading ? null : resolvedUserName}
    </span>
  );
}

function CommentMention({ userId, className, ...props }: CommentMentionProps) {
  return (
    <Comment.Mention
      className={clsx("lb-comment-mention", className)}
      {...props}
    >
      @
      <User userId={userId} />
    </Comment.Mention>
  );
}

function CommentLink({
  href,
  children,
  className,
  ...props
}: CommentBodyLinkProps & CommentLinkProps) {
  return (
    <Comment.Link
      className={clsx("lb-comment-link", className)}
      href={href}
      {...props}
    >
      {children}
    </Comment.Link>
  );
}

function UncollapsedThread({ thread, ...props }: CollapsedThreadProps) {
  return (
    <RoomProvider id={thread.roomId}>
      <Thread thread={thread} {...props} />
    </RoomProvider>
  );
}

export function CollapsedThread({ thread, ...props }: CollapsedThreadProps) {
  const [isCollapsed, setCollapsed] = useState(true);
  const existingComments = thread.comments.filter(
    (comment) => !comment.deletedAt
  );
  const firstComment = existingComments[0];
  const numberOfHiddenComments = existingComments.length - 1;
  const $ = useOverrides();

  return (
    <div {...props}>
      {isCollapsed ? (
        <>
          <div className="lb-root lb-comment">
            <div className="lb-comment-header">
              <div className="lb-comment-details">
                <Avatar
                  className="lb-comment-avatar"
                  userId={firstComment.userId}
                />
                <span className="lb-comment-details-labels">
                  <User
                    className="lb-comment-author"
                    userId={firstComment.userId}
                  />
                  <span className="lb-comment-date">
                    <Timestamp
                      locale={$.locale}
                      date={firstComment.createdAt}
                      className="lb-comment-date-created"
                    />
                    {firstComment.editedAt && firstComment.body && (
                      <>
                        {" "}
                        <span className="lb-comment-date-edited">
                          {$.COMMENT_EDITED}
                        </span>
                      </>
                    )}
                  </span>
                </span>
              </div>
            </div>
            <div className="lb-comment-content">
              <Comment.Body
                className="lb-comment-body"
                body={firstComment.body}
                components={{
                  Mention: ({ userId }) => <CommentMention userId={userId} />,
                  Link: CommentLink,
                }}
              />
            </div>
          </div>
          <div className="collapsed-thread-actions">
            <button className="button" onClick={() => setCollapsed(false)}>
              Reply
              {numberOfHiddenComments > 0
                ? ` (${numberOfHiddenComments} more comment${
                    numberOfHiddenComments > 1 ? "s" : ""
                  })`
                : ""}
            </button>
          </div>
        </>
      ) : (
        <UncollapsedThread thread={thread} />
      )}
    </div>
  );
}
