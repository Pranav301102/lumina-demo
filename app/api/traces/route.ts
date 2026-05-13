import { getTraces } from "@/lib/traceStore";
import { generateTraces } from "@/lib/simulatedData";

export async function GET() {
  const real = getTraces();
  // Pad with simulated historical traces if fewer than 5 real ones yet
  const simCount = Math.max(0, 10 - real.length);
  const sim = simCount > 0 ? generateTraces(simCount) : [];
  return Response.json({ traces: [...real, ...sim] });
}
