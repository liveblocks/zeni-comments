import { Liveblocks } from "@liveblocks/node";
import { NAMES } from "../../../database";
import { NextRequest, NextResponse } from "next/server";

/**
 * Authenticating your Liveblocks application
 * https://liveblocks.io/docs/authentication
 */

const liveblocks = new Liveblocks({
  secret: process.env.LIVEBLOCKS_SECRET_KEY!,
  // @ts-expect-error
  baseUrl: "https://dev.dev-liveblocks5948.workers.dev/",
});

export async function POST(request: NextRequest) {
  if (!process.env.LIVEBLOCKS_SECRET_KEY) {
    return new NextResponse("Missing LIVEBLOCKS_SECRET_KEY", { status: 403 });
  }

  const username = `user-1`;

  // Quickly create 10 rooms, 0-9
  // for (let i = 0; i < 10; i++) {
  //   await createRoomFromCustomerId(i.toString(), username);
  // }


  /**
   * ID token authentication
   */
  const { status, body } = await liveblocks.identifyUser(username);

  /**
   * Access token authentication
   */
  // // Create a session for the current user (access token auth)
  // const session = liveblocks.prepareSession(`user-${userIndex}`);

  // // Use a naming pattern to allow access to rooms with a wildcard
  // session.allow(`liveblocks:examples:*`, session.FULL_ACCESS);

  // // Authorize the user and return the result
  // const { status, body } = await session.authorize();
  return new NextResponse(body, { status });
}


const createRoomFromCustomerId = async (customerId: string, username: string) => {
  await liveblocks.createRoom(`zeni:${customerId}`, {
    defaultAccesses: [],
    usersAccesses: {
      [username]: ["room:write"],
    },
  })
}