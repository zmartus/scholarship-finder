import Anthropic from "@anthropic-ai/sdk";

let _client: Anthropic | null = null;

export function getClaude(): Anthropic {
  if (_client) return _client;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not set");
  _client = new Anthropic({ apiKey });
  return _client;
}

export const MATCH_MODEL = "claude-sonnet-4-6";
