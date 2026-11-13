import { connection } from "next/server";
import { createBroadcast, getLatestBroadcast } from "@/lib/broadcast-server";

const NO_STORE = { "Cache-Control": "no-store" };

/** Latest broadcast — every open page polls this to know when to show the greeting. */
export async function GET() {
  await connection();
  try {
    return Response.json(await getLatestBroadcast(), { headers: NO_STORE });
  } catch (err) {
    console.error(err);
    return Response.json(null, { status: 500, headers: NO_STORE });
  }
}

/** Sends the greeting to everyone (triggered from the unlisted /control page). */
export async function POST() {
  try {
    return Response.json(await createBroadcast(), { status: 201, headers: NO_STORE });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "No se pudo enviar. Inténtalo de nuevo." }, { status: 500, headers: NO_STORE });
  }
}
