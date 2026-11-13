import { connection } from "next/server";
import { ValidationError, createWish, getWishes, parseNewWish } from "@/lib/wishes-server";

const NO_STORE = { "Cache-Control": "no-store" };

export async function GET() {
  await connection(); // always read fresh rows at request time
  try {
    const wishes = await getWishes();
    return Response.json(wishes, { headers: NO_STORE });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "No se pudo cargar el árbol." }, { status: 500, headers: NO_STORE });
  }
}

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const wish = await createWish(parseNewWish(form));
    return Response.json(wish, { status: 201, headers: NO_STORE });
  } catch (err) {
    if (err instanceof ValidationError) {
      return Response.json({ error: err.message }, { status: 400, headers: NO_STORE });
    }
    console.error(err);
    return Response.json(
      { error: "No se pudo guardar tu foto. Inténtalo de nuevo." },
      { status: 500, headers: NO_STORE },
    );
  }
}
