import { getTopics, getErrorLog } from "@/lib/sheets";

export async function GET() {
  try {
    const [topics, errors] = await Promise.all([getTopics(), getErrorLog()]);
    return Response.json({ topics, errors });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return Response.json({ error: message }, { status: 500 });
  }
}
