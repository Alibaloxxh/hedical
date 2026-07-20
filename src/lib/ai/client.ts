const BASE_URL = "https://api.groq.com/openai/v1/chat/completions";

export const TEXT_MODEL = "llama-3.3-70b-versatile";
export const VISION_MODEL = "qwen/qwen3.6-27b";
export const MAX_TOKENS = 4096;

interface GroqMessage {
  role: string;
  content: string | GroqContentPart[];
}

type GroqContentPart =
  | { type: "text"; text: string }
  | { type: "image_url"; image_url: { url: string } };

interface GroqResponse {
  choices: { message: { content: string | null } }[];
}

export function getGroqApiKey(): string {
  const key = process.env.GROQ_API_KEY;
  if (!key) {
    throw new Error("GROQ_API_KEY is not configured in environment variables.");
  }
  return key;
}

const MAX_RETRIES = 3;

function isRateLimit(status: number, body: string): boolean {
  if (status === 429) return true;
  if (status === 413 && body.includes("rate_limit_exceeded")) return true;
  return false;
}

async function fetchWithRetry(url: string, options: RequestInit, retries = MAX_RETRIES): Promise<Response> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    const res = await fetch(url, options);
    if (res.ok) return res;

    const errorText = await res.text().catch(() => "No error body");

    if (isRateLimit(res.status, errorText) && attempt < retries) {
      const wait = Math.pow(4, attempt) * 1000 + Math.random() * 2000;
      await new Promise((r) => setTimeout(r, wait));
      continue;
    }

    throw new Error(`Groq API error (${res.status}): ${errorText}`);
  }
  throw new Error("Groq API error (rate limit): max retries exceeded");
}

export async function callGroq(params: {
  model: string;
  messages: GroqMessage[];
  max_tokens?: number;
  reasoning_effort?: "none" | "default";
  reasoning_format?: "raw" | "parsed" | "hidden";
  response_format?: { type: "json_object" };
}): Promise<string> {
  const apiKey = getGroqApiKey();

  const body: Record<string, unknown> = {
    model: params.model,
    messages: params.messages,
    max_tokens: params.max_tokens ?? MAX_TOKENS,
  };

  if (params.reasoning_effort) {
    body.reasoning_effort = params.reasoning_effort;
  }
  if (params.reasoning_format) {
    body.reasoning_format = params.reasoning_format;
  }
  if (params.response_format) {
    body.response_format = params.response_format;
  }

  const res = await fetchWithRetry(BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  const json = (await res.json()) as GroqResponse;
  const content = json.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("Groq returned an empty response");
  }

  return content.trim();
}
