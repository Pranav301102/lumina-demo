import { generateTraces } from "@/lib/simulatedData";

export async function GET() {
  return Response.json({ traces: generateTraces(20) });
}
