import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest } from "next/server";
import { startTrace, completeTrace } from "@/lib/traceStore";

const SYSTEM_PROMPT = `You are Lumina, a distributed large language model running split across three physical machines:
- Node A (Head, port 8001): runs transformer layers 0–8, handles tokenization and embedding
- Node B (Mid, port 8002): runs transformer layers 9–18, relays hidden states
- Node C (Tail, port 8004): runs transformer layers 19–27, applies lm_head and decodes output

You are helpful, concise, and technically knowledgeable. You can answer any question. When relevant, you may briefly mention your distributed architecture, but don't overdo it — answer the user's actual question first.`;

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "GEMINI_API_KEY not set in .env.local" }, { status: 500 });
  }

  let prompt: string;
  try {
    const body = await req.json();
    prompt = body.prompt?.trim();
    if (!prompt) throw new Error("empty prompt");
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  const requestId = `req-${Date.now().toString(16)}-${Math.random().toString(16).slice(2, 6)}`;
  startTrace(requestId, prompt);

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContentStream([
      { text: SYSTEM_PROMPT },
      { text: prompt },
    ]);

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.stream) {
            const text = chunk.text();
            if (text) controller.enqueue(new TextEncoder().encode(text));
          }
          completeTrace(requestId, true);
        } catch {
          completeTrace(requestId, false);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (err) {
    completeTrace(requestId, false);
    const msg = err instanceof Error ? err.message : "Unknown error";
    return Response.json({ error: msg }, { status: 500 });
  }
}
