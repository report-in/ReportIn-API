import fetch from "node-fetch";
import { logger } from "./logger";

export const postJson = async <T = any>(
  endpoint: string,
  body: Record<string, any>
): Promise<T | null> => {
  try {
    const res = await fetch(`${process.env.BASE_URL}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`HTTP ${res.status} - ${text}`);
    }

    return (await res.json()) as T;
  } catch (err: any) {
    logger.error(`postJson failed: ${err.message}`);
    return null;
  }
};