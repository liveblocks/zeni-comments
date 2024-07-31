import { NextRequest, NextResponse } from "next/server";
import { LIVEBLOCKS_BASE_URL } from "../../../constants";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  console.log(request.bodyUsed);
  const res = await fetch(`${LIVEBLOCKS_BASE_URL}/v2/users/user-1/threads`, {
    headers: {
      Authorization: `Bearer ${process.env.LIVEBLOCKS_SECRET_KEY}`,
    },
  });

  const data = await res.json();
  console.log(data);
  return NextResponse.json(data);
}
