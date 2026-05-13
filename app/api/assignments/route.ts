export async function GET() {
  return Response.json({
    version: 4,
    assignments: [
      { node_id: "node-a", layer_start: 0,  layer_end: 8  },
      { node_id: "node-b", layer_start: 9,  layer_end: 18 },
      { node_id: "node-c", layer_start: 19, layer_end: 27 },
    ],
  });
}
