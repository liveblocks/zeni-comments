import { Liveblocks } from "@liveblocks/node";
import { NextRequest, NextResponse } from "next/server";
import { LIVEBLOCKS_BASE_URL } from "../../../constants";

const liveblocks = new Liveblocks({
  secret: process.env.LIVEBLOCKS_SECRET_KEY!,
  // @ts-expect-error
  baseUrl: LIVEBLOCKS_BASE_URL,
});

export async function POST(request: NextRequest) {
  if (!process.env.LIVEBLOCKS_SECRET_KEY) {
    return new NextResponse("Missing LIVEBLOCKS_SECRET_KEY", { status: 403 });
  }

  const username = `user-1`;

  // Quickly create 500 rooms, 0-499
  for (let i = 0; i < 500; i++) {
    await createRoomFromCustomerId(i.toString(), username);
  }

  return new NextResponse(null, { status: 204 });
}

const createRoomFromCustomerId = async (
  customerId: string,
  username: string
) => {
  try {
    const res = await liveblocks.createRoom(`zeni:${customerId}`, {
      defaultAccesses: [],
      usersAccesses: {
        [username]: ["room:write"],
      },
    });

    console.log(res);
  } catch (error) {
    console.error(error);
  }
};
