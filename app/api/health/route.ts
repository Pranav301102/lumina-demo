import { getRequestsServed, getUptimeSeconds } from "@/lib/simulatedData";

export async function GET() {
  return Response.json({
    tracker_status:       "healthy",
    inference_api_status: "healthy",
    cluster_status:       "healthy",
    active_nodes:         3,
    total_nodes:          3,
    data_sharing_links:   3,
    requests_served:      getRequestsServed(),
    uptime_seconds:       getUptimeSeconds(),
    model:                "Qwen/Qwen2.5-1.5B-Instruct",
    split_config: {
      node_a: "0–8   (9 layers)",
      node_b: "9–18  (10 layers)",
      node_c: "19–27 (9 layers)",
    },
  });
}
