import { getSimNodes } from "@/lib/simulatedData";

export async function GET() {
  return Response.json({ nodes: getSimNodes() });
}
